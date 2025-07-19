const admin = require('firebase-admin');
const { mockData } = require('../firebase/mockData.ts');

// Inicializar Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://suad-44036-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function importData() {
  try {
    console.log('Iniciando importação dos dados...');
    
    // Importar dados de exemplo
    await db.ref('/').set(mockData);
    
    console.log('✅ Dados importados com sucesso!');
    console.log('Estrutura criada:');
    console.log('- /creditos: Dados dos créditos orçamentários');
    console.log('- /metasAcoes: Metas e ações do projeto');
    console.log('- /fechamentosAnuais: Histórico de fechamentos');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

importData();