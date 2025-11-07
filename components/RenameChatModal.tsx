import React, { useState } from 'react';
import { CloseIcon, SettingsIcon } from './icons/Icons';

interface RenameChatModalProps {
  chat: { id: string; title: string };
  onClose: () => void;
  onRename: (chatId: string, newTitle: string) => void;
}

const RenameChatModal: React.FC<RenameChatModalProps> = ({ chat, onClose, onRename }) => {
  const [newTitle, setNewTitle] = useState(chat.title);

  const handleSave = () => {
    if (newTitle.trim()) {
      onRename(chat.id, newTitle.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5"/> Rename Chat
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-5 space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Enter a new name for this conversation.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
                Save
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RenameChatModal;