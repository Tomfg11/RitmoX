import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Admin from './Admin';
import { User, Bell, ShieldCheck, Lock } from 'lucide-react';

export default function Settings() {
  const { user, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'approvals' : 'profile');

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Lock },
  ];

  if (isAdmin) {
    tabs.push({ id: 'approvals', label: 'Aprovações', icon: ShieldCheck });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Configurações</h2>
        <p className="text-slate-400 mt-1 font-medium">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs Sidebar */}
        <aside className="md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'approvals' && isAdmin && <Admin hideHeader={true} />}
          
          {activeTab === 'profile' && (
            <div className="glass-card rounded-[2rem] p-8 border border-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-6">Informações do Perfil</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                    {user?.nome?.[0]}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all">
                      Alterar Foto
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      defaultValue={user?.nome}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">E-mail</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      disabled
                      className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <button className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/20">
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card rounded-[2rem] p-8 border border-slate-800/50 text-center py-20">
              <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Preferências de Notificação</h3>
              <p className="text-slate-500">Em breve você poderá configurar seus alertas aqui.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card rounded-[2rem] p-8 border border-slate-800/50 text-center py-20">
              <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Segurança da Conta</h3>
              <p className="text-slate-500">Configurações de senha e autenticação em dois fatores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
