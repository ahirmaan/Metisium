import React from 'react';
import type { Agent } from '../types';
import { UsersIcon } from './icons/Icons';

interface AtMentionsProps {
  agents: Agent[];
  query: string;
  onSelect: (agent: Agent) => void;
}

const EVERYONE_AGENT: Agent = {
  id: 'everyone',
  name: 'Everyone',
  avatar: '' // avatar is not used, we render an icon instead
};

const AtMentions: React.FC<AtMentionsProps> = ({ agents, query, onSelect }) => {
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().startsWith(query.toLowerCase())
  );
  
  const everyoneMatch = 'everyone'.startsWith(query.toLowerCase());

  return (
    <div className="absolute bottom-full mb-2 w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
      <div className="p-2">
        {everyoneMatch && (
            <div
              onClick={() => onSelect(EVERYONE_AGENT)}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400"><UsersIcon /></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Everyone</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Address all available agents.</p>
              </div>
            </div>
        )}
        {filteredAgents.length > 0 ? (
          filteredAgents.map(agent => (
            <div
              key={agent.id}
              onClick={() => onSelect(agent)}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-full" />
              <span className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</span>
            </div>
          ))
        ) : (
          !everyoneMatch && <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No agents found</div>
        )}
      </div>
    </div>
  );
};

export default AtMentions;