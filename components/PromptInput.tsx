import React, { useState, useRef, useEffect } from 'react';
import type { Agent } from '../types';
import { UploadIcon, SendIcon, UserPlusIcon } from './icons/Icons';
import AgentSelector from './AgentSelector';
import AtMentions from './AtMentions';

interface PromptInputProps {
  onSendMessage: (text: string, selectedAgentIds: string[]) => void;
  isResponding: boolean;
  availableAgents: Agent[];
  isProjectContext: boolean;
  onShowAddAgentModal: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSendMessage, isResponding, availableAgents, isProjectContext, onShowAddAgentModal }) => {
  const [text, setText] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [showAtMentions, setShowAtMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    const atMatch = newText.match(/@(\w*)$/);
    if (atMatch) {
      setShowAtMentions(true);
      setMentionQuery(atMatch[1]);
    } else {
      setShowAtMentions(false);
    }
  };
  
  const handleAgentSelect = (agent: Agent) => {
      const currentText = text;
      const atIndex = currentText.lastIndexOf('@');
      const newText = currentText.substring(0, atIndex) + `@${agent.name} `;
      setText(newText);
      
      if (agent.id !== 'everyone' && !selectedAgents.some(a => a.id === agent.id)) {
          setSelectedAgents([...selectedAgents, agent]);
      }

      setShowAtMentions(false);
      textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isResponding) {
      let finalAgentIds: string[] = [];

      if (text.includes('@Everyone')) {
        finalAgentIds = availableAgents.map(a => a.id);
      } else {
        const mentionedAgentNames = text.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
        const mentionedAgents = availableAgents.filter(agent => mentionedAgentNames.includes(agent.name));
        const allSelectedAgents = [...new Set([...selectedAgents, ...mentionedAgents])];
        finalAgentIds = allSelectedAgents.map(a => a.id);
      }
      
      onSendMessage(text, finalAgentIds);
      setText('');
      setSelectedAgents([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
      {showAtMentions && <AtMentions agents={availableAgents} query={mentionQuery} onSelect={handleAgentSelect} />}
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 flex items-end shadow-lg">
        <div className="flex items-center gap-2 pl-2">
            {isProjectContext ? (
              <button
                type="button"
                onClick={onShowAddAgentModal}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span>Add Agent</span>
              </button>
            ) : (
              <AgentSelector allAgents={availableAgents} selectedAgents={selectedAgents} onSelectionChange={setSelectedAgents} />
            )}
             <button type="button" onClick={() => document.getElementById('file-upload')?.click()} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <UploadIcon />
                <input type="file" id="file-upload" className="hidden" />
            </button>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
              }
          }}
          placeholder={isProjectContext ? 'Mention @agent or type a message...' : 'Ask agents anything, or type @Everyone...'}
          className="flex-1 bg-transparent resize-none outline-none px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 max-h-48"
          rows={1}
          disabled={isResponding}
        />
        <button type="submit" disabled={isResponding || !text.trim()} className="p-2 rounded-md bg-indigo-600 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors">
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default PromptInput;