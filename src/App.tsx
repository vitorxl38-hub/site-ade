import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import DashboardLayout from './components/layout/DashboardLayout';
import AuthPage from './pages/AuthPage';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIConsultancy from './components/AIConsultancy';
import FinancePage from './pages/FinancePage';
import InventoryPage from './pages/InventoryPage';
import DocumentsPage from './pages/DocumentsPage';
import SupportPage from './pages/SupportPage';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Auth state change took too long, forcing load...');
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      } else {
        // Fetch real-time profile
        const unsubProfile = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
            if (snap.data().role === 'admin') setView('admin');
          } else {
            // Profile might not exist yet if syncUser is still running
            // We still need to stop loading so the user can see something
            setProfile({ uid: u.uid, displayName: u.displayName || 'Usuário', role: 'client', clientId: 'client-1' });
          }
          setLoading(false);
          clearTimeout(timer);
        }, (err) => {
          console.error('Profile snapshot error:', err);
          setLoading(false);
          clearTimeout(timer);
        });
        return () => unsubProfile();
      }
      clearTimeout(timer);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []); // Empty dependency array

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 animate-pulse font-bold">Iniciando Apex System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  const renderContent = () => {
    if (view === 'admin') return <AdminDashboard user={user} profile={profile} />;
    
    const props = { user, profile, onNavigate: setActiveTab };

    switch (activeTab) {
      case 'dashboard': return <ClientDashboard {...props} />;
      case 'finance': return <FinancePage {...props} />;
      case 'inventory': return <InventoryPage {...props} />;
      case 'docs': return <DocumentsPage {...props} />;
      case 'support': return <SupportPage {...props} />;
      case 'consultancy': return <AIConsultancy {...props} />;
      default: return <ClientDashboard {...props} />;
    }
  };

  return (
    <DashboardLayout 
      user={user} 
      currentView={view} 
      setView={setView}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
      <Toaster position="top-right" theme="dark" />
    </DashboardLayout>
  );
}
