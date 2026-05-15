import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Files, 
  Package, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Compass,
  Briefcase
} from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  children: React.ReactNode;
  user: User;
  currentView: 'client' | 'admin';
  setView: (view: 'client' | 'admin') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardLayout({ children, user, currentView, setView, activeTab, setActiveTab }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'finance', label: 'Financeiro', icon: Receipt },
    { id: 'docs', label: 'Documentos', icon: Files },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'support', label: 'Suporte', icon: Briefcase },
    { id: 'consultancy', label: 'Consultoria', icon: Compass },
  ];

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-brand-bg flex text-zinc-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-brand-border bg-brand-bg-alt/50 backdrop-blur-xl">
        <div className="p-8">
          <div className="flex items-baseline gap-2 mb-10">
            <h1 className="text-2xl font-bold tracking-tighter text-white">APEX <span className="text-brand-emerald">SYSTEM</span></h1>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">Módulos</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (currentView === 'admin') setView('client');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors",
                  activeTab === item.id && currentView === 'client' 
                    ? "bg-brand-emerald/10 text-brand-emerald" 
                    : "hover:bg-brand-emerald/10 hover:text-brand-emerald text-zinc-400"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-12 space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">Administrativo</p>
            <button
              onClick={() => setView(currentView === 'admin' ? 'client' : 'admin')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors",
                currentView === 'admin' ? "bg-brand-emerald text-black" : "text-zinc-400 hover:bg-brand-emerald/10 hover:text-brand-emerald"
              )}
            >
              <Briefcase size={16} />
              {currentView === 'admin' ? 'Voltar para App' : 'Área Apex'}
            </button>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-brand-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-brand-emerald font-bold italic">
              {user.displayName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName || 'Usuário APEX'}</p>
              <p className="text-[10px] text-zinc-500 uppercase leading-none truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-bg-alt/80 backdrop-blur-md border-b border-brand-border z-50 flex items-center justify-between px-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-bold tracking-tighter text-white">APEX <span className="text-brand-emerald">SYSTEM</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[100] bg-brand-bg flex flex-col p-8"
          >
            <div className="flex justify-end mb-8">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={28} className="text-zinc-400" />
              </button>
            </div>
            <div className="space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (currentView === 'admin') setView('client');
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl bg-brand-panel border border-brand-border transition-colors",
                    activeTab === item.id && currentView === 'client' ? "text-brand-emerald border-brand-emerald/50" : "text-zinc-300"
                  )}
                >
                  <item.icon size={20} className={cn(activeTab === item.id && currentView === 'client' ? "text-brand-emerald" : "text-zinc-500")} />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-20 lg:pt-0 overflow-y-auto min-h-screen">
        <header className="hidden lg:flex h-20 items-center justify-between px-10 border-b border-brand-border sticky top-0 bg-brand-bg/80 backdrop-blur-md z-40">
          <div className="flex items-baseline gap-4">
            <h1 className="text-lg font-bold tracking-tighter text-white uppercase">
              {currentView === 'client' ? 'Dashboard' : 'Admin'}
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Inteligência Empresarial</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 hover:text-brand-emerald transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-emerald rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-brand-border"></div>
            <div className="text-right">
              <p className="text-xs font-semibold text-white">Plano Premium</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-mono italic">"Decisões inteligentes começam na contabilidade"</p>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
