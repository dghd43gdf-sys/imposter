import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface UsernameEntryProps {
  onSubmit: (username: string) => void;
}

export const UsernameEntry: React.FC<UsernameEntryProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 2) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-700/50 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Willkommen bei Imposter</h1>
          <p className="text-gray-400 text-sm sm:text-base">Gib deinen Benutzernamen ein, um zu beginnen</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Benutzername
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Gib deinen Benutzernamen ein"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            disabled={username.trim().length < 2}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 touch-manipulation text-sm sm:text-base"
          >
            <span>Weiter</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};