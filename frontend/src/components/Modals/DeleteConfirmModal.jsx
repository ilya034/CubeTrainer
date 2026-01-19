import { ModalOverlay } from './ModalOverlay';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="text-xl font-bold text-white mb-2">Delete Result?</h3>
      <p className="text-gray-400 mb-6">Are you sure you want to delete this solve? This action cannot be undone.</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">Delete</button>
      </div>
    </ModalOverlay>
  );
};