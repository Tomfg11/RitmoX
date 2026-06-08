import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Flag, Clock } from 'lucide-react';
import { useNotify } from '../contexts/NotificationContext';

export default function TarefaModal({ isOpen, onClose, onSave, tipo = 'EVENTO' }) {
  const { notify } = useNotify();
  const [titulo, setTitulo] = useState('');
  const [datas, setDatas] = useState([new Date().toISOString().split('T')[0]]);
  const [prioridade, setPrioridade] = useState('normal');
  const [horario, setHorario] = useState('09:00');
  const [diaTodo, setDiaTodo] = useState(false);
  const [descricao, setDescricao] = useState('');

  // Limpa o modal ao abrir
  useEffect(() => {
    if (isOpen) {
      setTitulo('');
      setDatas([new Date().toISOString().split('T')[0]]);
      setPrioridade('normal');
      setHorario('09:00');
      setDiaTodo(false);
      setDescricao('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTarefa = tipo === 'TAREFA';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md rounded-[2.5rem] p-6 sm:p-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">{isTarefa ? 'Nova Tarefa' : 'Novo Compromisso'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{isTarefa ? 'O que precisa ser feito?' : 'O que você vai fazer?'}</label>
            <input 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all placeholder:text-slate-700"
              value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder={isTarefa ? "Ex: Comprar cebola, Pagar boleto..." : "Ex: Exame Médico, Reunião, etc."}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 flex-1">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{isTarefa ? 'Data Limite (Prazo)' : 'Data(s)'}</label>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-hide">
                    {datas.map((data, index) => (
                        <div key={index} className="flex gap-2">
                            <div className="relative flex-1">
                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="date"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-white text-xs focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
                                    value={data} 
                                    onChange={e => {
                                        const novasDatas = [...datas];
                                        novasDatas[index] = e.target.value;
                                        setDatas(novasDatas);
                                    }}
                                />
                            </div>
                            {!isTarefa && datas.length > 1 && (
                                <button 
                                    onClick={() => {
                                        const novasDatas = datas.filter((_, i) => i !== index);
                                        setDatas(novasDatas);
                                    }}
                                    className="px-4 text-slate-500 hover:text-red-500 bg-slate-900/50 border border-slate-800 rounded-2xl transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {!isTarefa && (
                  <button
                      onClick={() => {
                          const lastDate = datas[datas.length - 1];
                          setDatas([...datas, lastDate]);
                      }}
                      className="text-[10px] uppercase font-black tracking-widest text-brand-primary hover:text-brand-secondary transition-all ml-1 mt-1"
                  >
                      + Adicionar outro dia
                  </button>
                )}
            </div>
            <div className="space-y-4">
                {!isTarefa && (
                  <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1 mb-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Horário</label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                  type="checkbox" 
                                  checked={diaTodo} 
                                  onChange={e => setDiaTodo(e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                              />
                              <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-300 transition-colors">O dia todo</span>
                          </label>
                      </div>
                      
                      {!diaTodo ? (
                          <div className="relative">
                              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input 
                                  type="time"
                                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-white text-xs focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
                                  value={horario} onChange={e => setHorario(e.target.value)}
                              />
                          </div>
                      ) : (
                          <div className="w-full bg-slate-900/20 border border-slate-800/50 rounded-2xl px-4 py-4 text-slate-500 text-xs text-center border-dashed flex items-center justify-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              Evento de dia inteiro
                          </div>
                      )}
                  </div>
                )}
                <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Prioridade</label>
                    <div className="relative">
                        <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select 
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-white text-xs focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all appearance-none"
                            value={prioridade} onChange={e => setPrioridade(e.target.value)}
                        >
                            <option value="baixa">Baixa</option>
                            <option value="normal">Normal</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Notas extras (opcional)</label>
            <textarea 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all placeholder:text-slate-700 h-24 resize-none text-sm"
              value={descricao} onChange={e => setDescricao(e.target.value)}
              placeholder="Algum detalhe importante?"
            />
          </div>

          <button 
            onClick={() => {
              if (!titulo.trim()) {
                notify('Nome Inválido', 'Por favor, dê um nome.', 'error');
                return;
              }
              // Se for tarefa, salva a data como data_limite
              const dataParaSalvar = isTarefa ? new Date().toISOString().split('T')[0] : null;
              const payload = {
                 titulo,
                 datas: isTarefa ? [dataParaSalvar] : datas.map(d => diaTodo ? `${d}T09:00:00` : `${d}T${horario}:00`),
                 data_limite: isTarefa ? datas[0] : null,
                 prioridade,
                 descricao
              };
              onSave(payload);
            }}
            className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand-secondary/20 active:scale-[0.98] mt-4"
          >
            {isTarefa ? 'ADICIONAR TAREFA' : 'ADICIONAR AO PLANNER'}
          </button>
        </div>
      </div>
    </div>
  );
}
