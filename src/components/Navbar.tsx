import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, NotificationItem } from '../types';
import { Zap, Flame, Search, Bell, ShieldCheck, User as UserIcon, Plus, CheckCircle2, ChevronDown, LogOut, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeView: string;
  setActiveView: (view: string) => void;
  notifications: NotificationItem[];
  onOpenNewGoal: () => void;
  onOpenSearch: () => void;
  onOpenImportGoals?: () => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  notifications,
  onOpenNewGoal,
  onOpenSearch,
  canGoBack,
  onGoBack,
  onOpenAuth,
  onOpenImportGoals,
  onSignOut
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showNotifMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifMenu]);

  // Close new dropdown on outside click
  useEffect(() => {
    if (!showNewMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNewMenu]);

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'goals', label: 'Goals' },
    { id: 'groups', label: 'Groups' },
    { id: 'leaderboard', label: 'Ranks' },
    { id: 'activity', label: 'Feed' }
  ];

  const secondaryNavItems = [
    { id: 'analytics', icon: <Flame className="w-4 h-4" />, title: 'Analytics' },
    { id: 'calendar', icon: <CheckCircle2 className="w-4 h-4" />, title: 'Calendar' },
    { id: 'settings', icon: <ShieldCheck className="w-4 h-4" />, title: 'Settings' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080808]/70 border-b border-[#222]">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-6 overflow-hidden">
          {/* Back Button */}
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="p-1.5 -ml-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Brand Logo */}
          <div 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] p-0.5 shadow-[0_0_10px_rgba(0,229,255,0.2)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#080808] rounded-[6px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#00E5FF]" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-extrabold text-base text-white leading-none tracking-tight">GrindTrack</h1>
            </div>
          </div>

          {/* Main Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#111111]/60 p-1 rounded-xl border border-[#222]">
            {mainNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all ${
                  activeView === item.id 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Actions & Secondary Nav */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Secondary Icons (Analytics, Calendar, Settings) */}
          <nav className="hidden xl:flex items-center gap-1 mr-2 border-r border-[#222] pr-3">
             {secondaryNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={item.title}
                  className={`p-2 rounded-xl transition-all ${
                    activeView === item.id ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                </button>
             ))}
          </nav>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111111] border border-[#222] text-[#9CA3AF] text-xs hover:border-[#00E5FF]/40 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 text-[9px] font-mono bg-[#1a1a1a] rounded border border-[#333] text-[#6B7280]">⌘K</kbd>
          </button>

          {/* Unified New Button Dropdown */}
          <div className="relative hidden sm:block" ref={newMenuRef}>
            <button 
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="font-bold pr-1">New</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showNewMenu ? 'rotate-180' : ''}`} />
            </button>

            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-[#222] rounded-xl shadow-2xl p-2 z-50 animate-fade-in flex flex-col gap-1">
                <button 
                  onClick={() => { setShowNewMenu(false); onOpenNewGoal(); }}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] rounded-lg transition-colors font-bold"
                >
                  Create Goal
                </button>
                <button 
                  onClick={() => { setShowNewMenu(false); setActiveView('groups'); }}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] rounded-lg transition-colors font-bold"
                >
                  Create Group
                </button>
                <button 
                  onClick={() => { setShowNewMenu(false); /* Future feature placeholder */ }}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#10B981]/10 hover:text-[#10B981] rounded-lg transition-colors font-bold"
                >
                  Create Challenge
                </button>
                <div className="h-px bg-[#222] my-1" />
                <button 
                  onClick={() => { setShowNewMenu(false); onOpenImportGoals?.(); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Import Goals (CSV)
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-1.5 rounded-xl bg-[#111111] border border-[#222] text-[#9CA3AF] hover:text-white relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#111111] border border-[#222] rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                  <h3 className="font-bold text-xs text-white">Notifications</h3>
                </div>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-[#171717] border border-[#262626] text-xs">
                      <div className="font-semibold text-[#00E5FF] text-[10px]">{n.title}</div>
                      <p className="text-white mt-0.5 leading-snug text-[11px]">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cloud Auth / Sign In Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
            >
              <span>Cloud Auth ☁️</span>
            </button>
          )}

          {/* Profile */}
          <div 
            onClick={() => setActiveView('profile')}
            className="flex items-center gap-2 cursor-pointer p-0.5 rounded-xl hover:bg-white/5 transition-all ml-1"
          >
            <img 
              src={user.profilePic} 
              alt={user.username} 
              className="w-7 h-7 rounded-lg object-cover ring-2 ring-[#00E5FF]/40"
            />
          </div>

          {/* Quick Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 rounded-xl bg-[#111111] border border-[#222] text-[#9CA3AF] hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
