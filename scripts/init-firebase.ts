#!/usr/bin/env tsx

import { firebaseService } from '../lib/firebase-service';
import mockDataJson from '../firebase/mockData.json';
import type { MockData } from '../types';

async function initializeFirebase() {
  console.log('🚀 Initializing Firebase with mock data...');
  
  try {
    // Check if Firebase is accessible
    const isConnected = await firebaseService.checkConnection();
    
    if (!isConnected) {
      console.warn('⚠️  Firebase connection check failed. Proceeding anyway...');
    }
    
    // Initialize with mock data
    const mockData = mockDataJson as MockData;
    await firebaseService.initializeWithMockData(mockData);
    
    console.log('✅ Firebase initialized successfully with mock data!');
    console.log(`📊 Initialized with ${Object.keys(mockData.creditos).length} credits`);
    console.log(`📈 Total expenses: ${Object.keys(mockData.despesas || {}).length}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
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