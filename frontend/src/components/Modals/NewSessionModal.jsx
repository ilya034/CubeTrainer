import { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';

export const NewSessionModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="text-xl font-bold text-white mb-4">New Session</h3>
      <input 
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Session Name" 
        className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 mb-6"
      />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
        <button onClick={() => { onCreate(name); setName(''); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
          OK
        </button>
      </div>
    </ModalOverlay>
  );
};