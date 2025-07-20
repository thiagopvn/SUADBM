#!/usr/bin/env tsx

import { firebaseService } from '../lib/firebase-service';
// import mockDataJson from '../firebase/mockData.json';
// import type { MockData } from '../types';

async function initializeFirebase() {
  console.log('🚀 Checking Firebase connection...');
  
  try {
    // Check if Firebase is accessible
    const isConnected = await firebaseService.checkConnection();
    
    if (!isConnected) {
      console.warn('⚠️  Firebase connection check failed.');
      process.exit(1);
    }
    
    console.log('✅ Firebase connection successful!');
    console.log('Use the web interface to import data');
    
  } catch (error) {
    console.error('❌ Failed to connect to Firebase:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeFirebase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initializeFirebase };