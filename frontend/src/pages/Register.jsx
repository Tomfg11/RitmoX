import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/registro', { nome, email, senha });
      alert("Conta criada com sucesso! Agora aguarde a aprovação de um administrador para poder acessar a plataforma.");
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Criar Conta</h1>
          <p className="text-slate-400 text-sm font-medium">Comece sua jornada no RitmoX hoje.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-slate-700"
                placeholder="Seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-slate-700"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="password"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-primary/25 active:scale-[0.98] mt-6 group disabled:opacity-50"
          >
            {loading ? 'CRIANDO...' : (
              <>
                <span>CRIAR CONTA</span>
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/50 pt-8">
           <p className="text-slate-500 text-xs font-medium">Já tem uma conta? <Link to="/" className="text-brand-primary font-bold hover:underline">Faça login</Link></p>
        </div>
      </div>
    </div>
  );
}
