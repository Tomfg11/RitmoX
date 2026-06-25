import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotify } from '../contexts/NotificationContext';

export default function HabitoModal({ isOpen, onClose, onSave, initialData = null }) {
  const { notify } = useNotify();
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState('Normal');
  const [periodo, setPeriodo] = useState('Qualquer');
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [metaDiaria, setMetaDiaria] = useState(1);

  const xpMap = { Baixa: 5, Normal: 10, Alta: 15 };

  const diasDaSemana = [
    { id: '0', label: 'D' },
    { id: '1', label: 'S' },
    { id: '2', label: 'T' },
    { id: '3', label: 'Q' },
    { id: '4', label: 'Q' },
    { id: '5', label: 'S' },
    { id: '6', label: 'S' },
  ];

  // Sincroniza o estado quando o modal abre para edição
  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo);

      const xpVal = initialData.xp_recompensa;
      if (xpVal <= 5) setPrioridade('Baixa');
      else if (xpVal >= 15) setPrioridade('Alta');
      else setPrioridade('Normal');

      setDiasSelecionados(initialData.dias_semana ? initialData.dias_semana.split(',') : []);
      setMetaDiaria(initialData.meta_diaria || 1);
      setPeriodo(initialData.periodo || 'Qualquer');
    } else {
      setTitulo('');
      setPrioridade('Normal');
      setPeriodo('Qualquer');
      setDiasSelecionados([]);
      setMetaDiaria(1);
    }
  }, [initialData, isOpen]);

  const toggleDia = (id) => {
    setDiasSelecionados(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md rounded-[2.5rem] p-6 sm:p-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">{initialData ? 'Editar Hábito' : 'Novo Hábito'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Hábito</label>
            <input
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all placeholder:text-slate-700"
              value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Meditação Matinal"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Dias da Semana</label>
            <div className="flex justify-between gap-1">
              {diasDaSemana.map(dia => (
                <button
                  key={dia.id}
                  onClick={() => toggleDia(dia.id)}
                  className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${diasSelecionados.includes(dia.id)
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-600'
                    }`}
                >
                  {dia.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 ml-1">Se nenhum for selecionado, será diário.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Meta Diária</label>
              <div className="relative">
                <input
                  type="number" min="1"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
                  value={metaDiaria} onChange={e => setMetaDiaria(e.target.value)}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-brand-primary text-xs tracking-widest">VEZ</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Período</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all appearance-none font-bold"
                  value={periodo}
                  onChange={e => setPeriodo(e.target.value)}
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Qualquer">Qualquer</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Prioridade</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all appearance-none font-bold"
                  value={prioridade}
                  onChange={e => setPrioridade(e.target.value)}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!titulo.trim()) {
                notify('Nome Inválido', 'Por favor, dê um nome ao seu hábito.', 'error');
                return;
              }
              const metaFinal = parseInt(metaDiaria) || 1;
              const xpFinal = xpMap[prioridade] || 10;
              onSave({ titulo, xp_recompensa: xpFinal, dias_semana: diasSelecionados.join(','), meta_diaria: metaFinal, periodo });
            }}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98] mt-4"
          >
            {initialData ? 'ATUALIZAR HÁBITO' : 'SALVAR HÁBITO'}
          </button>
        </div>
      </div>
    </div>
  );
}