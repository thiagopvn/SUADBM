'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setLoading(false);

      // Se não está autenticado e não está na página de login, redireciona
      if (!user && pathname !== '/login') {
        router.push('/login');
      }

      // Se está autenticado e está na página de login, redireciona para dashboard
      if (user && pathname === '/login') {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não está na página de login, não mostra nada
  // (o redirect já foi disparado)
  if (!authenticated && pathname !== '/login') {
    return null;
  }

  // Mostra o conteúdo
  return <>{children}</>;
}
