'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);

      // Mensagens de erro amigáveis
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos');
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@cbmerj.rj.gov.br');
    setPassword('admin123');
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, 'admin@cbmerj.rj.gov.br', 'admin123');
      router.push('/');
    } catch (err: any) {
      // Se a conta demo não existe, mostrar instruções
      setError('Conta demo não configurada. Use Firebase Console para criar um usuário com email: admin@cbmerj.rj.gov.br e senha: admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SUAD CBMERJ</h1>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acessar Sistema</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu.email@cbmerj.rj.gov.br"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Botão Demo */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
          >
            Acessar com conta demo
          </button>

          {/* Instruções */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Conta Demo:</strong><br />
              Email: admin@cbmerj.rj.gov.br<br />
              Senha: admin123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Corpo de Bombeiros Militar do Estado do Rio de Janeiro
        </p>
      </div>
    </div>
  );
}
