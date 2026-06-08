import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useNotify } from '../contexts/NotificationContext';
import api from '../services/api';
import TarefaModal from './TarefaModal';
import HabitoModal from './HabitoModal';
import NotificationButton from './NotificationButton';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Bell,
  User,
  Plus,
  Flame,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false);
  const [isHabitoModalOpen, setIsHabitoModalOpen] = useState(false);
  const [tarefaTipo, setTarefaTipo] = useState('EVENTO');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Planejador', path: '/planner' },
    { icon: Flame, label: 'Hábitos', path: '/habitos' },
    { icon: BarChart3, label: 'Estatísticas', path: '/analytics' }
  ];

  async function handleSaveTarefaGlobal(dados) {
    try {
      const { datas, ...rest } = dados;
      const dadosComTipo = { ...rest, tipo: tarefaTipo };
      const promises = datas.map(data => api.post('/tarefas', { ...dadosComTipo, data }));
      await Promise.all(promises);
      setIsTarefaModalOpen(false);
      notify('Sucesso', 'Criado com sucesso!', 'success');
      window.dispatchEvent(new Event('ritmox-update-tarefas'));
    } catch (error) {
      alert("Erro ao criar: " + (error.response?.data?.detalhe || error.message));
    }
  }

  async function handleSaveHabitoGlobal(dados) {
    try {
      await api.post('/habitos/', dados);
      setIsHabitoModalOpen(false);
      notify('Sucesso', 'Hábito criado com sucesso!', 'success');
      window.dispatchEvent(new Event('ritmox-update-habitos'));
    } catch (error) {
      alert("Erro ao criar hábito: " + (error.response?.data?.detalhe || error.message));
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-slate-800/50 sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          {/* <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <span className="text-white font-black text-xl">R</span>
          </div> */}
          <span className="font-bold text-xl tracking-tight text-white">Ritmo<span className="text-brand-primary">X</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm shadow-brand-primary/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden glass border-b border-slate-800/50 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">R</span>
          </div> */}
          <span className="font-bold text-lg text-white">Ritmo<span className="text-brand-primary">X</span></span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationButton />
          <NavLink to="/settings" className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-white font-bold text-xs hover:ring-2 hover:ring-white transition-all">
            {user?.nome?.[0] || 'U'}
          </NavLink>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Desktop Header (Top Bar) */}
        <header className="hidden md:flex glass border-b border-slate-800/50 px-8 py-4 justify-between items-center z-40">
          <h1 className="text-lg font-semibold text-white">Bem-vindo, {user?.nome?.split(' ')[0]}!</h1>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
              />
            </div>
            <NotificationButton />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user?.nome}</p>
                <p className="text-xs text-slate-500 capitalize">Pro Level</p>
              </div>
              <NavLink to="/settings" className="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:ring-2 hover:ring-white transition-all cursor-pointer">
                {user?.nome?.[0] || 'U'}
              </NavLink>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass border-t border-slate-800/50 fixed bottom-0 left-0 right-0 z-50 px-4 py-2 flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 p-2 transition-all duration-200
              ${isActive ? 'text-brand-primary' : 'text-slate-500'}
            `}
          >
            <item.icon className={`w-6 h-6 ${item.label === 'Planejador' ? 'text-brand-secondary' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}


        <button
          className={`p-3 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/30 -mt-8 border-4 border-slate-950 transition-transform ${isFabMenuOpen ? 'rotate-45 bg-red-500 shadow-red-500/30' : ''}`}
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
        >
          <Plus className="w-6 h-6" />
        </button>
      </nav>

      {/* Centered Modal Action Items */}
      {isFabMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white tracking-tight">O que deseja criar?</h2>
              <button onClick={() => setIsFabMenuOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setIsFabMenuOpen(false); setIsHabitoModalOpen(true); }}
                className="flex items-center gap-4 bg-slate-900/80 hover:bg-slate-800 text-white px-6 py-5 rounded-2xl shadow-lg border border-slate-700/50 transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Hábito</p>
                  <p className="text-xs text-slate-400">Rotinas para o dia a dia</p>
                </div>
              </button>

              <button
                onClick={() => { setIsFabMenuOpen(false); setTarefaTipo('EVENTO'); setIsTarefaModalOpen(true); }}
                className="flex items-center gap-4 bg-slate-900/80 hover:bg-slate-800 text-white px-6 py-5 rounded-2xl shadow-lg border border-slate-700/50 transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-brand-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Compromisso</p>
                  <p className="text-xs text-slate-400">Evento com data marcada</p>
                </div>
              </button>

              <button
                onClick={() => { setIsFabMenuOpen(false); setTarefaTipo('TAREFA'); setIsTarefaModalOpen(true); }}
                className="flex items-center gap-4 bg-slate-900/80 hover:bg-slate-800 text-white px-6 py-5 rounded-2xl shadow-lg border border-slate-700/50 transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Tarefa</p>
                  <p className="text-xs text-slate-400">Afazeres soltos da semana</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <TarefaModal isOpen={isTarefaModalOpen} onClose={() => setIsTarefaModalOpen(false)} onSave={handleSaveTarefaGlobal} tipo={tarefaTipo} />
      <HabitoModal isOpen={isHabitoModalOpen} onClose={() => setIsHabitoModalOpen(false)} onSave={handleSaveHabitoGlobal} />
    </div>
  );
}
