import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
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
  ShieldCheck
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Planejador', path: '/planner' },
    { icon: Flame, label: 'Hábitos', path: '/habitos' },
    { icon: BarChart3, label: 'Estatísticas', path: '/analytics' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-slate-800/50 sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <span className="text-white font-black text-xl">R</span>
          </div>
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
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="font-bold text-lg text-white">Ritmo<span className="text-brand-primary">X</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white"><Bell className="w-5 h-5" /></button>
          <div className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-white font-bold text-xs">
            {user?.nome?.[0] || 'U'}
          </div>
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
             <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
             </button>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="text-right">
                   <p className="text-sm font-bold text-white">{user?.nome}</p>
                   <p className="text-xs text-slate-500 capitalize">Pro Level</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.nome?.[0]}
                </div>
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
          className="p-3 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/30 -mt-8 border-4 border-slate-950"
          onClick={() => navigate('/dashboard', { state: { openModal: true } })}
        >
          <Plus className="w-6 h-6" />
        </button>
      </nav>

    </div>
  );
}
