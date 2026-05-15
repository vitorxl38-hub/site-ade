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
import { motion } from 'motion/react';
import { 
  Plus, 
  FileText, 
  Download, 
  Loader2,
  UploadCloud,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  user: any;
  profile: any;
  onNavigate: (tab: string) => void;
}

export default function DocumentsPage({ profile }: Props) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('PDF');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!profile?.clientId) return;

    const q = query(
      collection(db, 'documents'),
      where('clientId', '==', profile.clientId),
      orderBy('createdAt', 'desc')
    );

    const unsubDocs = onSnapshot(q, (dSnap) => {
      const dList = dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(dList);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'documents');
      setLoading(false);
    });

    return () => unsubDocs();
  }, [profile]);

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.clientId) return;

    try {
      await addDoc(collection(db, 'documents'), {
        name,
        type,
        url,
        clientId: profile.clientId,
        createdAt: serverTimestamp(),
        size: Math.floor(Math.random() * 5000) / 10 + ' KB' // Simulating size
      });
      toast.success('Documento registrado!');
      setName('');
      setUrl('');
      setShowAddModal(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'documents');
    }
  };

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
          <h2 className="text-3xl font-serif italic text-white leading-none">Gestão de Documentos</h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Armazenamento seguro de arquivos contábeis e fiscais</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="premium-button flex items-center justify-center gap-2"
        >
          <UploadCloud size={16} />
          Enviar Documento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <motion.div 
            key={doc.id}
            whileHover={{ y: -5 }}
            className="glass-panel p-6 group cursor-pointer border border-zinc-800 hover:border-brand-emerald/30 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded bg-zinc-900 border border-brand-border flex items-center justify-center text-[10px] text-brand-emerald font-bold group-hover:border-brand-emerald transition-colors">
                {doc.type}
              </div>
              <div className="flex gap-2">
                <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-zinc-600 hover:text-brand-emerald transition-colors">
                  <ExternalLink size={16} />
                </a>
                <button className="p-2 text-zinc-600 hover:text-brand-emerald transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-tight mb-2 truncate">{doc.name}</h4>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              <span>{doc.size}</span>
              <span className="italic">{doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
            </div>
          </motion.div>
        ))}
        {documents.length === 0 && (
          <div className="col-span-full py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600">
            <FileText size={48} className="mb-4 opacity-10" />
            <p className="text-xs uppercase tracking-widest font-bold">Nenhum documento encontrado</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-8 bg-brand-bg-alt"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif italic text-white uppercase tracking-tighter">Registrar Documento</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Documento</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="input-field" 
                  placeholder="Ex: Balancete Mensal - Maio"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="input-field h-[42px]"
                  >
                    <option value="PDF">PDF</option>
                    <option value="XML">XML</option>
                    <option value="XLS">Excel (XLS)</option>
                    <option value="DOC">Word (DOC)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">URL do Arquivo</label>
                  <input 
                    type="url" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)}
                    className="input-field" 
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <button type="submit" className="premium-button w-full h-12">
                Salvar Registro
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
