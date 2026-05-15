import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { 
  Plus, 
  Package, 
  AlertTriangle,
  Search,
  Loader2,
  MoreVertical,
  MinusCircle,
  PlusCircle,
  FileBox
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: any;
  profile: any;
  onNavigate: (tab: string) => void;
}

export default function InventoryPage({ profile }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [unit, setUnit] = useState('un');

  useEffect(() => {
    if (!profile?.clientId) return;

    const q = query(
      collection(db, 'inventory'),
      where('clientId', '==', profile.clientId),
      orderBy('name', 'asc')
    );

    const unsubInventory = onSnapshot(q, (iSnap) => {
      const iList = iSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(iList);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'inventory');
      setLoading(false);
    });

    return () => unsubInventory();
  }, [profile]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.clientId) return;

    try {
      await addDoc(collection(db, 'inventory'), {
        name,
        quantity: parseInt(quantity),
        minStock: parseInt(minStock),
        unit,
        clientId: profile.clientId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Item adicionado ao estoque!');
      setName('');
      setQuantity('');
      setMinStock('');
      setShowAddModal(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'inventory');
    }
  };

  const updateQuantity = async (id: string, current: number, delta: number) => {
    try {
      const newQty = Math.max(0, current + delta);
      await updateDoc(doc(db, 'inventory', id), {
        quantity: newQty,
        updatedAt: serverTimestamp()
      });
      toast.success('Estoque atualizado');
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + err.message);
    }
  };

  const criticalItems = items.filter(item => item.quantity <= item.minStock);

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
          <h2 className="text-3xl font-serif italic text-white leading-none">Apex Stock Consult</h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Monitoramento de insumos e mercadorias</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="premium-button flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total de SKUs" value={items.length} icon={Package} color="text-brand-emerald" />
        <StatCard title="Itens Críticos" value={criticalItems.length} icon={AlertTriangle} color="text-rose-500" />
        <StatCard title="Total Unidades" value={items.reduce((acc, i) => acc + i.quantity, 0)} icon={FileBox} color="text-blue-400" />
        <div className="glass-panel p-5 bg-brand-bg-alt/50 border border-zinc-800 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Monitoramento Ativo</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h3 className="text-lg font-serif italic text-white uppercase tracking-tighter">Inventário</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="bg-brand-bg-alt border border-brand-border rounded px-4 py-2 pl-10 text-[10px] uppercase font-bold tracking-widest focus:border-brand-emerald outline-none w-64 text-zinc-300"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-bg-alt/50 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Qtd Atual</th>
                <th className="px-6 py-4">Mínimo</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-xs italic uppercase">Nenhum item cadastrado no estoque</td>
                </tr>
              ) : (
                items.map((i) => (
                  <tr key={i.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      {i.quantity <= i.minStock ? (
                        <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold uppercase">Crítico</span>
                      ) : (
                        <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded font-bold uppercase">Ok</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-zinc-200 uppercase tracking-tight">{i.name}</p>
                      <p className="text-[10px] text-zinc-600 uppercase font-mono">{i.unit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={cn(
                        "text-lg font-mono font-bold",
                        i.quantity <= i.minStock ? "text-rose-500" : "text-white"
                      )}>
                        {i.quantity}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-zinc-600 uppercase">Min: {i.minStock}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => updateQuantity(i.id, i.quantity, -1)}
                          className="p-1 hover:text-rose-400 transition-colors"
                        >
                          <MinusCircle size={18} />
                        </button>
                        <button 
                          onClick={() => updateQuantity(i.id, i.quantity, 1)}
                          className="p-1 hover:text-brand-emerald transition-colors"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>
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
              <h3 className="text-xl font-serif italic text-white uppercase tracking-tighter">Cadastrar Produto</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Produto</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="input-field" 
                  placeholder="Ex: Resina Industrial"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Qtd Inicial</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)}
                    className="input-field" 
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Qtd Mínima</label>
                  <input 
                    type="number" 
                    value={minStock} 
                    onChange={e => setMinStock(e.target.value)}
                    className="input-field" 
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Unidade de Medida</label>
                <select 
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="input-field h-[42px]"
                >
                  <option value="un">Unidade (un)</option>
                  <option value="kg">Quilo (kg)</option>
                  <option value="lt">Litro (lt)</option>
                  <option value="pct">Pacote (pct)</option>
                </select>
              </div>

              <button type="submit" className="premium-button w-full h-12">
                Adicionar ao Estoque
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-4 mb-2">
        <div className={cn("p-2 rounded border border-brand-border bg-zinc-900/50", color)}>
          <Icon size={18} />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{title}</p>
      </div>
      <h4 className="text-3xl font-light text-white font-mono">{value}</h4>
    </div>
  );
}
