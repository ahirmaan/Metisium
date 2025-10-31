import React, { useState, useRef, useEffect } from 'react';
import type { Agent } from '../types';
import { UploadIcon, SendIcon, UserPlusIcon } from './icons/Icons';
import AtMentions from './AtMentions';

interface PromptInputProps {
  onSendMessage: (text: string) => void;
  isResponding: boolean;
  availableAgents: Agent[];
  isProjectContext: boolean;
  onShowAddAgentModal: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  onSendMessage, isResponding, availableAgents, 
  isProjectContext, onShowAddAgentModal
}) => {
  const [text, setText] = useState('');
  const [showAtMentions, setShowAtMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // Corresponds to max-h-52
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
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

      setShowAtMentions(false);
      textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isResponding) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-[720px] mx-auto">
      {showAtMentions && <AtMentions agents={availableAgents} query={mentionQuery} onSelect={handleAgentSelect} />}
      <div className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-full p-2 flex items-center shadow-lg focus-within:ring-2 focus-within:ring-indigo-500">
        <div className="flex items-center gap-2 pl-2">
            {isProjectContext ? (
              <button
                type="button"
                onClick={onShowAddAgentModal}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#001B3A] text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span>Add Agent</span>
              </button>
            ) : (
             <button type="button" onClick={() => document.getElementById('file-upload')?.click()} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <UploadIcon />
                <input type="file" id="file-upload" className="hidden" />
            </button>
            )}
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
          placeholder={isProjectContext ? 'Mention @agent or type a message to everyone...' : 'Ask agents anything, or type @ to mention...'}
          className="flex-1 bg-transparent resize-none outline-none px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 max-h-52"
          rows={1}
          disabled={isResponding}
        />
        <button type="submit" disabled={isResponding || !text.trim()} className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors">
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default PromptInput;