import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await login(email, senha);
            navigate('/dashboard');
        } catch (error) {
            const mensagem = error.response?.data?.erro || "Erro ao logar.";
            alert(mensagem);
        }
    }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/40 mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
             <span className="text-white font-black text-3xl">R</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Ritmo<span className="text-brand-primary">X</span></h1>
          <p className="text-slate-400 text-sm font-medium">Vença a procrastinação e domine seu tempo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all placeholder:text-slate-700"
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
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-primary/25 active:scale-[0.98] mt-8 group"
          >
            <span>ENTRAR NO RITMO</span>
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 text-center">
           <p className="text-slate-500 text-xs font-medium">Ainda não tem conta? <Link to="/register" className="text-brand-primary font-bold hover:underline">Cadastre-se</Link></p>
        </div>
      </div>
    </div>
  );
}