import { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Target, Zap, Trophy } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const response = await api.get('/habitos/dashboard'); // Usando a rota que já traz heatmap
      setStats(response.data);
    }
    loadStats();
  }, []);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium animate-pulse">Analizando seu desempenho...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Estatísticas de Evolução</h1>
        <p className="text-slate-500 mt-1">Visualize sua constância e conquistas acumuladas.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: stats.perfil.xp_acumulado.toLocaleString(), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Hábitos Ativos', value: stats.habitos.length, icon: Target, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Check-ins Totais', value: stats.habitos.reduce((acc, h) => acc + (parseInt(h.total_checkins) || 0), 0), icon: Award, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Nível Atual', value: '4', icon: Trophy, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
        ].map((item, idx) => (
          <div key={idx} className="glass-card rounded-3xl p-6 flex items-center gap-4">
            <div className={`p-3 ${item.bg} rounded-2xl`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-xl font-black text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap Section */}
      <div className="glass-card p-8 rounded-[2.5rem]">
        <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-white flex items-center gap-2">
              Consistência Anual
              <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full uppercase tracking-tighter font-black">Beta</span>
            </h3>
            <div className="flex gap-2 items-center text-[10px] text-slate-500 font-bold uppercase">
              <span>Menos</span>
              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-brand-primary/30 rounded-sm"></div>
              <div className="w-3 h-3 bg-brand-primary/60 rounded-sm"></div>
              <div className="w-3 h-3 bg-brand-primary rounded-sm"></div>
              <span>Mais</span>
            </div>
        </div>
        
        <div className="heatmap-container overflow-x-auto pb-4">
            <div className="min-w-[700px]">
              <CalendarHeatmap
                startDate={new Date('2026-01-01')}
                endDate={new Date('2026-12-31')}
                values={stats.heatmap || []} 
                classForValue={(value) => {
                    if (!value || value.count === 0) return 'color-empty';
                    return `color-scale-${Math.min(value.count, 4)}`;
                }}
                showWeekdayLabels={true}
                weekdayLabels={['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']}
              />
            </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <h3 className="text-lg font-bold text-white mb-6">Medalhas Desbloqueadas</h3>
          <div className="flex flex-wrap gap-6 relative z-10">
            {[
              { day: '3', label: 'Starter', active: true, color: 'text-green-400', border: 'border-green-400/30' },
              { day: '7', label: 'Commitment', active: false, color: 'text-slate-500', border: 'border-slate-800' },
              { day: '15', label: 'Elite', active: false, color: 'text-slate-500', border: 'border-slate-800' },
              { day: '30', label: 'Master', active: false, color: 'text-slate-500', border: 'border-slate-800' },
            ].map((badge, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 ${!badge.active ? 'opacity-40 grayscale' : ''}`}>
                 <div className={`w-16 h-16 rounded-full border-4 ${badge.border} flex items-center justify-center ${badge.color} font-black text-xl bg-slate-900/50 shadow-xl`}>
                   {badge.day}
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{badge.label}</span>
              </div>
            ))}
          </div>
          <Trophy className="absolute -right-6 -bottom-6 w-40 h-40 text-brand-primary/[0.05] -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
        </div>

        <div className="glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-bold text-white mb-6">Insight de IA</h3>
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "Você tem mantido uma consistência incrível nas segundas-feiras! Que tal focar um pouco mais nos seus hábitos de quinta-feira para equilibrar seu ritmo semanal?"
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Sincronizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}