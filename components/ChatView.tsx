import React, { useRef, useEffect } from 'react';
import type { Message, Agent, Project, SubChat } from '../types';
import { MessageSender } from '../types';
import { SettingsIcon, SparklesIcon } from './icons/Icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatViewProps {
  messages: Message[];
  getAgentById: (agentId: string) => Agent | undefined;
  isResponding: boolean;
  welcomeQuote?: string;
  currentProject: Project | null;
  activeSubChat: SubChat | null;
  onShowProjectSettings: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  getAgentById,
  isResponding,
  welcomeQuote,
  currentProject,
  activeSubChat,
  onShowProjectSettings
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResponding]);

  const MarkdownComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };
  
  const renderHeader = () => (
    currentProject && (
      <header className="sticky top-0 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md p-3 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-[720px] mx-auto flex justify-between items-center">
            <div>
              <h2 className="font-normal text-lg truncate">
                <span className="font-bold text-gray-900 dark:text-gray-100">{currentProject.name}</span>
                {activeSubChat && (
                    <>
                        <span className="text-gray-400 dark:text-gray-500 mx-2">/</span>
                        <span className="text-gray-600 dark:text-gray-400">{activeSubChat.title}</span>
                    </>
                )}
              </h2>
            </div>
            <button onClick={onShowProjectSettings} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <SettingsIcon className="w-5 h-5" />
            </button>
        </div>
      </header>
    )
  );

  const renderWelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <SparklesIcon className="w-16 h-16 text-indigo-400 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{welcomeQuote}</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Start a new conversation or select a project to begin.</p>
    </div>
  );
  
  const renderEmptyChatPlaceholder = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <SparklesIcon className="w-16 h-16 text-indigo-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Ready to collaborate?</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Mention an agent with @ or send a message to the team to get started.</p>
    </div>
  );

  const renderMessages = () => (
    <div className="flex-1 p-4 space-y-6">
      {messages.map((message, index) => {
        const agent = message.sender === MessageSender.AGENT ? getAgentById(message.senderId) : null;
        const isUser = message.sender === MessageSender.USER;
        const isLastMessage = index === messages.length - 1;
        const agentMessageIsStreaming = isLastMessage && isResponding && !isUser;

        return (
          <div key={message.id} className={`flex items-start gap-3 max-w-[720px] mx-auto ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`p-3 rounded-2xl max-w-xl prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-pre:my-2 prose-pre:bg-transparent ${isUser ? 'bg-indigo-500 text-white prose-p:text-white prose-strong:text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {!isUser && agent && <p className="font-bold text-xs mb-1 not-prose">{agent.name}</p>}
              <ReactMarkdown components={MarkdownComponents}>{message.text}</ReactMarkdown>
              {agentMessageIsStreaming && <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse" />}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  if (welcomeQuote) {
    return renderWelcomeScreen();
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
        {renderHeader()}
        {messages.length > 0 ? renderMessages() : renderEmptyChatPlaceholder()}
    </div>
  );
};

export default ChatView;