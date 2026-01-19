import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';

export const AuthModal = ({ isOpen, onClose, isLoginMode, toggleMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {isLoginMode ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {!isLoginMode && (
          <input type="email" placeholder="Email" className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        )}
        <input type="text" placeholder="Username" className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {!isLoginMode && (
          <input type="password" placeholder="Confirm Password" className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        )}

        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition">
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-4 text-center text-gray-400 text-sm">
        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
        <button onClick={toggleMode} className="text-blue-400 hover:underline">
          {isLoginMode ? 'Register' : 'Log In'}
        </button>
      </div>
    </ModalOverlay>
  );
};