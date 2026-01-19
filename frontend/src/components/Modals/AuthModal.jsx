import { useState } from 'react';
import { Eye, EyeOff, LogOut } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';

export const AuthModal = ({ isOpen, onClose, isLoginMode, toggleMode, onSubmit, onLogout, user }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, isLoginMode);
  };

  if (!isOpen) return null;

  if (user) {
     return (
        <ModalOverlay onClose={onClose}>
           <h2 className="text-2xl font-bold text-white mb-6 text-center">Hello, {user.username}!</h2>
           <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-500 border border-red-800 hover:bg-red-600/30 font-bold py-3 rounded-lg transition">
              <LogOut size={20} /> Log Out
           </button>
        </ModalOverlay>
     );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {isLoginMode ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLoginMode && (
          <input 
            name="email"
            type="email" 
            placeholder="Email" 
            value={formData.email} onChange={handleChange}
            className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
          />
        )}
        <input 
            name="username"
            type="text" 
            placeholder="Username" 
            value={formData.username} onChange={handleChange}
            className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
        />
        
        <div className="relative">
          <input 
            name="password"
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={formData.password} onChange={handleChange}
            className="w-full bg-[#0f0f11] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition">
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