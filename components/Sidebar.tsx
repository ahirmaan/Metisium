import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import {
  LogoIcon,
  NewChatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ProjectsIcon,
  ChatIcon,
  MoreHorizontalIcon,
  FolderPlusIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  ChevronDownIcon,
} from './icons/Icons';
import ShareModal from './ShareModal';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onShowNewProjectModal: () => void;
  projects: Project[];
  currentProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  pastChats: { id: string; title: string }[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  activeSubChatId: string | null;
  onSelectSubChat: (projectId: string, subChatId: string) => void;
  onShowRenameModal: (chat: { id: string, title: string }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onNewChat,
  onShowNewProjectModal,
  projects,
  currentProjectId,
  onProjectSelect,
  pastChats,
  activeChatId,
  onSelectChat,
  activeSubChatId,
  onSelectSubChat,
  onShowRenameModal,
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [chatActionMenu, setChatActionMenu] = useState<{ chat: {id: string, title: string}, top: number } | null>(null);
  const [chatToShare, setChatToShare] = useState<{id: string, title: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProjectsVisible, setIsProjectsVisible] = useState(true);
  const [isPastChatsVisible, setIsPastChatsVisible] = useState(true);

  useEffect(() => {
    if(currentProjectId) {
      setExpandedProjects(prev => ({ ...prev, [currentProjectId]: true }));
    }
  }, [currentProjectId]);
  
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const projectsToExpand: Record<string, boolean> = {};
      projects.forEach(p => {
        if (p.subChats.some(sc => sc.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
          projectsToExpand[p.id] = true;
        }
      });
      if (Object.keys(projectsToExpand).length > 0) {
        setExpandedProjects(prev => ({ ...prev, ...projectsToExpand }));
      }
    }
  }, [searchQuery, projects]);

  const toggleProject = (projectId: string) => {
    if (isCollapsed) {
      onProjectSelect(projectId);
    } else {
      setExpandedProjects(prev => ({...prev, [projectId]: !prev[projectId]}));
    }
  };

  const handleActionClick = (e: React.MouseEvent, chat: {id: string, title: string}) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setChatActionMenu({ chat, top: rect.top });
  };
  
  const handleRename = () => {
    if(chatActionMenu) onShowRenameModal(chatActionMenu.chat);
    setChatActionMenu(null);
  }
  
  const handleShare = () => {
    if(chatActionMenu) setChatToShare(chatActionMenu.chat);
    setChatActionMenu(null);
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.subChats.some(sc => sc.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPastChats = pastChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <aside className={`fixed top-0 left-0 h-full bg-[#F7F7F7] dark:bg-[#1A1A1A] text-gray-800 dark:text-gray-200 flex flex-col transition-all duration-300 z-30 ${isCollapsed ? 'w-14' : 'w-[260px]'}`}>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className={`p-2 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <LogoIcon className="text-indigo-500" />
              <span className="font-bold text-lg">Metisium</span>
            </div>
          )}
          <button onClick={onToggleCollapse} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <div className="p-2 space-y-2">
          {!isCollapsed && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}
          <button onClick={onNewChat} className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 ${isCollapsed ? 'justify-center' : ''}`}>
            <NewChatIcon />
            {!isCollapsed && 'New Chat'}
          </button>
          <button onClick={onShowNewProjectModal} className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 ${isCollapsed ? 'justify-center' : ''}`}>
            <FolderPlusIcon />
            {!isCollapsed && 'New Project'}
          </button>
        </div>

        <div className="flex-1 px-2 space-y-2 overflow-y-auto">
          <section>
            <button 
              onClick={() => !isCollapsed && setIsProjectsVisible(v => !v)}
              className={`w-full flex items-center p-2 rounded-lg ${
                  isCollapsed 
                  ? 'justify-center text-gray-500 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400' 
                  : 'justify-between text-xs font-bold uppercase text-gray-500 dark:text-gray-400'
              }`}
            >
              {isCollapsed ? 
                  <ProjectsIcon /> :
                  <>
                      <span>Projects</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isProjectsVisible ? '' : '-rotate-90'}`} />
                  </>
              }
            </button>
            {(!isCollapsed && isProjectsVisible) && (
              <div className="space-y-1">
                {filteredProjects.map(project => (
                  <div key={project.id}>
                      <button onClick={() => toggleProject(project.id)} className={`w-full flex items-center justify-between p-2 text-left text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${currentProjectId === project.id ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}>
                        <div className="flex items-center gap-2 truncate">
                          <ProjectsIcon />
                          {!isCollapsed && <span className="truncate">{project.name}</span>}
                        </div>
                        {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedProjects[project.id] ? '' : '-rotate-90'}`} />}
                      </button>
                      {!isCollapsed && expandedProjects[project.id] && (
                          <div className="pl-6 pt-1 space-y-1">
                              {project.subChats.map(subChat => (
                                  <button key={subChat.id} onClick={() => onSelectSubChat(project.id, subChat.id)} className={`w-full text-left p-2 text-sm rounded-lg truncate hover:bg-gray-200 dark:hover:bg-gray-700 ${activeSubChatId === subChat.id ? 'bg-indigo-200 dark:bg-indigo-900/50 font-semibold' : ''}`}>
                                      {subChat.title}
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <button 
                onClick={() => !isCollapsed && setIsPastChatsVisible(v => !v)}
                className={`w-full flex items-center p-2 rounded-lg ${
                  isCollapsed 
                  ? 'justify-center text-gray-500 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400' 
                  : 'justify-between text-xs font-bold uppercase text-gray-500 dark:text-gray-400'
              }`}
            >
              {isCollapsed ?
                  <ChatIcon /> :
                  <>
                      <span>Past Chats</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isPastChatsVisible ? '' : '-rotate-90'}`} />
                  </>
              }
            </button>
            {(!isCollapsed && isPastChatsVisible) && (
              <div className="space-y-1">
                {filteredPastChats.map(chat => (
                  <div key={chat.id} className="group relative">
                    <button onClick={() => onSelectChat(chat.id)} className={`w-full text-left p-2 text-sm rounded-lg truncate ${activeChatId === chat.id ? 'bg-indigo-100 dark:bg-indigo-900/30 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {isCollapsed ? <ChatIcon className="mx-auto" /> : chat.title}
                    </button>
                    {!isCollapsed && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleActionClick(e, chat)} className="p-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                          <MoreHorizontalIcon />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <div className={`p-2 border-t border-gray-200 dark:border-gray-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="flex items-center gap-2">
              <img src="https://i.imgur.com/8Q9bY6H.png" alt="User" className="w-8 h-8 rounded-full" />
              {!isCollapsed && <span className="text-sm font-semibold">User</span>}
          </div>
      </div>
      {chatActionMenu && (
        <div className="fixed" style={{top: chatActionMenu.top, left: isCollapsed ? '50px' : '230px'}} onMouseLeave={() => setChatActionMenu(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 py-1">
            <button onClick={handleRename} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Rename</button>
            <button onClick={handleShare} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Share</button>
          </div>
        </div>
      )}
      {chatToShare && (
          <ShareModal chat={chatToShare} onClose={() => setChatToShare(null)} />
      )}
    </aside>
    </>
  );
};

export default Sidebar;
