// Test script to verify Zama relayer proxy configuration
export const testRelayerProxy = async () => {
  const testUrls = [
    '/api/relayer', // Our proxy path
    'https://relayer.testnet.zama.cloud', // Direct URL (will fail with CORS)
  ];

  console.log('🧪 Testing Zama relayer connectivity...');

  for (const url of testUrls) {
    try {
      console.log(`\n📡 Testing: ${url}`);
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors'
      });
      console.log(`✅ Status: ${response.status} - ${response.statusText}`);
      
      if (response.ok) {
        console.log('🎉 Proxy configuration is working!');
        return true;
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      
      if (error.message.includes('CORS')) {
        console.log('🚫 CORS error detected - this is expected for direct URLs');
      }
    }
  }

  console.log('\n⚠️ All tests failed. Please check your proxy configuration.');
  return false;
};

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testRelayerProxy();
  }, 2000); // Wait 2 seconds for app to load
} 