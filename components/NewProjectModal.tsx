import React, { useState } from 'react';
import type { Agent } from '../types';
import { CloseIcon, FolderPlusIcon } from './icons/Icons';

interface NewProjectModalProps {
  agents: Agent[];
  onClose: () => void;
  onCreate: (projectName: string, selectedAgentIds: string[]) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ agents, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCreate = () => {
    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }
    if (selectedAgentIds.length === 0) {
      setError('Please select at least one agent.');
      return;
    }
    onCreate(projectName.trim(), selectedAgentIds);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderPlusIcon /> Create New Project
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Q4 Marketing Strategy"
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Agents
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => {
                    handleAgentToggle(agent.id)
                    if (error) setError('');
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border-2 transition-colors ${
                    selectedAgentIds.includes(agent.id)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full" />
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-semibold">
            Cancel
          </button>
          <button onClick={handleCreate} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
