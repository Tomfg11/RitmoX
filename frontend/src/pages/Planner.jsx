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
      const response = await api.post('/tarefas', dados);
      setTarefas([...tarefas, response.data]);
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
        <h2 className="font-bold text-white uppercase tracking-widest text-sm">
            {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
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

      {/* Weekly View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const tarefasDoDia = tarefas.filter(t => {
            const dataTarefa = typeof t.data === 'string' ? t.data : new Date(t.data).toISOString();
            return dataTarefa.split('T')[0] === dateStr;
          });
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div key={idx} className={`flex flex-col gap-4 min-h-[200px] ${isToday ? 'md:scale-105 z-10' : ''}`}>
              <div className={`text-center p-3 rounded-2xl border ${isToday ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/10' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <p className="text-[10px] font-black uppercase tracking-tighter">{diasDaSemana[idx]}</p>
                <p className="text-lg font-black">{day.getDate()}</p>
              </div>

              <div className="flex-1 space-y-3">
                {tarefasDoDia.map(tarefa => (
                  <div 
                    key={tarefa.id} 
                    className={`glass-card p-4 rounded-2xl border-l-4 group relative ${tarefa.concluida ? 'opacity-50' : ''} ${
                      tarefa.prioridade === 'alta' ? 'border-l-red-500' : 
                      tarefa.prioridade === 'baixa' ? 'border-l-slate-600' : 'border-l-brand-secondary'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <button onClick={() => handleToggleTarefa(tarefa.id)}>
                        {tarefa.concluida ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-slate-600" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteTarefa(tarefa.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className={`text-xs font-bold text-slate-100 leading-tight ${tarefa.concluida ? 'line-through text-slate-500' : ''}`}>
                      {tarefa.titulo}
                    </p>
                    {tarefa.descricao && <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{tarefa.descricao}</p>}
                  </div>
                ))}
                {tarefasDoDia.length === 0 && (
                    <div className="h-full border-2 border-dashed border-slate-900 rounded-2xl flex items-center justify-center opacity-20">
                        <Plus className="w-4 h-4" />
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
