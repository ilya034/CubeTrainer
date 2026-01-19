export const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-[#18181b] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);