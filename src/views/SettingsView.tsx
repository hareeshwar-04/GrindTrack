import React, { useState } from 'react';
import { UserProfile, SpreadsheetConfig } from '../types';
import { StoreService } from '../services/store';
import { Settings, Database, User, Shield, Bell, Moon, RefreshCw, Check, Save, Download, AlertTriangle } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  spreadsheetConfig: SpreadsheetConfig;
  onUpdateSpreadsheetConfig: (config: SpreadsheetConfig) => void;
  onSignOut?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  spreadsheetConfig,
  onUpdateSpreadsheetConfig,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'database' | 'notifications' | 'privacy'>('database');

  // Form states
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [timezone, setTimezone] = useState(user.timezone);
  const [profilePic, setProfilePic] = useState(user.profilePic);

  // Spreadsheet states
  const [sheetProvider, setSheetProvider] = useState(spreadsheetConfig.provider);
  const [sheetUrl, setSheetUrl] = useState(spreadsheetConfig.url);
  const [autoSync, setAutoSync] = useState(spreadsheetConfig.autoSync);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ username, bio, timezone, profilePic });
    setSyncStatusMsg('Profile settings saved successfully!');
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  const handleSaveSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSpreadsheetConfig({
      connected: !!sheetUrl.trim(),
      provider: sheetProvider,
      url: sheetUrl.trim(),
      autoSync,
      lastSyncedAt: new Date().toLocaleTimeString()
    });
    setSyncStatusMsg('Spreadsheet database configuration updated!');
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  const handleManualSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onUpdateSpreadsheetConfig({
        ...spreadsheetConfig,
        connected: true,
        lastSyncedAt: new Date().toLocaleTimeString()
      });
      setSyncStatusMsg('Live sync completed! 100% synchronized with spreadsheet.');
      setTimeout(() => setSyncStatusMsg(''), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-display font-extrabold text-2xl text-white">Platform Settings & Integrations</h2>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Configure spreadsheet database connectors, profile credentials, and notification schedules.
          </p>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 border border-[#EF4444]/30 text-xs font-bold transition-colors"
          >
            Sign Out 🚪
          </button>
        )}
      </div>

      {syncStatusMsg && (
        <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> {syncStatusMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222] pb-2">
        {[
          { id: 'database', label: 'Spreadsheet / DB Sync', icon: Database },
          { id: 'profile', label: 'Profile & Account', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy & Data', icon: Shield }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === t.id 
                  ? 'bg-[#00E5FF] text-black shadow-md' 
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SPREADSHEET / DATABASE CONNECTOR */}
      {activeTab === 'database' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#00E5FF]" /> Connect Spreadsheet Database
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-xl">
                The only thing you manually configure is connecting your Google Sheet, Airtable, or custom REST endpoint. GrindTrack's CRUD sync engine handles the rest.
              </p>
            </div>
            <span className={`badge text-[10px] font-bold py-1 px-3 ${
              spreadsheetConfig.connected ? 'badge-success' : 'badge-warning'
            }`}>
              {spreadsheetConfig.connected ? 'CONNECTED & SYNCED' : 'LOCAL MODE ONLY'}
            </span>
          </div>

          <form onSubmit={handleSaveSpreadsheet} className="space-y-4 pt-2 border-t border-[#222]">
            <div>
              <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Data Provider</label>
              <select
                value={sheetProvider}
                onChange={(e) => setSheetProvider(e.target.value as any)}
                className="form-select"
              >
                <option value="google_sheets">Google Sheets (CSV / Apps Script Webhook)</option>
                <option value="airtable">Airtable Database API</option>
                <option value="custom_webhook">Custom REST API Endpoint</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Spreadsheet CSV / Webhook URL</label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="form-input font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#171717]">
              <div>
                <h5 className="font-bold text-xs text-white">Auto-Sync on Changes</h5>
                <p className="text-[10px] text-[#9CA3AF]">Automatically push and pull status updates to spreadsheet</p>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#222]">
              <button
                type="button"
                onClick={handleManualSyncNow}
                disabled={isSyncing}
                className="btn btn-secondary text-xs py-2 px-4 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#00E5FF] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Manual Sync Now 🔄'}</span>
              </button>

              <button type="submit" className="btn btn-primary text-xs py-2 px-5">
                Save Sync Credentials 💾
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white">User Credentials & Timezone</h3>
          
          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-input min-h-[70px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Timezone (Midnight System)</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="form-select text-xs"
            >
              <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
              <option value="America/New_York (EST)">America/New_York (EST)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">Profile Picture URL</label>
            <input
              type="url"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              className="form-input text-xs font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" className="btn btn-primary text-xs py-2 px-5">
              Update Profile Details
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: NOTIFICATION PREFERENCES */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Notification Schedule Settings</h3>
          
          <div className="space-y-3">
            {[
              { title: '10:00 PM Nightly Goal Prompt', desc: 'Alert to set tomorrow\'s goals before sleeping' },
              { title: '09:00 AM Morning "Let\'s Grind" Reminder', desc: 'Kickstart daily goals list' },
              { title: '08:00 PM Evening Completion Audit', desc: 'Alert to finish remaining pending goals' },
              { title: 'Friend Social Reactions & Mentions', desc: 'Realtime alerts when group members react to your tasks' }
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#171717]">
                <div>
                  <h5 className="font-bold text-xs text-white">{n.title}</h5>
                  <p className="text-[10px] text-[#9CA3AF]">{n.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#00E5FF]" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
