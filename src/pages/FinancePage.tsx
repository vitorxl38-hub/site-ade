import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  Search,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: any;
  profile: any;
  onNavigate: (tab: string) => void;
}

export default function FinancePage({ profile }: Props) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!profile?.clientId) return;

    // Fetch transactions for this clientId
    const q = query(
      collection(db, 'transactions'),
      where('clientId', '==', profile.clientId),
      orderBy('createdAt', 'desc')
    );

    const unsubTransactions = onSnapshot(q, (tSnap) => {
      const tList = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(tList);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'transactions');
      setLoading(false);
    });

    return () => unsubTransactions();
  }, [profile]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.clientId) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        desc,
        amount: parseFloat(amount),
        type,
        category,
        clientId: profile.clientId,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('pt-BR')
      });
      toast.success('Transação registrada!');
      setDesc('');
      setAmount('');
      setCategory('');
      setShowAddModal(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-emerald" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic text-white leading-none">Gestão Financeira</h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Controle de fluxo de caixa e lançamentos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="premium-button flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Receita Total" value={totalIncome} type="income" />
        <StatCard title="Despesa Total" value={totalExpense} type="expense" />
        <StatCard title="Saldo Atual" value={balance} type="balance" />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-serif italic text-white uppercase tracking-tighter">Histórico de Transações</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text" 
                placeholder="Filtrar..." 
                className="bg-brand-bg-alt border border-brand-border rounded px-4 py-2 pl-10 text-[10px] uppercase font-bold tracking-widest focus:border-brand-emerald outline-none w-48 text-zinc-300"
              />
            </div>
            <button className="p-2 border border-brand-border rounded hover:bg-zinc-800 transition-colors">
              <Filter size={14} className="text-zinc-500" />
            </button>
            <button className="p-2 border border-brand-border rounded hover:bg-zinc-800 transition-colors">
              <Download size={14} className="text-zinc-500" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-bg-alt/50 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500 text-xs italic uppercase">Nenhuma transação encontrada</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4 text-[10px] font-mono text-zinc-500">{t.date}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-zinc-200 uppercase tracking-tight">{t.desc}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 border border-brand-border rounded text-zinc-500 uppercase tracking-tighter">
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

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-8 bg-brand-bg-alt"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif italic text-white uppercase tracking-tighter">Novo Lançamento</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</label>
                <input 
                  type="text" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)}
                  className="input-field" 
                  placeholder="Ex: Venda de Produto A"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    className="input-field" 
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="input-field h-[42px]"
                  >
                    <option value="income">Receita (↑)</option>
                    <option value="expense">Despesa (↓)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categoria</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="input-field" 
                  placeholder="Ex: Vendas, Operacional, etc."
                  required
                />
              </div>

              <button type="submit" className="premium-button w-full h-12">
                Registrar Movimentação
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, type }: any) {
  const isBalance = type === 'balance';
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <div className="glass-panel p-6 shadow-xl relative overflow-hidden group">
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity",
        isIncome ? 'bg-brand-emerald' : isExpense ? 'bg-rose-500' : 'bg-blue-500'
      )}></div>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{title}</p>
        <div className={cn(
          "p-2 rounded border border-brand-border",
          isIncome ? 'text-brand-emerald bg-brand-emerald/10' : isExpense ? 'text-rose-500 bg-rose-500/10' : 'text-blue-400 bg-blue-400/10'
        )}>
          {isIncome ? <TrendingUp size={16} /> : isExpense ? <TrendingDown size={16} /> : <TrendingUp size={16} className="rotate-45" />}
        </div>
      </div>
      <h4 className="text-3xl font-light text-white font-mono tracking-tight">{formatCurrency(value)}</h4>
      <p className="text-[10px] text-zinc-600 font-mono mt-2 uppercase tracking-widest italic">Atualizado em tempo real</p>
    </div>
  );
}
