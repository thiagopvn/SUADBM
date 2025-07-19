"use client";

import { useEffect, useState } from 'react';
import { database } from '@/firebase/config';
import { ref, set, onValue } from 'firebase/database';

export function FirebaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('Testando conexão com Firebase...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Tentar escrever um dado de teste
        const testRef = ref(database, 'test');
        await set(testRef, {
          timestamp: Date.now(),
          message: 'Conexão funcionando!'
        });

        // Tentar ler o dado
        onValue(testRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setStatus('success');
            setMessage('✅ Firebase conectado com sucesso!');
          }
        }, (error) => {
          setStatus('error');
          setMessage(`❌ Erro ao ler dados: ${error.message}`);
        });

      } catch (error: any) {
        setStatus('error');
        setMessage(`❌ Erro de conexão: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Teste de Conexão Firebase</h3>
      <div className={`p-3 rounded ${
        status === 'success' ? 'bg-green-100 text-green-800' :
        status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {message}
      </div>
      {status === 'error' && (
        <div className="mt-3 text-sm text-gray-600">
          <p><strong>Possíveis soluções:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>Verifique se o Realtime Database foi criado no Console Firebase</li>
            <li>Confirme se as regras permitem leitura/escrita</li>
            <li>Valide a URL do database na configuração</li>
          </ul>
        </div>
      )}
    </div>
  );
}