'use client';

import { useState, useEffect } from 'react';
import { database } from '@/firebase/config';
import { ref, get } from 'firebase/database';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function FirebaseSetupAlert() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verifica se o Firebase já está configurado corretamente
    const checkPermissions = async () => {
      try {
        const testRef = ref(database, 'creditos');
        await get(testRef);
        setHasPermission(true);
      } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED') {
          setHasPermission(false);
        } else {
          // Outro tipo de erro, assume que pode ser problema de rede
          setHasPermission(null);
        }
      }
    };

    checkPermissions();
  }, []);

  // Não mostra nada se foi dispensado ou se tem permissão
  if (dismissed || hasPermission === true || hasPermission === null) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-4xl w-full px-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">
              ⚙️ Configuração do Firebase Necessária
            </h3>
            <p className="text-yellow-700 mb-4">
              O Firebase Database precisa ser configurado para permitir leitura e escrita.
              Siga os passos abaixo:
            </p>

            <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                <li className="font-medium">
                  Acesse o Firebase Console:
                  <a
                    href="https://console.firebase.google.com/project/suad-44036/database/suad-44036-default-rtdb/rules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Abrir Firebase Database Rules
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
                <li>
                  Clique na aba <strong>"Rules"</strong> (Regras)
                </li>
                <li>
                  Substitua o conteúdo por:
                  <pre className="mt-2 bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "rules": {
    ".read": true,
    ".write": true,
    "creditos": {
      ".indexOn": ["anoExercicio", "acaoEixo", "creditoCodigo"],
      "$creditoId": {
        "despesas": {
          ".indexOn": ["status", "dataEmpenho", "dataPagamento"]
        }
      }
    }
  }
}`}
                  </pre>
                </li>
                <li>
                  Clique em <strong>"Publish"</strong> (Publicar)
                </li>
                <li>
                  Recarregue esta página
                </li>
              </ol>
            </div>

            <div className="flex items-start space-x-2 text-xs text-yellow-800 bg-yellow-100 p-3 rounded">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Nota de Segurança:</strong> Estas regras permitem acesso total sem autenticação.
                São adequadas para desenvolvimento. Para produção, implemente regras de segurança adequadas
                (veja INSTRUCOES_FIREBASE.md).
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setDismissed(true)}
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                Dispensar (temporariamente)
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="ml-4 text-yellow-400 hover:text-yellow-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
