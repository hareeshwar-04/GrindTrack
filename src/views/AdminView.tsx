import React, { useState } from 'react';
import { GroupMember, Group, SystemAnnouncement } from '../types';
import { ShieldCheck, Users, Megaphone, Trash2, AlertOctagon, CheckCircle2, Send, Activity } from 'lucide-react';

interface AdminViewProps {
  members: GroupMember[];
  groups: Group[];
  announcements: SystemAnnouncement[];
  onPublishAnnouncement: (title: string, content: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  members,
  groups,
  announcements,
  onPublishAnnouncement
}) => {
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [msg, setMsg] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    onPublishAnnouncement(annTitle.trim(), annContent.trim());
    setAnnTitle('');
    setAnnContent('');
    setMsg('System broadcast announcement published successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="glass-card p-6 border-l-4 border-l-[#EF4444] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#EF4444]" />
            <h2 className="font-display font-extrabold text-2xl text-white">System Admin Operations Panel</h2>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Manage platform users, groups, system health, flagged content, and global announcements.
          </p>
        </div>
        <span className="badge badge-danger text-[10px] py-1 px-3">ADMIN ACCESS GRANTED</span>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {msg}
        </div>
      )}

      {/* Broadcast Announcement Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#F59E0B]" /> Publish Global System Announcement
        </h3>
        
        <form onSubmit={handlePublish} className="space-y-3">
          <input
            type="text"
            placeholder="Announcement Header Title..."
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            className="form-input"
            required
          />
          <textarea
            placeholder="Broadcast details sent to all active group dashboards..."
            value={annContent}
            onChange={(e) => setAnnContent(e.target.value)}
            className="form-input min-h-[70px]"
          />
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Broadcast Announcement
            </button>
          </div>
        </form>
      </div>

      {/* User Management Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-[#00E5FF]" /> Manage Registered Users ({members.length})
        </h3>

        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#262626]">
              <div className="flex items-center gap-3">
                <img src={m.profilePic} alt="" className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <h5 className="font-bold text-xs text-white">{m.username}</h5>
                  <span className="text-[10px] text-[#9CA3AF]">{m.email} • {m.rank}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge badge-success text-[9px] py-0.5">ACTIVE</span>
                <button className="p-1.5 rounded-lg bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/30" title="Flag/Kick">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
