const admin = require('firebase-admin');
// const { mockData } = require('../firebase/mockData.ts');

// Inicializar Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://suad-44036-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function importData() {
  try {
    console.log('Script desabilitado - arquivos mockData removidos');
    console.log('Use a interface web para importar dados');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

importData();