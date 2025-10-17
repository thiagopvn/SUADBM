'use client';

import { useState } from 'react';
import { database } from '@/firebase/config';
import { ref, get, set } from 'firebase/database';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function FirebaseDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    read: boolean | null;
    write: boolean | null;
    error: string | null;
  }>({
    read: null,
    write: null,
    error: null,
  });

  const runDiagnostics = async () => {
    setTesting(true);
    setResults({ read: null, write: null, error: null });

    try {
      // Teste 1: Leitura
      console.log('🔍 Testando leitura do Firebase...');
      const testRef = ref(database, 'creditos');
      await get(testRef);
      console.log('✅ Leitura OK');
      setResults(prev => ({ ...prev, read: true }));

      // Teste 2: Escrita
      console.log('🔍 Testando escrita no Firebase...');
      const writeTestRef = ref(database, '_test_connection');
      await set(writeTestRef, {
        timestamp: new Date().toISOString(),
        test: 'connection'
      });
      console.log('✅ Escrita OK');
      setResults(prev => ({ ...prev, write: true }));

      // Limpar teste
      await set(writeTestRef, null);

    } catch (error: any) {
      console.error('❌ Erro no diagnóstico:', error);
      setResults({
        read: false,
        write: false,
        error: error.code === 'PERMISSION_DENIED'
          ? 'PERMISSION_DENIED - As regras do Firebase ainda não foram configuradas corretamente'
          : error.message || 'Erro desconhecido'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        🔧 Diagnóstico de Conexão Firebase
      </h3>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
      >
        {testing ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Testando conexão...
          </span>
        ) : (
          'Testar Conexão com Firebase'
        )}
      </button>

      {(results.read !== null || results.write !== null || results.error) && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3">Resultados:</h4>

            {/* Leitura */}
            <div className="flex items-center mb-2">
              {results.read === true ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : results.read === false ? (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <span className={`font-medium ${
                results.read === true ? 'text-green-700' :
                results.read === false ? 'text-red-700' :
                'text-gray-600'
              }`}>
                Permissão de Leitura (.read)
              </span>
            </div>

            {/* Escrita */}
            <div className="flex items-center">
              {results.write === true ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : results.write === false ? (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <span className={`font-medium ${
                results.write === true ? 'text-green-700' :
                results.write === false ? 'text-red-700' :
                'text-gray-600'
              }`}>
                Permissão de Escrita (.write)
              </span>
            </div>
          </div>

          {results.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-red-800 mb-1">Erro Detectado:</h5>
                  <p className="text-sm text-red-700">{results.error}</p>
                </div>
              </div>

              {results.error.includes('PERMISSION_DENIED') && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <h5 className="font-semibold text-red-800 mb-2">Como Resolver:</h5>
                  <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
                    <li>Abra o Firebase Console:
                      <a
                        href="https://console.firebase.google.com/project/suad-44036/database/suad-44036-default-rtdb/rules"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline ml-1"
                      >
                        Clique aqui
                      </a>
                    </li>
                    <li>Vá na aba "Rules" (Regras)</li>
                    <li>Cole o código fornecido no alerta amarelo acima</li>
                    <li>Clique em "Publish" (Publicar)</li>
                    <li>Aguarde 10-30 segundos</li>
                    <li>Clique em "Testar Conexão" novamente</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {results.read === true && results.write === true && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-green-800 mb-1">✅ Firebase Configurado Corretamente!</h5>
                  <p className="text-sm text-green-700">
                    As regras do Firebase estão funcionando. Você pode importar os dados de teste agora.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800">
        <strong>💡 Dica:</strong> Se o teste falhar, aguarde 30 segundos após publicar as regras no Firebase Console e teste novamente.
        As regras podem levar alguns segundos para serem aplicadas.
      </div>
    </div>
  );
}
