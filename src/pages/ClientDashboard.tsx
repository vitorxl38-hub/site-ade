import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Download, 
  FileText, 
  AlertCircle,
  Plus,
  ArrowRight,
  Package,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import AIConsultancy from '@/components/AIConsultancy';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface Props {
  user: any;
  profile: any;
  onNavigate: (tab: string) => void;
}

export default function ClientDashboard({ onNavigate, profile }: Props) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  const fetchDashboardData = (clientId: string) => {
    // Recent Transactions
    const qT = query(
      collection(db, 'transactions'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubT = onSnapshot(qT, (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    // Inventory
    const qI = query(
      collection(db, 'inventory'),
      where('clientId', '==', clientId)
    );
    const unsubI = onSnapshot(qI, (s) => setInventoryItems(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

    // Recent Docs
    const qD = query(
      collection(db, 'documents'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubD = onSnapshot(qD, (s) => setRecentDocs(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.LIST, 'documents'));

    setLoading(false);
    return () => {
      unsubT();
      unsubI();
      unsubD();
    };
  };

  useEffect(() => {
    if (!profile?.clientId) return;
    const cleanup = fetchDashboardData(profile.clientId);
    return () => cleanup();
  }, [profile]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const criticalInventory = inventoryItems.filter(i => i.quantity <= i.minStock).length;

  // Simple chart data from real transactions (grouped by day for example)
  const chartData = transactions.slice().reverse().map(t => ({
    name: t.date?.split('/')[0] || 'Day',
    receita: t.type === 'income' ? t.amount : 0,
    despesa: t.type === 'expense' ? t.amount : 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-emerald" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic text-white tracking-tight leading-none">
            Olá, <span className="text-brand-emerald">{profile?.displayName || 'João'}</span>! 👋
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Resumo consolidado da sua inteligência empresarial</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded hover:bg-zinc-800 transition-colors text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Download size={14} />
            Exportar
          </button>
          <button 
            onClick={() => onNavigate('finance')}
            className="premium-button flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <Plus size={14} />
            Nova Operação
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Receitas Recentes" value={totalIncome} trend="+ Novo" positive />
        <StatCard title="Despesas Recentes" value={totalExpense} trend="- Fluxo" positive={false} />
        <StatCard title="Saldo em Caixa" value={totalIncome - totalExpense} trend="Consolidado" positive />
        <StatCard title="Itens Alerta" value={criticalInventory} isCount trend="Estoque" warningTrend />
      </div>

      {/* AI Consultancy Section */}
      <AIConsultancy data={{ stats: { income: totalIncome, expense: totalExpense }, inventoryCount: inventoryItems.length }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-serif italic text-white">Análise de Fluxo</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Lançamentos recentes</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'N/A', receita: 0, despesa: 0 }]}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" vertical={false} />
                <XAxis dataKey="name" stroke="#52525B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0C0C0D', border: '1px solid #1F1F23', borderRadius: '4px', fontSize: '10px' }}
                  itemStyle={{ color: '#E4E6EB' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#10B981" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] uppercase tracking-widest text-brand-emerald font-bold">Protocolos Ativos</h4>
          </div>
          <div className="space-y-3">
            <AlertItem 
              type="info" 
              title="Dashboard Conectado" 
              desc="Sincronização em tempo real ativa."
              date="Agora"
            />
            {criticalInventory > 0 && (
              <AlertItem 
                type="danger" 
                title="Reposição Necessária" 
                desc={`${criticalInventory} itens abaixo do estoque mínimo.`}
                date="Atenção"
              />
            )}
            <AlertItem 
              type="warning" 
              title="Consultoria IA" 
              desc="Novos insights disponíveis baseados no fluxo."
              date="Hoje"
            />
          </div>
        </div>
      </div>

      {/* Financial History Preview */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h3 className="text-lg font-serif italic text-white uppercase tracking-tighter">Últimos Lançamentos</h3>
          <button 
            onClick={() => onNavigate('finance')}
            className="text-[10px] uppercase font-bold tracking-widest text-brand-emerald hover:underline flex items-center gap-1"
          >
            Ver Financeiro <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-brand-border">
              {transactions.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-zinc-600 text-[10px] uppercase italic">Nenhum dado financeiro registrado</td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-mono text-zinc-500">{t.date}</td>
                    <td className="px-6 py-4 text-xs font-bold text-zinc-200 uppercase tracking-tight">{t.desc}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-500 uppercase font-bold tracking-tighter">
                        {t.category}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-xs font-mono font-bold text-right",
                      t.type === 'income' ? 'text-brand-emerald' : 'text-rose-400'
                    )}>
                      {t.type === 'income' ? '↑ ' : '↓ '}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6 text-white border-b border-brand-border pb-4">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Documentos</h4>
            <FileText size={14} className="text-brand-emerald" />
          </div>
          <div className="space-y-4">
            {recentDocs.length > 0 ? recentDocs.map(d => (
              <DocItem key={d.id} name={d.name} type={d.type} size={d.size} />
            )) : (
              <p className="text-[10px] text-zinc-600 uppercase italic">Sem arquivos recentes</p>
            )}
          </div>
          <button 
            onClick={() => onNavigate('docs')}
            className="w-full mt-6 py-2 border border-brand-border text-zinc-500 text-[10px] uppercase font-bold tracking-widest hover:border-brand-emerald/50 hover:text-brand-emerald transition-all rounded"
          >
            Gestão de Arquivos
          </button>
        </div>

        {/* Inventory Overview */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6 text-white border-b border-brand-border pb-4">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Apex Stock</h4>
            <Package size={14} className="text-brand-emerald" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
              <span className="text-zinc-500">Total SKU</span>
              <span className="text-white">{inventoryItems.length}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
              <span className="text-zinc-500">Alertas</span>
              <span className={criticalInventory > 0 ? "text-rose-500" : "text-brand-emerald"}>{criticalInventory}</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-emerald/50 transition-all duration-1000" 
                style={{ width: `${Math.min(100, (inventoryItems.length * 10))}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('inventory')}
            className="w-full mt-8 py-2 border border-brand-border text-zinc-500 text-[10px] uppercase font-bold tracking-widest hover:border-brand-emerald/50 hover:text-brand-emerald transition-all rounded"
          >
            Abrir Estoque
          </button>
        </div>

        {/* Support Quick Task */}
        <div className="glass-panel p-6 bg-brand-emerald/[0.02] border border-brand-emerald/10">
          <h3 className="text-lg font-serif italic text-white mb-2 leading-none uppercase tracking-tighter">Apex Direct</h3>
          <p className="text-[10px] text-zinc-500 mb-8 leading-relaxed italic uppercase tracking-widest">Suporte especializado em tempo real</p>
          <div className="space-y-2">
            <button 
              onClick={() => onNavigate('support')}
              className="premium-button w-full text-[10px] uppercase font-bold tracking-widest h-12"
            >
              Consultar Especialista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, positive, warningTrend, isCount }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-6 flex flex-col justify-between"
    >
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">{title}</p>
        <h4 className="text-3xl font-light text-zinc-100 font-mono">
          {isCount ? value : formatCurrency(value)}
        </h4>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          positive ? "text-brand-emerald" : "text-rose-500"
        )}>
          {trend}
        </span>
        {warningTrend ? <AlertCircle size={14} className="text-rose-500" /> : <Wallet size={14} className="text-brand-emerald" />}
      </div>
    </motion.div>
  );
}

function AlertItem({ type, title, desc, date }: any) {
  const colors = {
    danger: 'border-rose-500',
    warning: 'border-amber-500',
    info: 'border-brand-emerald'
  };
  return (
    <div className={cn("p-3 bg-zinc-900/30 border-l-2 hover:bg-zinc-900 transition-colors cursor-pointer", colors[type as keyof typeof colors])}>
      <p className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">{title}</p>
      <div className="flex justify-between items-center mt-1">
        <p className="text-[10px] text-zinc-500 italic pr-2 truncate">{desc}</p>
        <p className="text-[10px] font-mono text-zinc-400 uppercase">{date}</p>
      </div>
    </div>
  );
}

function DocItem({ name, type, size }: any) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="w-8 h-8 rounded bg-zinc-900 border border-brand-border flex items-center justify-center text-[10px] text-brand-emerald font-bold transition-colors group-hover:border-brand-emerald/50">
        {type}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-zinc-200 group-hover:text-white transition-colors uppercase tracking-tight truncate">{name}</p>
        <p className="text-[10px] text-zinc-600 italic font-mono uppercase tracking-tighter">{size}</p>
      </div>
      <Download size={14} className="text-zinc-700 group-hover:text-brand-emerald transition-colors" />
    </div>
  );
}

