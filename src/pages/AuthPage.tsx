import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Ghost } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      await syncUser(result.user);
      toast.success('Acesso concedido');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await syncUser(result.user);
        toast.success('Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login realizado!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const syncUser = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || 'guest@apex.com',
          displayName: user.displayName || (user.isAnonymous ? 'Convidado' : user.email?.split('@')[0]),
          role: 'client',
          clientId: 'client-1', // Default client for now
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      <div className="md:w-1/2 p-12 flex flex-col justify-center bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-brand-bg/85 backdrop-blur-sm"></div>
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-baseline gap-3 mb-10">
            <h1 className="text-4xl font-bold tracking-tighter text-white">APEX <span className="text-brand-emerald">SYSTEM</span></h1>
          </div>
          <h1 className="text-5xl font-serif italic leading-[1.1] mb-8">Decisões <span className="text-brand-emerald">inteligentes</span> começam na contabilidade.</h1>
          <p className="text-lg text-zinc-400 font-light leading-relaxed">Transforme seu escritório contábil em um hub de inteligência estratégica e previsibilidade financeira.</p>
        </div>
      </div>

      <div className="md:w-1/2 p-8 md:p-24 flex flex-col justify-center bg-brand-bg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-3 tracking-tight text-white uppercase">{isRegistering ? 'Nova Conta' : 'Acesso Restrito'}</h2>
            <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase">Identifique-se para acessar o sistema.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="premium-button w-full flex flex-col items-center justify-center gap-1 group py-6 h-auto"
            >
              <div className="flex items-center gap-2 text-lg">
                <Ghost size={20} />
                <span>Acesso Rápido</span>
              </div>
              <span className="text-[10px] opacity-60 font-bold uppercase tracking-[0.2em]">Entrar sem credenciais agora</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-border"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-brand-bg px-4 text-zinc-600">Ou use sua senha</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field" 
                  placeholder="Seu E-mail" 
                  required
                />
              </div>

              <div className="space-y-2">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field" 
                  placeholder="Sua Senha" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 border border-brand-border hover:border-brand-emerald text-zinc-300 hover:text-white transition-all rounded-lg text-[10px] uppercase font-bold tracking-widest"
              >
                {loading ? 'Aguarde...' : (isRegistering ? 'Criar Conta' : 'Login Profissional')}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>
          </div>

          <p className="mt-12 text-center text-[10px] uppercase font-bold tracking-widest text-zinc-600">
            {isRegistering ? 'Já possui acesso?' : 'Não é cliente?'}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-brand-emerald hover:underline"
            >
              {isRegistering ? 'Fazer Login' : 'Solicitar Acesso'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
