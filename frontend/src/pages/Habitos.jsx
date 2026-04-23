import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Flame, 
  Settings2, 
  Trash2, 
  Plus, 
  BarChart3, 
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import HabitoModal from '../components/HabitoModal';

export default function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitoParaEditar, setHabitoParaEditar] = useState(null);

  useEffect(() => {
    loadHabitos();
  }, []);

  async function loadHabitos() {
    try {
      const response = await api.get('/habitos/');
      setHabitos(response.data);
    } catch (error) {
      console.error("Erro ao carregar hábitos", error);
    }
  }

  async function handleSaveHabito(dados) {
    try {
      if (habitoParaEditar) {
        await api.put(`/habitos/${habitoParaEditar.id}`, dados);
      } else {
        await api.post('/habitos/', dados);
      }
      loadHabitos();
      setIsModalOpen(false);
      setHabitoParaEditar(null);
    } catch (error) {
      alert("Erro ao salvar hábito.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir este hábito? Todo o progresso será perdido.")) return;
    try {
      await api.delete(`/habitos/${id}`);
      setHabitos(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      alert("Erro ao excluir hábito.");
    }
  }

  async function handleCheckIn(habitoId) {
    try {
      await api.post(`/habitos/${habitoId}/checkin`, {
        notas_de_reflexao: "Check-in realizado pela tela de hábitos!"
      });
      loadHabitos(); // Recarrega para atualizar a ofensiva (+1 dia)
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao fazer check-in");
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gerenciar Hábitos</h1>
          <p className="text-slate-500 mt-1">Ajuste suas metas e veja sua consistência.</p>
        </div>
        <button 
          onClick={() => { setHabitoParaEditar(null); setIsModalOpen(true); }}
          className="p-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {habitos.map(habito => (
          <div key={habito.id} className="glass-card rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-brand-primary/30 transition-all">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${habito.concluido_hoje ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-slate-900 border-slate-800 group-hover:bg-brand-primary/5'}`}>
                <Flame className={`w-8 h-8 ${habito.concluido_hoje ? 'text-green-400' : (habito.streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-700')}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{habito.titulo}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                    {habito.streak} DIAS DE OFENSIVA
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {habito.xp_recompensa} XP / DIA
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
               <button 
                 onClick={() => !habito.concluido_hoje && handleCheckIn(habito.id)}
                 disabled={habito.concluido_hoje}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                   habito.concluido_hoje 
                   ? 'bg-green-500/20 text-green-500 border border-green-500/20 cursor-default' 
                   : 'bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-95'
                 }`}
               >
                 {habito.concluido_hoje ? (
                   <>
                     <CheckCircle2 className="w-4 h-4" />
                     CONCLUÍDO
                   </>
                 ) : (
                   <>
                     <Plus className="w-4 h-4" />
                     CONCLUIR HOJE
                   </>
                 )}
               </button>

               <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-400">{habito.total_checkins} check-ins</span>
               </div>
               
               <button 
                 onClick={() => { setHabitoParaEditar(habito); setIsModalOpen(true); }}
                 className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
               >
                 <Settings2 className="w-5 h-5" />
               </button>
               
               <button 
                 onClick={() => handleDelete(habito.id)}
                 className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
            </div>
          </div>
        ))}

        {habitos.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center glass-card rounded-[3rem] border-dashed border-2 border-slate-800">
                <AlertCircle className="w-16 h-16 text-slate-800 mb-6" />
                <p className="text-slate-500 font-bold">Nenhum hábito cadastrado ainda.</p>
            </div>
        )}
      </div>

      <HabitoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabito}
        initialData={habitoParaEditar}
      />
    </div>
  );
}
