import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck,
  Zap,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  user: any;
  profile: any;
  onNavigate: (tab: string) => void;
}

export default function SupportPage({ profile }: Props) {
  const [msg, setMsg] = useState('');
  const [subject, setSubject] = useState('Dúvida Fiscal / Tributária');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !profile) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        clientId: profile.clientId,
        userId: profile.uid,
        userName: profile.displayName,
        subject,
        message: msg,
        status: 'open',
        createdAt: serverTimestamp()
      });
      toast.success('Sua mensagem foi enviada ao suporte APEX!');
      setMsg('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'support_tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic text-white leading-none">Suporte Apex Direct</h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Canal exclusivo de atendimento especializado</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Especialistas Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 bg-brand-bg-alt/50 border-brand-emerald/10">
            <h3 className="text-xl font-serif italic text-white mb-6">Iniciar Novo Protocolo</h3>
            <form onSubmit={handleSendMessage} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Assunto</label>
                <select 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="input-field h-[42px]"
                >
                  <option>Dúvida Fiscal / Tributária</option>
                  <option>Solicitação de Manutenção no Estoque</option>
                  <option>Questões Financeiras / Fluxo</option>
                  <option>Suporte Técnico Plataforma</option>
                  <option>Outros Assuntos</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sua Mensagem</label>
                <textarea 
                  rows={6}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  className="input-field resize-none py-4"
                  placeholder="Descreva detalhadamente sua necessidade..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="premium-button w-full h-12 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Enviar para Especialista
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactMethod 
              icon={Phone}
              title="Linha Direta"
              value="0800 722 9000"
              desc="Atendimento das 08h às 18h"
            />
            <ContactMethod 
              icon={Mail}
              title="E-mail Corporativo"
              value="suporte@apexsystem.com"
              desc="Resposta em até 2h úteis"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 border-brand-emerald/20 bg-brand-emerald/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded bg-brand-emerald/10 text-brand-emerald">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200">Garantia de Resposta</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              Todos os clientes do Plano Premium possuem SLA de resposta prioritária. Suas dúvidas fiscais são respondidas por contadores seniores.
            </p>
            <div className="space-y-4">
              <SlaItem icon={Clock} label="Tempo Médio" value="14 min" />
              <SlaItem icon={Zap} label="Urgência" value="Alta" />
              <SlaItem icon={Calendar} label="Disponibilidade" value="Seg-Sex" />
            </div>
          </div>

          <div className="glass-panel p-6 border border-zinc-800">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-6">Agendamentos</h4>
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 font-light">
                Precisa de uma consultoria mais profunda? Agende uma call de 30 min.
              </p>
              <button className="w-full py-3 border border-brand-emerald/20 text-brand-emerald hover:bg-brand-emerald/10 transition-all rounded text-[10px] uppercase font-bold tracking-widest">
                Ver Horários Disponíveis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactMethod({ icon: Icon, title, value, desc }: any) {
  return (
    <div className="glass-panel p-6 hover:border-brand-emerald/20 transition-all group">
      <Icon className="text-zinc-500 group-hover:text-brand-emerald transition-colors mb-4" size={24} />
      <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">{title}</h4>
      <p className="text-sm font-bold text-zinc-100 mb-1">{value}</p>
      <p className="text-[10px] text-zinc-600 italic uppercase">{desc}</p>
    </div>
  );
}

function SlaItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={12} />
        <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-mono text-white">{value}</span>
    </div>
  );
}
