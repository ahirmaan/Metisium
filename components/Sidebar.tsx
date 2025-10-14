
import React, { useState } from 'react';
import type { Project, Agent } from '../types';
import { LogoIcon, NewChatIcon, SearchIcon, ProjectsIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon, ShareIcon, FolderPlusIcon, ChevronDownIcon, ChatIcon, UsersIcon } from './icons/Icons';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onShowNewProjectModal: () => void;
  projects: Project[];
  agents: Agent[];
  currentProjectId: string;
  onProjectSelect: (projectId: string) => void;
  pastChats: { id: string; title: string }[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onShareChat: (chatId: string) => void;
  onShowRenameModal: (chat: { id: string; title: string }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed, onToggleCollapse, onNewChat, onShowNewProjectModal, 
    projects, agents, currentProjectId, onProjectSelect,
    pastChats, activeChatId, onSelectChat, onShareChat, onShowRenameModal 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatsVisible, setIsChatsVisible] = useState(true);
  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const filteredChats = pastChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-50 dark:bg-gray-950 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <div className="flex items-center gap-2"><LogoIcon /><span className="text-lg font-semibold text-gray-900 dark:text-white">Metisium</span></div>}
        <button onClick={onToggleCollapse} className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <div className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <SidebarButton icon={<NewChatIcon />} label="New Chat" isCollapsed={isCollapsed} onClick={onNewChat} />
        <SidebarButton icon={<FolderPlusIcon />} label="New Project" isCollapsed={isCollapsed} onClick={onShowNewProjectModal} />
        
        <div className="px-2 pt-1">
          {isCollapsed ? (
              <button onClick={onToggleCollapse} className="w-full flex justify-center items-center h-[34px] rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <SearchIcon className="h-5 w-5" />
              </button>
          ) : (
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                      type="text"
                      name="search"
                      id="search"
                      className="block w-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-9 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Search Chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
          )}
        </div>
        
        {/* Collapsible Chat History */}
        <div className="pt-4">
          <button 
            onClick={() => !isCollapsed && setIsChatsVisible(!isChatsVisible)}
            disabled={isCollapsed}
            className={`w-full flex items-center px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-md ${isCollapsed ? 'justify-center' : 'justify-between'} ${!isCollapsed ? 'hover:bg-gray-200 dark:hover:bg-gray-800' : ''}`}
          >
            <div className="flex items-center gap-2">
              <ChatIcon className="w-4 h-4" />
              {!isCollapsed && <span>Chats</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className={`transition-transform duration-200 ${isChatsVisible ? '' : '-rotate-90'}`} />}
          </button>
          {isChatsVisible && !isCollapsed && (
            <div className="mt-2 space-y-1">
              {filteredChats.map(chat => (
                  <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === activeChatId}
                      onClick={() => onSelectChat(chat.id)}
                      onShare={() => onShareChat(chat.id)}
                      onSettings={() => onShowRenameModal(chat)}
                  />
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-4 mt-2 border-t border-gray-300 dark:border-gray-700">
            <button 
                onClick={() => !isCollapsed && setIsProjectsVisible(!isProjectsVisible)}
                disabled={isCollapsed}
                className={`w-full flex items-center px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-md ${isCollapsed ? 'justify-center' : 'justify-between'} ${!isCollapsed ? 'hover:bg-gray-200 dark:hover:bg-gray-800' : ''}`}
            >
              <div className="flex items-center gap-2">
                <ProjectsIcon className="w-4 h-4" />
                {!isCollapsed && <span>Projects</span>}
              </div>
              {!isCollapsed && <ChevronDownIcon className={`transition-transform duration-200 ${isProjectsVisible ? '' : '-rotate-90'}`} />}
            </button>
            {isProjectsVisible && !isCollapsed && (
                <div className="mt-2 space-y-1">
                    {projects.map(project => (
                        <ProjectItem 
                            key={project.id} 
                            project={project}
                            allAgents={agents}
                            isCollapsed={isCollapsed}
                            isActive={project.id === currentProjectId}
                            onSelect={() => onProjectSelect(project.id)}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className="p-2 border-t border-gray-300 dark:border-gray-700">
        <div className={`flex items-center p-2 rounded-md ${isCollapsed ? 'justify-center' : ''}`}>
          <img src="https://picsum.photos/seed/user/40/40" alt="User Avatar" className="w-8 h-8 rounded-full" />
          {!isCollapsed && (
            <div className="ml-3">
              <span className="font-medium text-gray-900 dark:text-white">Demo User</span>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Free Tier</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarButton: React.FC<{ icon: React.ReactNode; label: string; isCollapsed: boolean; onClick?: () => void;}> = ({ icon, label, isCollapsed, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white group">
        {icon}
        {!isCollapsed && <span className="ml-3">{label}</span>}
    </button>
);

const ProjectItem: React.FC<{ project: Project; isCollapsed: boolean; isActive: boolean; onSelect: () => void; allAgents: Agent[] }> = ({ project, isCollapsed, isActive, onSelect, allAgents }) => {
    const projectAgents = project.roles
      .map(role => allAgents.find(a => a.id === role.agentId))
      .filter((agent): agent is Agent => agent !== undefined)
      .slice(0, 4);

    return (
      <div 
        onClick={onSelect}
        className={`group w-full flex items-center p-2 text-sm font-medium rounded-md cursor-pointer ${isActive ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <div className="flex-shrink-0">
          {projectAgents.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                  {projectAgents.map(agent => (
                      <img key={agent.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-gray-50 dark:ring-gray-950" src={agent.avatar} alt={agent.name} />
                  ))}
              </div>
          ) : (
              <ProjectsIcon className="h-6 w-6" />
          )}
        </div>
        {!isCollapsed && <span className="ml-3 flex-1 whitespace-nowrap truncate">{project.name}</span>}
      </div>
    );
};

const ChatItem: React.FC<{ chat: { id: string; title: string }; isActive: boolean; onClick: () => void; onShare: () => void; onSettings: () => void; }> = ({ chat, isActive, onClick, onShare, onSettings }) => {
    return (
      <button 
        onClick={onClick}
        className={`group w-full flex items-center p-2 text-sm font-medium rounded-md cursor-pointer text-left transition-colors ${isActive ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{chat.title}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-gray-500 dark:text-gray-400">
            <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><ShareIcon className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onSettings(); }} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><SettingsIcon className="w-4 h-4" /></button>
        </div>
      </button>
    );
};

export default Sidebar;
