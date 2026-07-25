import React from 'react';

interface ViewTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'later', label: 'Later' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[#222]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
            activeTab === tab.id
              ? 'border-[#00E5FF] text-white'
              : 'border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
