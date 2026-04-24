import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import TarefaModal from '../components/TarefaModal';

export default function Planner() {
  const [tarefas, setTarefas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  useEffect(() => {
    async function loadTarefas() {
      try {
        const response = await api.get('/tarefas');
        setTarefas(response.data);
      } catch (error) {
        console.error("Erro ao carregar tarefas", error);
      }
    }
    loadTarefas();
  }, []);

  async function handleAddTarefa(dados) {
    try {
      const { datas, ...rest } = dados;
      const promises = datas.map(data => api.post('/tarefas', { ...rest, data }));
      const responses = await Promise.all(promises);
      const novasTarefas = responses.map(res => res.data);
      setTarefas([...tarefas, ...novasTarefas]);
      setIsModalOpen(false);
    } catch (error) {
      const msg = error.response?.data?.detalhe || "Erro desconhecido";
      alert("Erro ao criar compromisso: " + msg);
    }
  }

  async function handleToggleTarefa(id) {
    try {
      const response = await api.patch(`/tarefas/${id}/alternar`);
      setTarefas(prev => prev.map(t => t.id === id ? response.data.tarefa : t));
    } catch (error) {
      alert("Erro ao atualizar tarefa.");
    }
  }

  async function handleDeleteTarefa(id) {
    if (!confirm("Excluir este compromisso?")) return;
    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      alert("Erro ao excluir tarefa.");
    }
  }

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Lógica simples para pegar os dias da semana atual
  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(dataSelecionada);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Planejador Semanal</h1>
          <p className="text-slate-500 mt-1">Gerencie seus compromissos e tarefas pontuais.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-brand-secondary/20 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>NOVO COMPROMISSO</span>
        </button>
      </header>

      {/* Week Navigation */}
      <div className="space-y-4">
        <div className="glass-card rounded-[2.5rem] p-4 flex items-center justify-between">
          <button 
              onClick={() => {
                  const d = new Date(dataSelecionada);
                  d.setDate(d.getDate() - 7);
                  setDataSelecionada(d);
              }}
              className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
              <ChevronLeft />
          </button>
          <div className="text-center flex flex-col items-center">
            <h2 className="font-bold text-white uppercase tracking-widest text-sm">
                {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-[10px] text-brand-primary md:hidden mt-1 font-medium uppercase tracking-wider">Deslize para ver os dias</p>
          </div>
          <button 
              onClick={() => {
                  const d = new Date(dataSelecionada);
                  d.setDate(d.getDate() + 7);
                  setDataSelecionada(d);
              }}
              className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
              <ChevronRight />
          </button>
        </div>

        {/* Mobile Day Strip - Quick Jump */}
        <div className="sticky top-[70px] z-20 bg-[#020617]/90 backdrop-blur-xl py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex md:hidden justify-between gap-2 overflow-x-auto scrollbar-hide pb-2">
            {weekDays.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const hasTarefas = tarefas.some(t => {
                  const dataTarefa = typeof t.data === 'string' ? t.data : new Date(t.data).toISOString();
                  return dataTarefa.split('T')[0] === dateStr;
              });
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              
              return (
                <button 
                  key={idx}
                  onClick={() => {
                    const element = document.getElementById(`day-col-${idx}`);
                    const yOffset = -160; 
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                  }}
                  className={`flex-1 min-w-[48px] py-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    isToday ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase ${isToday ? 'text-white' : 'text-slate-500'}`}>{diasDaSemana[idx][0]}</span>
                  <span className="text-sm font-black">{day.getDate()}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasTarefas ? (isToday ? 'bg-white' : 'bg-brand-secondary') : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly View - Responsive Timeline/Grid */}
      <div className="flex flex-col md:grid md:grid-cols-7 gap-8 md:gap-4 mt-2 md:mt-6 pb-24 md:pb-0">
        {weekDays.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const tarefasDoDia = tarefas.filter(t => {
            const dataTarefa = typeof t.data === 'string' ? t.data : new Date(t.data).toISOString();
            return dataTarefa.split('T')[0] === dateStr;
          });
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div 
              key={idx} 
              id={`day-col-${idx}`}
              className={`flex flex-col gap-4 relative scroll-mt-[160px] md:scroll-mt-0 ${isToday ? 'md:scale-105 md:z-10' : ''}`}
            >
              {/* Day Header */}
              <div className="flex items-center gap-4 md:block">
                <div className={`flex flex-col items-center justify-center w-14 h-14 md:w-auto md:h-auto md:p-3 shrink-0 rounded-2xl border transition-colors ${
                  isToday 
                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30 border-brand-primary/50' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest md:tracking-tighter ${isToday ? 'text-white' : 'text-slate-500'}`}>{diasDaSemana[idx]}</p>
                  <p className="text-xl md:text-lg font-black leading-none mt-1 md:mt-0">{day.getDate()}</p>
                </div>
                
                {/* Mobile Line Separator & Day Summary */}
                <div className="md:hidden flex-1 flex items-center gap-3">
                  <div className="h-[1px] rounded-full bg-slate-800 flex-1"></div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${tarefasDoDia.length > 0 ? 'text-brand-secondary' : 'text-slate-600'}`}>
                    {tarefasDoDia.length === 0 ? 'Livre' : `${tarefasDoDia.length} ${tarefasDoDia.length === 1 ? 'item' : 'itens'}`}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 flex flex-col gap-3 pl-6 border-l-2 border-slate-800/40 ml-7 md:pl-0 md:border-l-0 md:ml-0">
                {tarefasDoDia.map(tarefa => (
                  <div 
                    key={tarefa.id} 
                    className={`glass-card p-3.5 md:p-4 rounded-2xl border-l-4 group relative transition-all hover:-translate-y-1 hover:shadow-lg ${
                      tarefa.concluida ? 'opacity-50 grayscale' : ''
                    } ${
                      tarefa.prioridade === 'alta' ? 'border-l-red-500 shadow-red-500/10' : 
                      tarefa.prioridade === 'baixa' ? 'border-l-slate-600' : 'border-l-brand-secondary shadow-brand-secondary/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <button onClick={() => handleToggleTarefa(tarefa.id)} className="shrink-0 transition-transform active:scale-90">
                        {tarefa.concluida ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-slate-500" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteTarefa(tarefa.id)}
                        className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className={`text-sm md:text-sm font-bold leading-tight ${tarefa.concluida ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {tarefa.titulo}
                    </p>
                    {tarefa.descricao && <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{tarefa.descricao}</p>}
                  </div>
                ))}
                
                {/* Empty State for the day (Desktop) */}
                {tarefasDoDia.length === 0 && (
                  <div 
                    onClick={() => {
                      setDataSelecionada(day);
                      setIsModalOpen(true);
                    }}
                    className="hidden md:flex flex-1 border-2 border-dashed border-slate-800/50 rounded-2xl items-center justify-center opacity-30 min-h-[100px] hover:opacity-100 transition-all hover:border-brand-primary/50 hover:bg-brand-primary/5 cursor-pointer"
                  >
                      <Plus className="w-5 h-5 text-brand-primary" />
                  </div>
                )}
                {/* Mobile empty state indicator */}
                {tarefasDoDia.length === 0 && (
                  <div className="md:hidden py-2.5 px-4 rounded-xl border border-dashed border-slate-800/50 bg-slate-900/30 text-slate-500 text-xs font-medium inline-flex items-center gap-2 w-fit">
                    <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                    Nenhum compromisso
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tarefas.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center glass-card rounded-[3rem] border-dashed border-2 border-slate-800">
          <CalendarIcon className="w-16 h-16 text-slate-800 mb-6" />
          <h3 className="text-xl font-bold text-slate-400">Nenhum compromisso marcado</h3>
          <p className="text-slate-600 text-sm mt-2 text-center max-w-xs px-6">
            Use o botão no topo para agendar exames, reuniões ou lembretes importantes para sua semana.
          </p>
        </div>
      )}

      <TarefaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTarefa} 
      />
    </div>
  );
}
