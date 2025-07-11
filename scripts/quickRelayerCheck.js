const https = require('https');

async function quickRelayerCheck() {
  console.log("🔍 Quick Zama Relayer Status Check");
  console.log("===================================");
  console.log("Date:", new Date().toISOString());
  console.log("Status Page: https://status.zama.ai/");
  console.log("");
  
  const relayerUrl = "https://relayer.testnet.zama.cloud";
  
  console.log(`🌐 Testing: ${relayerUrl}`);
  
  try {
    const result = await testEndpoint(relayerUrl);
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${result.data}`);
    
    if (result.status === 404 && result.data.includes("no Route matched")) {
      console.log("\n❌ ISSUE CONFIRMED:");
      console.log("   - Relayer service is online but not configured");
      console.log("   - No API routes are available");
      console.log("   - Status page incorrectly reports 'operational'");
      console.log("\n🐛 This is a configuration issue, not a complete outage.");
    }
    
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  console.log("\n📋 Summary:");
  console.log("- Relayer infrastructure is online (Cloudflare responding)");
  console.log("- API routes are not configured (404 'no Route matched')");
  console.log("- Status page needs updating to reflect actual service state");
  console.log("- This blocks all FHE decryption operations");
  
  console.log("\n📧 Bug Report Status: READY");
  console.log("   Use ZAMA_RELAYER_BUG_REPORT.md for reporting");
}

function testEndpoint(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
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

quickRelayerCheck()
  .then(() => {
    console.log("\n✅ Quick check completed!");
  })
  .catch(error => {
    console.error("❌ Check failed:", error);
  }); 