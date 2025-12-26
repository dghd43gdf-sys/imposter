import React, { useState } from 'react';
import { X, Save, User, Trophy, Users, Edit3, Lock, Eye, EyeOff, Target, Sparkles } from 'lucide-react';
import { User as UserType } from '../types/game';

interface ProfileModalProps {
  user: UserType;
  onClose: () => void;
  onUpdate: (user: UserType) => void;
  readOnly?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate, readOnly = false }) => {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setNewUsername(value);
    }
  };

  const handleSave = async () => {
    if (!newUsername.trim()) {
      setError('Benutzername darf nicht leer sein.');
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      setError('Benutzername muss zwischen 3 und 20 Zeichen lang sein.');
      return;
    }

    if (changingPassword) {
      if (!currentPassword) {
        setError('Aktuelles Passwort ist erforderlich.');
        return;
      }

      if (newPassword.length < 6) {
        setError('Neues Passwort muss mindestens 6 Zeichen lang sein.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwörter stimmen nicht überein.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        userId: user.id
      };

      if (newUsername !== user.username) {
        updateData.newUsername = newUsername.trim();
      }

      if (changingPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        onUpdate(data.user);
        setEditing(false);
        setChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Fehler beim Aktualisieren des Profils');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setChangingPassword(false);
    setNewUsername(user.username);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const gamesPlayed = user.gamesPlayed || 0;
  const timesImposter = user.timesImposter || 0;
  const imposterWins = user.imposterWins || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {readOnly ? `${user.username}'s Profil` : 'Mein Profil'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto border-4 border-violet-500/30 animate-glow">
            <User className="w-12 h-12 text-white" />
          </div>

          <div className="mt-6">
            {editing && !readOnly ? (
              <div>
                <input
                  type="text"
                  value={newUsername}
                  onChange={handleUsernameChange}
                  className="text-xl font-bold text-white input-modern text-center"
                  maxLength={20}
                />
                <p className="text-xs text-slate-400 mt-2">{newUsername.length}/20 Zeichen</p>
              </div>
            ) : (
              <h3 className="text-xl font-bold text-white">{user.username}</h3>
            )}
          </div>
        </div>

        {/* Password Change Section */}
        {editing && !readOnly && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-violet-400" />
                <span>Passwort ändern</span>
              </h4>
              <button
                onClick={() => setChangingPassword(!changingPassword)}
                className="text-violet-400 hover:text-violet-300 text-sm"
              >
                {changingPassword ? 'Abbrechen' : 'Ändern'}
              </button>
            </div>

            {changingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Aktuelles Passwort
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3 input-modern"
                      placeholder="Aktuelles Passwort"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Neues Passwort
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3 input-modern"
                      placeholder="Neues Passwort"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Passwort bestätigen
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3 input-modern"
                      placeholder="Passwort bestätigen"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span>Statistiken</span>
          </h4>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card-light rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center space-x-1 text-violet-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-xl font-bold">{gamesPlayed}</span>
              </div>
              <p className="text-xs text-slate-400">Spiele</p>
            </div>
            
            <div className="glass-card-light rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center space-x-1 text-pink-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-xl font-bold">{timesImposter}</span>
              </div>
              <p className="text-xs text-slate-400">Imposter</p>
            </div>

            <div className="glass-card-light rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-xl font-bold">{imposterWins}</span>
              </div>
              <p className="text-xs text-slate-400">Imposter Siege</p>
            </div>
          </div>

          {/* Win Rates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card-light rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-400 mb-2">Imposter-Rate</p>
              <p className="text-lg font-bold text-cyan-400">
                {gamesPlayed > 0 ? Math.round((timesImposter / gamesPlayed) * 100) : 0}%
              </p>
            </div>

            <div className="glass-card-light rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-400 mb-2">Imposter Siegesrate</p>
              <p className="text-lg font-bold text-emerald-400">
                {timesImposter > 0 ? Math.round((imposterWins / timesImposter) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex space-x-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 btn-neutral py-3 px-4 disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 btn-primary py-3 px-4 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Speichern...' : 'Speichern'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full btn-primary py-3 px-4 flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Profil bearbeiten</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};