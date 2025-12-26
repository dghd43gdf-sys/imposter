import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, User, Trophy, Users, Edit3, Lock, Eye, EyeOff, Target, Sparkles, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/Layout/PageLayout';
import { User as UserType } from '../types/game';

interface ProfilePageProps {
  user?: UserType;
  onUpdate?: (user: UserType) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user: currentUser, onUpdate }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(currentUser || null);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);
  const readOnly = !isOwnProfile;

  useEffect(() => {
    if (userId && userId !== currentUser?.id) {
      // Load other user's profile
      setLoading(true);
      const loadUserProfile = async () => {
        try {
          const response = await fetch(`/api/user/${userId}`);
          const data = await response.json();
          
          if (data.success) {
            setUser(data.user);
          } else {
            setError('Benutzer nicht gefunden. Möglicherweise wurde die Datenbank zurückgesetzt.');
          }
        } catch (error) {
          setError('Verbindungsfehler beim Laden des Profils');
        } finally {
          setLoading(false);
        }
      };
      
      loadUserProfile();
    } else if (currentUser) {
      setUser(currentUser);
      setNewUsername(currentUser.username);
    }
  }, [userId, currentUser]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setNewUsername(value);
    }
  };

  const handleSave = async () => {
    if (!user || !newUsername.trim()) {
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
        setUser(data.user);
        if (onUpdate) {
          onUpdate(data.user);
        }
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
    setNewUsername(user?.username || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  if (!user) {
    return (
      <PageLayout>
        <div className="text-center space-y-4">
          {loading ? (
            <p className="text-slate-400">Profil wird geladen...</p>
          ) : error ? (
            <div className="modern-card bg-red-500/10 border-red-500/30 p-6">
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="modern-btn modern-btn-primary py-2 px-4"
              >
                Zurück zum Dashboard
              </button>
            </div>
          ) : (
            <p className="text-slate-400">Profil nicht gefunden.</p>
          )}
        </div>
      </PageLayout>
    );
  }

  const gamesPlayed = user.gamesPlayed || 0;
  const timesImposter = user.timesImposter || 0;
  const imposterWins = user.imposterWins || 0;

  return (
    <PageLayout maxWidth="md">
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Zurück</span>
        </button>

        {/* Profile Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto border-4 border-blue-500/30 shadow-lg mb-6">
            <User className="w-12 h-12 text-white" />
          </div>

          <div>
            {editing && !readOnly ? (
              <div>
                <input
                  type="text"
                  value={newUsername}
                  onChange={handleUsernameChange}
                  className="modern-input text-xl font-bold text-white text-center"
                  maxLength={20}
                />
                <p className="text-xs text-slate-400 mt-2">{newUsername.length}/20 Zeichen</p>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-white">
                {readOnly ? `${user.username}'s Profil` : user.username}
              </h1>
            )}
          </div>
        </div>

        {error && (
          <div className="modern-card bg-red-500/10 border-red-500/30 p-4 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Password Change Section */}
        {editing && !readOnly && (
          <div className="modern-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>Passwort ändern</span>
              </h2>
              <button
                onClick={() => setChangingPassword(!changingPassword)}
                className="text-blue-400 hover:text-blue-300 text-sm"
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
                      className="modern-input pl-12 pr-14"
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
                      className="modern-input pl-12 pr-14"
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
                      className="modern-input pl-12 pr-14"
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
        <div className="modern-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Statistiken</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
                <Users className="w-6 h-6" />
                <span className="text-2xl font-bold">{gamesPlayed}</span>
              </div>
              <p className="text-slate-400 text-sm">Spiele</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-purple-400 mb-2">
                <Trophy className="w-6 h-6" />
                <span className="text-2xl font-bold">{timesImposter}</span>
              </div>
              <p className="text-slate-400 text-sm">Imposter</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                <Target className="w-6 h-6" />
                <span className="text-2xl font-bold">{imposterWins}</span>
              </div>
              <p className="text-slate-400 text-sm">Imposter Siege</p>
            </div>
          </div>

          {/* Win Rates */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-700">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Imposter-Rate</p>
              <p className="text-lg font-bold text-cyan-400">
                {gamesPlayed > 0 ? Math.round((timesImposter / gamesPlayed) * 100) : 0}%
              </p>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Imposter Siegesrate</p>
              <p className="text-lg font-bold text-green-400">
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
                  className="modern-btn modern-btn-neutral flex-1 py-3 disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="modern-btn modern-btn-primary flex-1 py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Speichern...' : 'Speichern'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="modern-btn modern-btn-primary w-full py-3 flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Profil bearbeiten</span>
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};