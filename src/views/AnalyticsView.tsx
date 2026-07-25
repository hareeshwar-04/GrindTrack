import React, { useMemo } from 'react';
import { UserProfile, Goal } from '../types';
import { AIService } from '../services/aiService';
import { StoreService, calculateXP } from '../services/store';
import { BarChart3, Download, FileSpreadsheet, FileText, Sparkles, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

interface AnalyticsViewProps {
  user: UserProfile;
  goals: Goal[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, goals }) => {
  const aiInsight = AIService.generateWeeklySummary(user.completedGoals, user.currentStreak, user.consistencyRate);

  // Category counts for Doughnut chart
  const categories = ['Work', 'Code', 'Health', 'Study', 'Personal', 'Finance'];
  const categoryCounts = categories.map(cat => goals.filter(g => g.category === cat).length);

  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: [
          '#00E5FF',
          '#8B5CF6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#EC4899'
        ],
        borderWidth: 0
      }
    ]
  };

  // Compute real weekly completion percentages from goal data
  const weeklyData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dailyPcts: number[] = [];

    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      // Find goals that were created on this date
      const dayGoals = goals.filter(g => {
        const gDate = (g.completedAt || g.createdAt)?.split('T')[0];
        return gDate === dateKey;
      });

      if (dayGoals.length === 0) {
        dailyPcts.push(0);
      } else {
        const completed = dayGoals.filter(g => g.status === 'completed').length;
        dailyPcts.push(Math.round((completed / dayGoals.length) * 100));
      }
    }

    // Build labels for last 7 days
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(dayNames[date.getDay()]);
    }

    return { labels, data: dailyPcts };
  }, [goals]);

  const lineData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Completion %',
        data: weeklyData.data,
        borderColor: '#00E5FF',
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Compute real stats
  const totalXPFromGoals = goals
    .filter(g => g.status === 'completed')
    .reduce((sum, g) => sum + calculateXP(g.difficulty), 0);

  const avgDailyGoals = useMemo(() => {
    const uniqueDates = new Set(goals.map(g => (g.createdAt || '').split('T')[0]).filter(Boolean));
    return uniqueDates.size > 0 ? Math.round(goals.length / uniqueDates.size * 10) / 10 : 0;
  }, [goals]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Export Actions */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-display font-extrabold text-2xl text-white">Productivity Analytics & Reports</h2>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Deep-dive visual analytics, category distribution, and automated export tools.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => StoreService.exportGoalsToExcel(goals)}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-[#10B981]/30 hover:border-[#10B981]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => StoreService.exportPDFReport(user, goals)}
            className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total Goals</span>
          <div className="font-display font-extrabold text-xl text-white">{goals.length}</div>
        </div>
        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#10B981] uppercase">Completed</span>
          <div className="font-display font-extrabold text-xl text-[#10B981]">{goals.filter(g => g.status === 'completed').length}</div>
        </div>
        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total XP Earned</span>
          <div className="font-display font-extrabold text-xl text-[#00E5FF]">{totalXPFromGoals}</div>
        </div>
        <div className="glass-card p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Avg Goals/Day</span>
          <div className="font-display font-extrabold text-xl text-[#C084FC]">{avgDailyGoals}</div>
        </div>
      </div>

      {/* AI Weekly Insight Summary Banner */}
      <div className="glass-card p-6 border-l-4 border-l-[#8B5CF6] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="font-bold text-sm text-white">AI Weekly Productivity Insights</h3>
          </div>
          <span className="badge badge-accent text-[10px] font-mono">Performance Score: {aiInsight.score}/100</span>
        </div>

        <h4 className="font-display font-extrabold text-base text-[#00E5FF]">{aiInsight.headline}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#171717] space-y-1">
            <span className="font-bold text-[#10B981]">Key Strengths:</span>
            <ul className="list-disc list-inside text-[#9CA3AF] space-y-0.5">
              {aiInsight.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-[#171717] space-y-1">
            <span className="font-bold text-[#F59E0B]">Actionable Recommendations:</span>
            <ul className="list-disc list-inside text-[#9CA3AF] space-y-0.5">
              {aiInsight.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Doughnut Category Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00E5FF]" /> Category Distribution Breakdown
          </h3>
          <div className="w-64 h-64 mx-auto flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#9CA3AF' } } } }} />
          </div>
        </div>

        {/* Line Chart — Real data */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10B981]" /> Last 7 Days Consistency Trend
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Line data={lineData} options={{ 
              scales: { 
                x: { ticks: { color: '#9CA3AF' } }, 
                y: { ticks: { color: '#9CA3AF' }, min: 0, max: 100, title: { display: true, text: '%', color: '#6B7280' } }
              } 
            }} />
          </div>
        </div>

      </div>

    </div>
  );
};
