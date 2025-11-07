import React, { useState } from 'react';
import type { Project, Agent, AgentRole } from '../types';
import { CloseIcon } from './icons/Icons';

interface ProjectSettingsModalProps {
  project: Project;
  agents: Agent[];
  onClose: () => void;
  onSave: (projectId: string, updatedRoles: AgentRole[]) => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ project, agents, onClose, onSave }) => {
  const [roles, setRoles] = useState<AgentRole[]>(project.roles);

  const handleRoleChange = (agentId: string, newRole: string) => {
    setRoles(currentRoles => {
      const existingRole = currentRoles.find(r => r.agentId === agentId);
      if (existingRole) {
        return currentRoles.map(r => r.agentId === agentId ? { ...r, role: newRole } : r);
      }
      return [...currentRoles, { agentId, role: newRole }];
    });
  };

  const handleSaveChanges = () => {
    onSave(project.id, roles);
    onClose();
  };
  
  const agentsInProject = agents.filter(agent => roles.some(r => r.agentId === agent.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Project Settings: <span className="text-indigo-500 dark:text-indigo-400">{project.name}</span></h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400">Define the system prompt or role for each AI agent in this project.</p>
          {agentsInProject.map(agent => (
            <div key={agent.id} className="grid grid-cols-1 md:grid-cols-3 md:items-start gap-4">
              <div className="flex items-center gap-2 col-span-1">
                <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full"/>
                <span className="font-medium text-sm">{agent.name}</span>
              </div>
              <textarea
                rows={3}
                value={roles.find(r => r.agentId === agent.id)?.role || ''}
                onChange={(e) => handleRoleChange(agent.id, e.target.value)}
                placeholder={`e.g., You are a helpful assistant...`}
                className="col-span-1 md:col-span-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-semibold">
            Cancel
          </button>
          <button onClick={handleSaveChanges} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;