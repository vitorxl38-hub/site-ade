import React, { useState } from 'react';
import { analyzeBusinessPerformance } from '@/services/gemini';
import { Sparkles, Loader2, Target, Lightbulb, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface Props {
  data: any;
}

export default function AIConsultancy({ data }: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeBusinessPerformance(data);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="glass-panel p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/5 blur-[100px] -z-10"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-emerald rounded-lg flex items-center justify-center shadow-lg shadow-brand-emerald/10">
            <Sparkles className="text-black" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-serif italic text-white flex items-center gap-2">APEX Strategist <span className="text-brand-emerald not-italic font-sans font-bold text-xs uppercase tracking-widest border border-brand-emerald/30 px-2 py-0.5 rounded">AI POWERED</span></h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Inteligência Artificial de Gestão Estratégica</p>
          </div>
        </div>
        {!analysis && (
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="premium-button flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
            Processar Consultoria
          </button>
        )}
      </div>

      {!analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Target} 
            title="Sinergia" 
            desc="Otimização de metas baseadas em histórico de fluxo." 
          />
          <FeatureCard 
            icon={Lightbulb} 
            title="Diagnóstico" 
            desc="Identificação de anomalias em centros de custo." 
          />
          <FeatureCard 
            icon={Zap} 
            title="Projeção" 
            desc="Modelagem preditiva para expansão de caixa." 
          />
        </div>
      )}

      {loading && (
        <div className="py-20 text-center space-y-6">
          <div className="relative mx-auto w-16 h-16">
            <Loader2 className="animate-spin text-brand-emerald absolute inset-0" size={64} strokeWidth={1} />
            <Sparkles className="absolute inset-0 m-auto text-brand-emerald animate-pulse" size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-brand-emerald uppercase tracking-[0.3em] animate-pulse">Neuralizing Data</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Aguarde o processamento proprietário da APEX...</p>
          </div>
        </div>
      )}

      {analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert max-w-none bg-zinc-900/40 p-8 rounded-xl border border-brand-border"
        >
          <div className="markdown-body text-zinc-300 text-sm leading-relaxed">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
          <button 
            onClick={() => setAnalysis(null)} 
            className="mt-10 pt-6 border-t border-zinc-800 w-full text-center text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-600 hover:text-brand-emerald transition-colors"
          >
            Refazer Diagnóstico neural
          </button>
        </motion.div>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-lg border border-brand-border bg-zinc-900/30 hover:bg-brand-emerald/5 transition-all group">
      <Icon className="text-zinc-600 group-hover:text-brand-emerald transition-colors mb-4" size={20} />
      <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-200">{title}</h4>
      <p className="text-xs text-zinc-500 leading-relaxed font-light">{desc}</p>
    </div>
  );
}
