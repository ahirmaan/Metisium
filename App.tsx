import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Agent, Message, Project, AgentRole, SubChat } from './types';
import { MessageSender } from './types';
import { AGENTS, PROJECTS, WELCOME_QUOTE, MOCK_RESPONSES, PAST_CHATS, MOCK_CHAT_HISTORY } from './constants';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import PromptInput from './components/PromptInput';
import RenameChatModal from './components/RenameChatModal';
import NewProjectModal from './components/NewProjectModal';
import AddAgentModal from './components/AddAgentModal';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const METISIUM_AGENT: Agent = { id: 'metisium', name: 'Metisium', avatar: 'https://i.imgur.com/v1hDKa8.png' };

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('metisium_projects');
      return savedProjects ? JSON.parse(savedProjects) : PROJECTS;
    } catch (error) {
      console.error('Could not load projects from localStorage', error);
      return PROJECTS;
    }
  });

  const [pastChats, setPastChats] = useState<{ id: string; title: string }[]>(() => {
    try {
      const saved = localStorage.getItem('metisium_past_chats');
      return saved ? JSON.parse(saved) : PAST_CHATS;
    } catch (error) {
      console.error('Could not load past chats from localStorage', error);
      return PAST_CHATS;
    }
  });

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('metisium_chat_histories');
      return saved ? JSON.parse(saved) : MOCK_CHAT_HISTORY;
    } catch (error) {
      console.error('Could not load chat histories from localStorage', error);
      return MOCK_CHAT_HISTORY;
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem('metisium_projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Could not save projects to localStorage', error);
    }
  }, [projects]);
  
  useEffect(() => {
    try {
      localStorage.setItem('metisium_past_chats', JSON.stringify(pastChats));
    } catch (error) {
      console.error('Could not save past chats to localStorage', error);
    }
  }, [pastChats]);
  
  useEffect(() => {
    try {
      localStorage.setItem('metisium_chat_histories', JSON.stringify(chatHistories));
    } catch (error) {
      console.error('Could not save chat histories to localStorage', error);
    }
  }, [chatHistories]);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeSubChat, setActiveSubChat] = useState<SubChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<{id: string, title: string} | null>(null);

  const updateChatHistory = (conversationId: string, message: Message) => {
    setChatHistories(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isResponding) return;
    
    let conversationId: string | null = null;

    if (activeSubChat) {
      conversationId = activeSubChat.id;
    } else if (activeChatId) {
      conversationId = activeChatId;
    } else {
      const newChatId = `chat-${Date.now()}`;
      const newChatTitle = text.length > 35 ? text.substring(0, 32) + '...' : text;
      const newChat = { id: newChatId, title: newChatTitle };
      
      setPastChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      conversationId = newChatId;
    }

    if (!conversationId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: MessageSender.USER,
      senderId: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    updateChatHistory(conversationId, userMessage);
    
    const mentionedAgentNames = text.match(/@(\w+)/g)?.map(m => m.substring(1).toLowerCase()) || [];
    const isCombinedRequest = mentionedAgentNames.length === 0;

    if (isCombinedRequest) {
      setIsResponding(true);
      const orchestratorMessage: Message = {
        id: `msg-${Date.now()}-metisium`,
        text: '',
        sender: MessageSender.AGENT,
        senderId: 'metisium',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, orchestratorMessage]);

      try {
        const agentsForContext = currentProject ? AGENTS.filter(agent => currentProject.roles.some(r => r.agentId === agent.id)) : AGENTS;
        const agentRoles = agentsForContext.map(agent => {
            const roleInfo = currentProject?.roles.find(r => r.agentId === agent.id);
            return `- ${agent.name}: ${roleInfo ? roleInfo.role : 'A general purpose AI assistant.'}`;
        }).join('\n');

        // FIX: The user query should not be part of the system instruction; it should be passed in `contents`.
        const systemInstruction = `You are Metisium, an AI orchestrator. Your task is to provide a single, synthesized response to the user's query by considering the perspectives and specializations of the following AI agents:\n\n${agentRoles}\n\nBased on the agents' roles, generate a comprehensive, cohesive response that synthesizes their likely contributions. Do not list what each agent would say. Instead, provide a single, unified answer as the orchestrator.`;
        
        // FIX: `contents` should be a simple string for a single user prompt.
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: text,
            config: { systemInstruction }
        });

        let combinedText = '';
        for await (const chunk of responseStream) {
            combinedText += chunk.text;
            setMessages(prev => prev.map(m => m.id === orchestratorMessage.id ? { ...m, text: combinedText } : m));
        }
        const finalMessage = { ...orchestratorMessage, text: combinedText };
        updateChatHistory(conversationId, finalMessage);

      } catch(e) {
          console.error(e);
          const errorMessage: Message = {
              ...orchestratorMessage,
              text: "Sorry, I encountered an error trying to generate a combined response.",
          };
          setMessages(prev => prev.map(m => m.id === orchestratorMessage.id ? errorMessage : m));
          updateChatHistory(conversationId, errorMessage);
      } finally {
          setIsResponding(false);
      }
    } else {
        setIsResponding(true);
        const agentsInContext = currentProject ? AGENTS.filter(a => currentProject.roles.some(r => r.agentId === a.id)) : AGENTS;
        const agentsToRespond = agentsInContext.filter(agent => mentionedAgentNames.includes(agent.name.toLowerCase()));
        
        if (agentsToRespond.length === 0) {
          setIsResponding(false);
          return;
        }

        let responseDelay = 1000;
        agentsToRespond.forEach((agent, index) => {
          setTimeout(() => {
            const projectRole = currentProject?.roles.find(r => r.agentId === agent.id);
            const roleText = projectRole ? projectRole.role : 'default';
            const mockResponse = MOCK_RESPONSES[agent.id]?.[roleText] || MOCK_RESPONSES[agent.id]?.default || "I'm not sure how to respond to that.";

            const agentMessage: Message = {
              id: `msg-${Date.now()}-${agent.id}`,
              text: '',
              sender: MessageSender.AGENT,
              senderId: agent.id,
              timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, agentMessage]);
            
            let charIndex = 0;
            const streamInterval = setInterval(() => {
              if (charIndex < mockResponse.length) {
                const streamedText = mockResponse.substring(0, charIndex + 1);
                setMessages(prev => prev.map(m => m.id === agentMessage.id ? { ...m, text: streamedText } : m));
                charIndex++;
              } else {
                clearInterval(streamInterval);
                const finalMessage = { ...agentMessage, text: mockResponse };
                updateChatHistory(conversationId as string, finalMessage);
                if (index === agentsToRespond.length - 1) {
                  setIsResponding(false);
                }
              }
            }, 30);
          }, responseDelay);
          responseDelay += 500;
        });
    }
  }, [isResponding, currentProject, activeChatId, activeSubChat, chatHistories]);

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setCurrentProject(null);
    setActiveSubChat(null);
  };
  
  const handleSelectChat = (chatId: string) => {
    setMessages(chatHistories[chatId] || []);
    setActiveChatId(chatId);
    setCurrentProject(null); 
    setActiveSubChat(null);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setPastChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat));
    setChatToRename(null);
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setCurrentProject(project);
        // Select the first sub-chat by default
        if (project.subChats.length > 0) {
            handleSelectSubChat(project.id, project.subChats[0].id);
        } else {
            // No sub-chats, clear messages
            setActiveSubChat(null);
            setMessages([]);
        }
        setActiveChatId(null);
    }
  };
  
  const handleSelectSubChat = (projectId: string, subChatId: string) => {
    const project = projects.find(p => p.id === projectId);
    const subChat = project?.subChats.find(sc => sc.id === subChatId);

    if (project && subChat) {
      setCurrentProject(project);
      setActiveSubChat(subChat);
      setMessages(chatHistories[subChatId] || []);
      setActiveChatId(null);
    }
  };

  const handleCreateProject = (projectName: string, selectedAgentIds: string[]) => {
    const newProjectId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: newProjectId,
      name: projectName,
      roles: selectedAgentIds.map(agentId => ({
        agentId,
        role: `You are a helpful assistant.` // Default role
      })),
      subChats: [{ id: `${newProjectId}-sc-1`, title: 'General' }]
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setActiveSubChat(newProject.subChats[0]);
    setMessages([]);
    setActiveChatId(null);
    setShowNewProjectModal(false);
  };

  const handleUpdateProjectRoles = (projectId: string, updatedRoles: AgentRole[]) => {
    setProjects(prevProjects => prevProjects.map(p => 
      p.id === projectId ? { ...p, roles: updatedRoles } : p
    ));
    if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, roles: updatedRoles } : null);
    }
  };

  const handleAddAgentsToProject = (agentIds: string[]) => {
    if (!currentProject) return;

    const newRoles: AgentRole[] = agentIds.map(id => ({
      agentId: id,
      role: 'You are a helpful assistant.'
    }));

    const updatedRoles = [...currentProject.roles, ...newRoles];
    handleUpdateProjectRoles(currentProject.id, updatedRoles);
    setShowAddAgentModal(false);
  };

  const getAgentById = (agentId: string): Agent | undefined => {
    if (agentId === 'metisium') return METISIUM_AGENT;
    return AGENTS.find(a => a.id === agentId);
  };
  
  const agentsInCurrentProject = currentProject
    ? AGENTS.filter(agent => currentProject.roles.some(r => r.agentId === agent.id))
    : AGENTS;
    
  const agentsNotInCurrentProject = currentProject
    ? AGENTS.filter(agent => !currentProject.roles.some(r => r.agentId === agent.id))
    : [];

  return (
    <div className="flex h-screen font-sans">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        onNewChat={handleNewChat}
        onShowNewProjectModal={() => setShowNewProjectModal(true)}
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onProjectSelect={handleProjectSelect}
        pastChats={pastChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        activeSubChatId={activeSubChat?.id || null}
        onSelectSubChat={handleSelectSubChat}
        onShowRenameModal={(chat) => setChatToRename(chat)}
      />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-14' : 'ml-[260px]'}`}>
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <ChatView
            messages={messages}
            getAgentById={getAgentById}
            isResponding={isResponding}
            welcomeQuote={messages.length === 0 && !currentProject && !activeChatId ? WELCOME_QUOTE : undefined}
            currentProject={currentProject}
            activeSubChat={activeSubChat}
            onShowProjectSettings={() => setShowProjectSettings(true)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#212121] to-transparent pointer-events-none"></div>
        </div>
        <div className="px-4 pb-4 w-full max-w-[720px] mx-auto z-10">
           <PromptInput 
              onSendMessage={handleSendMessage}
              isResponding={isResponding}
              availableAgents={agentsInCurrentProject}
              isProjectContext={!!currentProject}
              onShowAddAgentModal={() => setShowAddAgentModal(true)}
           />
        </div>
      </main>
      {showProjectSettings && currentProject && (
        <ProjectSettingsModal
          project={currentProject}
          agents={agentsInCurrentProject}
          onClose={() => setShowProjectSettings(false)}
          onSave={handleUpdateProjectRoles}
        />
      )}
      {showNewProjectModal && (
        <NewProjectModal
          agents={AGENTS}
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
      {showAddAgentModal && currentProject && (
        <AddAgentModal
          availableAgents={agentsNotInCurrentProject}
          onClose={() => setShowAddAgentModal(false)}
          onAddAgents={handleAddAgentsToProject}
        />
      )}
      {chatToRename && (
        <RenameChatModal
          chat={chatToRename}
          onClose={() => setChatToRename(null)}
          onRename={handleRenameChat}
        />
      )}
    </div>
  );
};

export default App;
