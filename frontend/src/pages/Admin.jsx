import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, UserX, Clock, Search, ShieldAlert } from 'lucide-react';

export default function Admin() {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarPendentes();
  }, []);

  async function carregarPendentes() {
    try {
      const response = await api.get('/admin/pendentes');
      setPendentes(response.data);
    } catch (error) {
      console.error("Erro ao carregar pendentes", error);
    } finally {
      setLoading(false);
    }
  }

  async function aprovar(id) {
    try {
      await api.post(`/admin/aprovar/${id}`);
      setPendentes(pendentes.filter(p => p.id !== id));
      alert("Usuário aprovado com sucesso!");
    } catch (error) {
      alert("Erro ao aprovar usuário.");
    }
  }

  async function reprovar(id) {
    if (!confirm("Tem certeza que deseja reprovar este cadastro? O registro será excluído.")) return;
    try {
      await api.delete(`/admin/reprovar/${id}`);
      setPendentes(pendentes.filter(p => p.id !== id));
      alert("Cadastro removido.");
    } catch (error) {
      alert("Erro ao reprovar usuário.");
    }
  }

  const usuariosFiltrados = pendentes.filter(u => 
    u.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    u.email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Aprovações Pendentes</h2>
          <p className="text-slate-400 mt-1 font-medium">Gerencie o acesso de novos usuários à plataforma.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Filtrar por nome ou e-mail..." 
            className="bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center border-dashed border-2 border-slate-800">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tudo em dia!</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Não há novos cadastros aguardando aprovação no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {usuariosFiltrados.map((usuario) => (
            <div 
              key={usuario.id} 
              className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-5 w-full">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-brand-primary font-black text-xl shadow-inner">
                  {usuario.nome[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">{usuario.nome}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-slate-400 text-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-slate-400 text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                      {usuario.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => reprovar(usuario.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Reprovar
                </button>
                <button 
                  onClick={() => aprovar(usuario.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                >
                  <UserCheck className="w-4 h-4" />
                  Aprovar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
