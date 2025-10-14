import React, { useEffect, useRef } from 'react';
import type { Message, Agent, Project } from '../types';
import { MessageSender } from '../types';
import { AGENTS } from '../constants';
import { LogoIcon, SettingsIcon } from './icons/Icons';

interface ChatViewProps {
  messages: Message[];
  getAgentById: (agentId: string) => Agent | undefined;
  isResponding: boolean;
  welcomeQuote?: string;
  currentProject: Project | null;
  onShowProjectSettings: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, getAgentById, isResponding, welcomeQuote, currentProject, onShowProjectSettings }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      {currentProject && (
         <header className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <h1 className="text-lg font-semibold">{currentProject.name}</h1>
            <div className="flex items-center gap-2">
                <button onClick={onShowProjectSettings} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>
        </header>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
        {messages.length === 0 && welcomeQuote && (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <LogoIcon className="w-8 h-8 text-gray-600 dark:text-gray-400"/>
            </div>
            <p className="text-2xl font-montserrat font-semibold text-gray-500 dark:text-gray-400">{welcomeQuote}</p>
          </div>
        )}
        {messages.map((message, index) => {
          const isUser = message.sender === MessageSender.USER;
          const agent = isUser ? null : getAgentById(message.senderId);
          const avatarSrc = isUser ? "https://picsum.photos/seed/user/40/40" : agent?.avatar;
          const senderName = isUser ? "You" : agent?.name;

          return (
            <div key={message.id} className={`flex items-start gap-4 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : ''}`}>
              <img src={avatarSrc} alt={senderName} className="w-8 h-8 rounded-full" />
              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <p className={`font-semibold text-gray-800 dark:text-gray-200 mb-1 ${isUser ? 'text-right' : 'text-left'}`}>{senderName}</p>
                <div className={`prose prose-invert dark:prose-invert text-gray-300 max-w-none p-3 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300'}`}>
                   {message.text}
                   {isResponding && index === messages.length - 1 && <span className={`inline-block w-2 h-4 ${isUser ? 'bg-indigo-300': 'bg-gray-400 dark:bg-gray-300'} animate-pulse ml-1`} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      { isResponding && <TypingIndicator agents={AGENTS.filter(a => messages[messages.length - 1]?.senderId === a.id)} /> }
    </div>
  );
};


const TypingIndicator: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    if (agents.length === 0) return null;

    const agentNames = agents.map(a => a.name).join(', ');
    return (
        <div className="flex items-center gap-2 px-4 pb-2 max-w-4xl mx-auto text-sm text-gray-500 dark:text-gray-400">
            <span>{agentNames} {agents.length > 1 ? 'are' : 'is'} typing</span>
            <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-0"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-150"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-300"></span>
            </div>
        </div>
    );
};


export default ChatView;