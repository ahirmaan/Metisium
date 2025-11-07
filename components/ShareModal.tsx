import React, { useState } from 'react';
import { CloseIcon, ShareIcon } from './icons/Icons';

interface ShareModalProps {
  chat: { id: string; title: string };
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ chat, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');
  const shareUrl = `https://metisium.vercel.app/share/${chat.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShareIcon className="w-5 h-5"/> Share Chat
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Share a link to this conversation: <span className="font-semibold text-gray-900 dark:text-gray-100">{chat.title}</span>
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors w-24 text-center"
            >
              {copyButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;