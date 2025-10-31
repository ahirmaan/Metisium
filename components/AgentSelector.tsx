
import React, { useState, useRef, useEffect } from 'react';
import type { Agent } from '../types';
import { ChevronDownIcon } from './icons/Icons';

interface AgentSelectorProps {
  allAgents: Agent[];
  selectedAgents: Agent[];
  onSelectionChange: (agents: Agent[]) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ allAgents, selectedAgents, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleAgent = (agent: Agent) => {
    const isSelected = selectedAgents.some(a => a.id === agent.id);
    if (isSelected) {
      onSelectionChange(selectedAgents.filter(a => a.id !== agent.id));
    } else {
      onSelectionChange([...selectedAgents, agent]);
    }
  };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  const getButtonLabel = () => {
    if (selectedAgents.length === 0) return 'Select Agent';
    if (selectedAgents.length === 1) return selectedAgents[0].name;
    return `${selectedAgents[0].name} +${selectedAgents.length - 1}`;
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        {selectedAgents.length > 0 && <img src={selectedAgents[0].avatar} className="w-4 h-4 rounded-full" />}
        <span>{getButtonLabel()}</span>
        <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10">
          <div className="p-1.5">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 pb-1">Select agents to respond</p>
            {allAgents.map(agent => (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent)}
                className="flex items-center gap-3 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedAgents.some(a => a.id === agent.id)}
                  readOnly
                  className="w-4 h-4 text-indigo-600 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                />
                <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-full" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;