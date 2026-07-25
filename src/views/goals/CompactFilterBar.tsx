import React from 'react';
import { Search, Filter, SortDesc, Settings2 } from 'lucide-react';

interface CompactFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  sortOption: string;
  setSortOption: (s: string) => void;
}

export const CompactFilterBar: React.FC<CompactFilterBarProps> = ({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter,
  sortOption, setSortOption
}) => {
  return (
    <div className="bg-[#111111] border border-[#222] rounded-xl p-2 flex flex-col md:flex-row items-center gap-2">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input 
          type="text" 
          placeholder="Search by title, tags, or description..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:ring-0"
        />
      </div>

      <div className="h-6 w-px bg-[#333] hidden md:block mx-1" />

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg border border-[#333] px-2 py-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg border border-[#333] px-2 py-1 shrink-0">
          <Settings2 className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0"
          >
            <option value="all">All Categories</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Health">Health</option>
            <option value="Life">Life</option>
            <option value="Code">Code</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg border border-[#333] px-2 py-1 shrink-0">
          <SortDesc className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0"
          >
            <option value="newest">Newest First</option>
            <option value="xp-high">Highest XP</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
};
