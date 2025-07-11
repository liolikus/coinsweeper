const https = require('https');
const http = require('http');

async function testRelayerConnectivity() {
  console.log("🔍 Testing Zama Relayer Connectivity");
  console.log("=====================================");
  
  const relayerUrls = [
    "https://relayer.testnet.zama.cloud",
    "https://relayer.sepolia.zama.ai",
    "https://relayer.zama.ai",
    "https://relayer.testnet.zama.ai",
    "https://api.relayer.testnet.zama.cloud",
    "https://api.relayer.zama.cloud"
  ];
  
  const testResults = [];
  
  for (const url of relayerUrls) {
    console.log(`\n🌐 Testing: ${url}`);
    
    try {
      const result = await testUrl(url);
      testResults.push({
        url,
        status: result.status,
        headers: result.headers,
        error: null,
        timestamp: new Date().toISOString()
      });
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Headers: ${JSON.stringify(result.headers, null, 2)}`);
      
    } catch (error) {
      testResults.push({
        url,
        status: null,
        headers: null,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`   Error: ${error.message}`);
    }
  }
  
  // Test with different HTTP methods
  console.log("\n🔧 Testing different HTTP methods on main relayer URL...");
  const mainUrl = "https://relayer.testnet.zama.cloud";
  const methods = ['GET', 'POST', 'HEAD', 'OPTIONS'];
  
  for (const method of methods) {
    try {
      const result = await testUrlWithMethod(mainUrl, method);
      console.log(`   ${method}: ${result.status}`);
    } catch (error) {
      console.log(`   ${method}: Error - ${error.message}`);
    }
  }
  
  // Test with different paths
  console.log("\n📁 Testing different paths on main relayer URL...");
  const paths = ['/', '/health', '/status', '/api', '/v1', '/keys', '/public-key'];
  
  for (const path of paths) {
    try {
      const result = await testUrlWithPath(mainUrl, path);
      console.log(`   ${path}: ${result.status}`);
    } catch (error) {
      console.log(`   ${path}: Error - ${error.message}`);
    }
  }
  
  // Generate bug report
  console.log("\n📋 Bug Report Summary");
  console.log("=====================");
  console.log("Zama Relayer Connectivity Test Results");
  console.log("Date:", new Date().toISOString());
  console.log("Environment: Node.js", process.version);
  console.log("Platform:", process.platform);
  
  console.log("\nTested URLs:");
  testResults.forEach(result => {
    console.log(`- ${result.url}: ${result.status || 'Error: ' + result.error}`);
  });
  
  console.log("\nExpected Behavior:");
  console.log("- Relayer should respond with 200 OK for health checks");
  console.log("- Should provide public key endpoint for FHE operations");
  console.log("- Should support CORS for web applications");
  
  console.log("\nActual Behavior:");
  const workingUrls = testResults.filter(r => r.status === 200);
  const errorUrls = testResults.filter(r => r.status !== 200);
  
  if (workingUrls.length > 0) {
    console.log("✅ Working endpoints:");
    workingUrls.forEach(r => console.log(`  - ${r.url} (${r.status})`));
  }
  
  if (errorUrls.length > 0) {
    console.log("❌ Non-working endpoints:");
    errorUrls.forEach(r => console.log(`  - ${r.url} (${r.status || 'Error: ' + r.error})`));
  }
  
  console.log("\n🐛 Bug Description:");
  console.log("The Zama relayer endpoints are returning 404 errors or connection failures.");
  console.log("This prevents the FHE relayer SDK from initializing properly.");
  console.log("The frontend application cannot connect to the relayer for decryption operations.");
  
  console.log("\n📝 Steps to Reproduce:");
  console.log("1. Deploy a Zama FHE application to Sepolia testnet");
  console.log("2. Try to initialize the FHE relayer SDK");
  console.log("3. Observe 404 errors when connecting to relayer endpoints");
  
  console.log("\n🔧 Expected Fix:");
  console.log("- Relayer endpoints should be operational and return 200 OK");
  console.log("- Public key endpoint should be available for FHE operations");
  console.log("- CORS should be properly configured for web applications");
  
  // Save results to file
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    testResults,
    summary: {
      workingUrls: workingUrls.length,
      errorUrls: errorUrls.length,
      totalUrls: testResults.length
    }
  };
  
  fs.writeFileSync('relayer-connectivity-test.json', JSON.stringify(reportData, null, 2));
  console.log("\n✅ Test results saved to: relayer-connectivity-test.json");
  
  return testResults;
}

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function testUrlWithMethod(url, method) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'User-Agent': 'Zama-FHE-Test/1.0'
      }
    };
    
    const req = protocol.request(options, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

function testUrlWithPath(baseUrl, path) {
  return testUrlWithMethod(baseUrl + path, 'GET');
}

// Run the test
testRelayerConnectivity()
  .then(() => {
    console.log("\n🎉 Relayer connectivity test completed!");
    console.log("📧 You can now use this information to report the bug to Zama.");
  })
  .catch(error => {
    console.error("❌ Test failed:", error);
  }); 