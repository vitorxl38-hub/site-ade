import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileCheck, 
  BarChart3, 
  MessageSquare,
  Search,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

interface Props {
  user: any;
  profile: any;
}

export default function AdminDashboard({ profile }: Props) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'clients');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleNewOnboarding = async () => {
    try {
      const name = prompt('Nome da Empresa:');
      if (!name) return;
      
      await addDoc(collection(db, 'clients'), {
        companyName: name,
        tradingName: name,
        cnpj: '00.000.000/0001-00',
        contractStatus: 'onboarding',
        plan: 'Standard',
        createdAt: serverTimestamp()
      });
      toast.success('Novo cliente em processo de onboarding!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clients');
    }
  };

  const filteredClients = clients.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-emerald" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Painel Administrativo APEX</h2>
          <p className="text-gray-400">Olá, <span className="text-brand-emerald">{profile?.displayName}</span>. Gestão interna ativa.</p>
        </div>
        <button 
          onClick={handleNewOnboarding}
          className="premium-button flex items-center gap-2"
        >
          <UserPlus size={18} />
          Novo Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatCard title="Total Clientes" value={clients.length} icon={Users} color="text-brand-emerald" />
        <AdminStatCard title="Onboarding" value={clients.filter(c => c.contractStatus === 'onboarding').length} icon={FileCheck} color="text-rose-400" />
        <AdminStatCard title="Leads Ativos" value="-" icon={BarChart3} color="text-brand-emerald" />
        <AdminStatCard title="Mensagens" value="-" icon={MessageSquare} color="text-blue-400" />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h3 className="text-lg font-serif italic text-white uppercase tracking-tighter">Gestão de Clientes</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-brand-bg-alt border border-brand-border rounded px-4 py-2 pl-10 text-[10px] uppercase font-bold tracking-widest focus:border-brand-emerald outline-none w-64 text-zinc-300"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-brand-bg-alt/50 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-brand-border">
            <tr>
              <th className="px-6 py-4 font-bold">Empresa</th>
              <th className="px-6 py-4 font-bold">CNPJ</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-zinc-800/10 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-tight">{client.companyName}</p>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-zinc-500">{client.cnpj}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${client.contractStatus === 'active' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-amber-400/10 text-amber-400'}`}>
                    {client.contractStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-500 hover:text-brand-emerald flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest ml-auto transition-transform group-hover:translate-x-1">
                    Gerenciar <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-brand-bg-alt border border-brand-border ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mb-2 font-bold">{title}</p>
          <h4 className="text-2xl font-light text-white">{value}</h4>
        </div>
      </div>
    </div>
  );
}
