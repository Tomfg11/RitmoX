import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  CheckCircle2, 
  Trophy, 
  Flame, 
  Plus, 
  PlusCircle, 
  Calendar as CalendarIcon,
  Bell,
  Sparkles
} from 'lucide-react';
import HabitoModal from '../components/HabitoModal'; 
import { Link } from 'react-router-dom';

import { useNotify } from '../contexts/NotificationContext';

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const { notify } = useNotify();
  const [data, setData] = useState(null);
  const [humorHoje, setHumorHoje] = useState(0);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isResumoModalOpen, setIsResumoModalOpen] = useState(false);
  const [resumoTexto, setResumoTexto] = useState('');
  const [habitoSelecionado, setHabitoSelecionado] = useState(null);

  useEffect(() => {
    loadInitialData();
    
    const alreadyGreeted = sessionStorage.getItem('@RitmoX:greeting_shown');
    
    if (!alreadyGreeted) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
      setTimeout(() => {
        notify("RitmoX Ativo", `${greeting}! Não esqueça de registrar seu humor e hábitos de hoje. 🚀`);
        sessionStorage.setItem('@RitmoX:greeting_shown', 'true');
      }, 1500);
    }
  }, []);

  async function loadInitialData() {
    try {
      setError(false);
      await Promise.all([
        loadDashboard(),
        loadHumor()
      ]);
    } catch (err) {
      setError(true);
    }
  }

  async function loadDashboard() {
    const response = await api.get('/habitos/dashboard');
    setData(response.data);
  }

  async function loadHumor() {
    const response = await api.get('/humor/hoje');
    setHumorHoje(response.data.nivel);
  }

  async function handleMoodSelect(nivel) {
    if (humorHoje > 0) return;

    try {
      const response = await api.post('/humor', { nivel });
      setHumorHoje(nivel);
      
      if (data) {
        setData({ ...data, perfil: { ...data.perfil, xp_acumulado: response.data.xp_total } });
      }

      notify("Mood Registrado", "Seu humor de hoje foi salvo com sucesso! +10 XP 🧠");
    } catch (error) {
      notify("Erro", "Não foi possível registrar seu humor.");
    }
  }

  function abrirModalResumo(habito) {
    setHabitoSelecionado(habito);
    setIsResumoModalOpen(true);
  }

  async function salvarResumo() {
    try {
      await api.post(`/habitos/${habitoSelecionado.id}/resumo`, { 
        conteudo: resumoTexto 
      });
      
      setIsResumoModalOpen(false);
      setHabitoSelecionado(null);
      setResumoTexto('');
      notify("Evolução", "Insight salvo com sucesso! 🧠");
    } catch (error) {
      notify("Erro", "Não foi possível salvar o resumo.");
    }
  }

  async function handleCreateHabito(dados) {
    try {
      await api.post('/habitos/', {
        titulo: dados.titulo,
        xp_recompensa: dados.xp_recompensa,
        dias_semana: dados.dias_semana,
        frequencia: 'personalizado'
      });

      loadDashboard();
      setIsModalOpen(false);
      notify("Sucesso", "Hábito criado com sucesso! 🚀");
    } catch (error) {
      notify("Erro", "Não foi possível criar o hábito.");
    }
  }

  async function handleCheckIn(habitoId) {
    try {
      await api.post(`/habitos/${habitoId}/checkin`, {
        notas_de_reflexao: "Check-in realizado pelo Dashboard!"
      });

      loadDashboard();
      notify("Boa!", "XP computado com sucesso. 🔥");
    } catch (error) {
      notify("Atenção", error.response?.data?.erro || "Erro ao fazer check-in");
    }
  }

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-3xl">⚠️</div>
      <div>
        <h2 className="text-white font-bold text-xl mb-2">Ops! Problema na conexão</h2>
        <p className="text-slate-400 max-w-xs mx-auto">Não conseguimos sincronizar seu ritmo. Verifique sua internet ou tente novamente.</p>
      </div>
      <button 
        onClick={loadInitialData}
        className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        Tentar Novamente
      </button>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium animate-pulse">Sincronizando seu ritmo...</p>
    </div>
  );

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Mood Tracker Header */}
        <section className="glass-card rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand-primary/5 to-transparent border border-brand-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h3 className="font-bold text-white">Como você está se sentindo hoje?</h3>
              <p className="text-xs text-slate-500">Rastrear seu humor ajuda a entender seu ritmo.</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['😔', '😐', '🙂', '😊', '🤩'].map((emoji, i) => (
              <button 
                key={i} 
                onClick={() => handleMoodSelect(i + 1)}
                disabled={humorHoje > 0}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${humorHoje === i + 1 ? 'bg-brand-primary/20 border-2 border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-white/5 border border-white/5'} ${humorHoje > 0 && humorHoje !== i + 1 ? 'opacity-30 grayscale' : 'hover:scale-110 active:scale-95 hover:bg-white/10'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-brand-primary/20 rounded-2xl">
                  <Flame className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Seu Ritmo Atual</h2>
                  <p className="text-slate-400 text-sm">Você está em uma sequência de {data.habitos.reduce((max, h) => Math.max(max, h.streak), 0)} dias!</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-brand-primary">Nível 4</span>
                  <span className="text-slate-500">{data.perfil.xp_acumulado} / 5000 XP</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${(data.perfil.xp_acumulado % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <Trophy className="absolute -right-8 -bottom-8 w-48 h-48 text-white/[0.03] -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center border-brand-secondary/20">
            <p className="text-slate-400 text-sm mb-1 font-medium">XP Total</p>
            <span className="text-5xl font-black text-white mb-2 tracking-tighter">
              {data.perfil.xp_acumulado.toLocaleString()}
            </span>
            <div className="px-4 py-1.5 bg-brand-secondary/10 text-brand-secondary rounded-full text-xs font-bold border border-brand-secondary/20">
              Rank: Mestre do Ritmo
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-xl font-bold text-white">Hábitos de Hoje</h3>
              <p className="text-slate-500 text-xs mt-1">Mantenha a constância para evoluir.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-brand-primary/20 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline">Novo Hábito</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.habitos.map(habito => (
              <div 
                key={habito.id} 
                className={`glass-card rounded-3xl p-5 border-l-4 transition-all duration-300 group ${habito.concluido_hoje ? 'border-l-green-500 bg-green-500/10 shadow-[0_0_25px_rgba(34,197,94,0.15)]' : 'border-l-transparent hover:border-l-brand-primary'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${habito.concluido_hoje ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-slate-900 border-slate-800 group-hover:border-brand-primary/30 group-hover:bg-brand-primary/5'}`}>
                      <Flame className={`w-6 h-6 ${habito.concluido_hoje ? 'text-green-400' : (habito.streak > 0 ? 'text-orange-500' : 'text-slate-600')}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-brand-primary transition-colors">{habito.titulo}</h4>
                      <div className="flex items-center gap-2">
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{habito.xp_recompensa} XP</p>
                         {habito.streak > 0 && (
                            <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-1.5 rounded-sm">🔥 {habito.streak}</span>
                         )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => abrirModalResumo(habito)}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${i < (habito.total_checkins % 6) ? 'bg-brand-primary' : 'bg-slate-800'}`}></div>
                    ))}
                  </div>
                  <button 
                    onClick={() => !habito.concluido_hoje && handleCheckIn(habito.id)}
                    disabled={habito.concluido_hoje}
                    className={`px-6 py-2 text-xs font-black rounded-xl transition-all border shadow-sm active:scale-95 flex items-center gap-2 ${habito.concluido_hoje ? 'bg-green-500 border-green-500 text-white cursor-default' : 'bg-slate-900 hover:bg-brand-primary text-white border-slate-800 hover:border-brand-primary'}`}
                  >
                    {habito.concluido_hoje ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        CONCLUÍDO
                      </>
                    ) : 'CONCLUIR'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-xl font-bold text-white">Próximos Compromissos</h3>
              <p className="text-slate-500 text-xs mt-1">O que você não pode esquecer esta semana.</p>
            </div>
            <Link to="/planner" className="text-brand-secondary text-sm font-bold hover:underline">Ver Agenda</Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {data.tarefas && data.tarefas.length > 0 ? (
              data.tarefas.map(tarefa => (
                <div key={tarefa.id} className={`min-w-[250px] glass-card p-5 rounded-3xl border-l-4 ${tarefa.prioridade === 'alta' ? 'border-l-red-500' : 'border-l-brand-secondary'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${tarefa.prioridade === 'alta' ? 'text-red-500' : 'text-brand-secondary'}`}>
                    {tarefa.prioridade === 'alta' ? 'Urgente' : 'Planejado'}
                  </p>
                  <h4 className="font-bold text-white mb-2">{tarefa.titulo}</h4>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                    <CalendarIcon className="w-3 h-3" />
                    <span>
                      {new Date(tarefa.data).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long',
                        timeZone: 'UTC' // Importante para evitar problemas de fuso horário com datas puras
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-8 flex flex-col items-center justify-center glass-card rounded-3xl border border-dashed border-white/10">
                <CalendarIcon className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm font-medium">Nenhum compromisso marcado.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      
      <HabitoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleCreateHabito} 
      />
      
      {isResumoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#161b2c] w-full max-w-lg rounded-3xl p-8 border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
                Resumo: {habitoSelecionado?.titulo}
            </h2>
            
            <textarea
                className="w-full bg-[#1f253d] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none mb-6"
                placeholder="O que você aprendeu ou evoluiu hoje?"
                value={resumoTexto}
                onChange={(e) => setResumoTexto(e.target.value)}
            />

            <div className="flex gap-3">
                <button 
                onClick={() => setIsResumoModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                Cancelar
                </button>
                <button 
                onClick={salvarResumo}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/40"
                >
                Salvar Insight
                </button>
            </div>
            </div>
        </div>
      )}
    </>
  );
}