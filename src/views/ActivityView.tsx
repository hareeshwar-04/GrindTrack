import React, { useState } from 'react';
import { ActivityFeedItem, UserProfile } from '../types';
import { Sparkles, MessageSquare, Send, Heart, Flame, ThumbsUp, Star } from 'lucide-react';

interface ActivityViewProps {
  activities: ActivityFeedItem[];
  currentUser: UserProfile;
  onAddReaction: (activityId: string, emoji: string) => void;
  onAddComment: (activityId: string, text: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  activities,
  currentUser,
  onAddReaction,
  onAddComment
}) => {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleCommentSubmit = (activityId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[activityId]?.trim();
    if (!text) return;
    onAddComment(activityId, text);
    setCommentInputs({ ...commentInputs, [activityId]: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="font-display font-extrabold text-2xl text-white">Group Activity Stream</h2>
        </div>
        <p className="text-xs text-[#9CA3AF]">
          Real-time milestones, completed goals, and streak updates across all group members.
        </p>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map(act => (
          <div key={act.id} className="glass-card p-5 space-y-4">
            
            {/* Event Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={act.userAvatar} alt={act.userName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#00E5FF]/30" />
                <div>
                  <h4 className="font-bold text-xs text-white">
                    <strong className="text-[#00E5FF]">{act.userName}</strong> {act.text}
                  </h4>
                  <span className="text-[10px] text-[#9CA3AF]">{act.timestamp}</span>
                </div>
              </div>

              <span className="badge badge-accent text-[9px] uppercase">
                {act.type.replace('_', ' ')}
              </span>
            </div>

            {/* Reactions Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
              {['🔥', '💪', '👏', '❤️', '⭐'].map(emoji => {
                const reaction = act.reactions.find(r => r.emoji === emoji);
                const count = reaction ? reaction.count : 0;
                const hasReacted = reaction ? reaction.users.includes(currentUser.id) : false;

                return (
                  <button
                    key={emoji}
                    onClick={() => onAddReaction(act.id, emoji)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      hasReacted 
                        ? 'bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF]' 
                        : 'bg-[#171717] border border-[#262626] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span className="text-[10px]">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Comments Thread */}
            {act.comments.length > 0 && (
              <div className="pt-2 space-y-2 border-t border-[#222]">
                {act.comments.map(c => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-[#171717] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
                      <span className="font-bold text-white">{c.userName}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="text-white">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={(e) => handleCommentSubmit(act.id, e)} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Leave an encouraging comment..."
                value={commentInputs[act.id] || ''}
                onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                className="form-input py-1.5 text-xs"
              />
              <button type="submit" className="btn btn-primary text-xs py-1.5 px-3">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        ))}
      </div>

    </div>
  );
};
