
import React, { useState, useCallback, useEffect } from 'react';
import type { Agent, Message, Project, AgentRole } from './types';
import { MessageSender } from './types';
import { AGENTS, PROJECTS, WELCOME_QUOTE, MOCK_RESPONSES, PAST_CHATS, MOCK_CHAT_HISTORY } from './constants';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import PromptInput from './components/PromptInput';
import ShareModal from './components/ShareModal';
import RenameChatModal from './components/RenameChatModal';
import NewProjectModal from './components/NewProjectModal';
import AddAgentModal from './components/AddAgentModal';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatToShare, setChatToShare] = useState<{id: string, title: string} | null>(null);
  const [chatToRename, setChatToRename] = useState<{id: string, title: string} | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  const updateChatHistory = (conversationId: string, message: Message) => {
    setChatHistories(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));
  };

  const handleSendMessage = useCallback((text: string, selectedAgentIds: string[]) => {
    if (!text.trim() || isResponding) return;
    
    const projectAgents = currentProject ? AGENTS.filter(agent => currentProject.roles.some(r => r.agentId === agent.id)) : AGENTS;

    let conversationId: string;

    if (currentProject) {
      // We are in a project context. The conversation ID is the project's ID.
      // We do NOT create a new chat in the sidebar.
      conversationId = currentProject.id;
    } else if (activeChatId) {
      // We are in an existing chat.
      conversationId = activeChatId;
    } else {
      // This is the first message of a new chat. Create it.
      const newChatId = `chat-${Date.now()}`;
      const newChatTitle = text.length > 35 ? text.substring(0, 32) + '...' : text;
      const newChat = { id: newChatId, title: newChatTitle };
      
      setPastChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      conversationId = newChatId;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: MessageSender.USER,
      senderId: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    updateChatHistory(conversationId, userMessage);
    setIsResponding(true);

    const agentsToRespond = selectedAgentIds.length > 0
      ? projectAgents.filter(a => selectedAgentIds.includes(a.id))
      : projectAgents.filter(a => text.toLowerCase().includes(a.name.toLowerCase())).length > 0
      ? projectAgents.filter(a => text.toLowerCase().includes(a.name.toLowerCase()))
      : projectAgents;
    
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
            updateChatHistory(conversationId, finalMessage);
            if (index === agentsToRespond.length - 1) {
              setIsResponding(false);
            }
          }
        }, 30);
      }, responseDelay);
      responseDelay += 500;
    });
  }, [isResponding, currentProject, activeChatId]);

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setCurrentProject(null);
    setSelectedAgents([]);
  };
  
  const handleSelectChat = (chatId: string) => {
    setMessages(chatHistories[chatId] || []);
    setActiveChatId(chatId);
    setCurrentProject(null); // Deselect project when a past chat is opened
    setSelectedAgents([]);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setPastChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat));
    setChatToRename(null);
  };

  const handleShareChat = (chatId: string) => {
    const chat = pastChats.find(c => c.id === chatId);
    if(chat) {
      setChatToShare(chat);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      setMessages(chatHistories[projectId] || []);
      setActiveChatId(null);
      setSelectedAgents([]);
    }
  };

  const handleCreateProject = (projectName: string, selectedAgentIds: string[]) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      roles: selectedAgentIds.map(agentId => ({
        agentId,
        role: `You are a helpful assistant.` // Default role
      })),
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
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
    return AGENTS.find(a => a.id === agentId);
  };
  
  const agentsInCurrentProject = currentProject
    ? AGENTS.filter(agent => currentProject.roles.some(r => r.agentId === agent.id))
    : AGENTS;
    
  const agentsNotInCurrentProject = currentProject
    ? AGENTS.filter(agent => !currentProject.roles.some(r => r.agentId === agent.id))
    : [];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-poppins">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        onNewChat={handleNewChat}
        onShowNewProjectModal={() => setShowNewProjectModal(true)}
        projects={projects}
        agents={AGENTS}
        currentProjectId={currentProject?.id || ''}
        onProjectSelect={handleProjectSelect}
        pastChats={pastChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onShareChat={handleShareChat}
        onShowRenameModal={(chat) => setChatToRename(chat)}
      />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <ChatView
            messages={messages}
            getAgentById={getAgentById}
            isResponding={isResponding}
            welcomeQuote={messages.length === 0 && !currentProject && !activeChatId ? WELCOME_QUOTE : undefined}
            currentProject={currentProject}
            onShowProjectSettings={() => setShowProjectSettings(true)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        </div>
        <div className="px-4 pb-4 w-full max-w-4xl mx-auto z-10">
           <PromptInput 
              onSendMessage={handleSendMessage}
              isResponding={isResponding}
              availableAgents={agentsInCurrentProject}
              isProjectContext={!!currentProject}
              onShowAddAgentModal={() => setShowAddAgentModal(true)}
              selectedAgents={selectedAgents}
              onSelectedAgentsChange={setSelectedAgents}
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
      {chatToShare && (
        <ShareModal 
          chat={chatToShare}
          onClose={() => setChatToShare(null)}
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
