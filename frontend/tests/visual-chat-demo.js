const puppeteer = require('puppeteer');

const messageTemplates = [
  "こんにちは！今日はいい天気ですね",
  "WebSocketとSSEの比較、興味深いですね",
  "リアルタイム通信のテストをしています",
  "ミリ秒のタイムスタンプが正確に表示されていますか？",
  "複数ユーザーでのチャットテストです",
  "エコーバック遅延の測定結果はどうでしょうか",
  "自動テストでチャット機能を検証中です",
  "SSEとWebSocketの性能差を確認したいです",
  "タイムスタンプの精度をチェックしています",
  "マルチユーザーでの同期テストを実行中"
];

const usernames = [
  "田中さん", "佐藤さん", "鈴木さん", "高橋さん", "渡辺さん",
  "TestUser1", "TestUser2", "TestUser3", "DemoUser", "ChatBot"
];

function getRandomMessage() {
  const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
  const timestamp = new Date().toLocaleTimeString('ja-JP');
  return `${template} (${timestamp})`;
}

function getRandomUsername() {
  return usernames[Math.floor(Math.random() * usernames.length)];
}

async function runVisualChatDemo() {
  console.log('🚀 Starting Visual Chat Demo...');
  console.log('📱 This will open visible browser windows to demonstrate chat functionality');
  
  const browsers = [];
  const pages = [];
  
  for (let i = 0; i < 3; i++) {
    const browser = await puppeteer.launch({ 
      headless: false,  // Make browsers visible
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 800, height: 600 }
    });
    browsers.push(browser);
    
    const page = await browser.newPage();
    pages.push(page);
    
    console.log(`📱 Opening browser ${i + 1}...`);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  try {
    console.log('🔍 Testing SSE Chat with visible browsers...');
    
    for (let i = 0; i < pages.length; i++) {
      await pages[i].evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SSE Only'));
        if (btn) btn.click();
      });
      console.log(`📡 Browser ${i + 1} switched to SSE mode`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    for (let i = 0; i < pages.length; i++) {
      const username = `VisualUser${i + 1}`;
      await pages[i].evaluate(() => {
        const input = document.querySelector('input[placeholder="Your username"]');
        if (input) input.value = '';
      });
      await pages[i].type('input[placeholder="Your username"]', username);
      console.log(`👤 Browser ${i + 1} username set to: ${username}`);
    }
    
    console.log('⏳ Waiting for SSE connections...');
    const connectionChecks = await Promise.all(
      pages.map(page => 
        page.waitForFunction(() => {
          const text = document.body.textContent || '';
          return text.includes('Connected') && !text.includes('Disconnected');
        }, { timeout: 15000 }).then(() => true).catch(() => false)
      )
    );
    
    const connectedCount = connectionChecks.filter(Boolean).length;
    console.log(`📡 ${connectedCount}/${pages.length} browsers connected to SSE`);
    
    if (connectedCount > 0) {
      console.log('💬 Starting automated chat simulation...');
      console.log('🎭 Generating realistic chat messages...');
      
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < pages.length; i++) {
          if (connectionChecks[i]) {
            const message = getRandomMessage();
            
            try {
              await pages[i].evaluate(() => {
                const input = document.querySelector('input[placeholder="Type your message..."]');
                if (input) input.value = '';
              });
              
              await pages[i].type('input[placeholder="Type your message..."]', message);
              
              await pages[i].evaluate(() => {
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
                if (btn) btn.click();
              });
              
              console.log(`💬 Browser ${i + 1} sent: "${message.substring(0, 30)}..."`);
              
              await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            } catch (error) {
              console.log(`❌ Browser ${i + 1} failed to send message:`, error.message);
            }
          }
        }
        
        console.log(`🔄 Completed round ${round + 1}/5 of message sending`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('⏱️ Checking for timestamp and delay measurements...');
      
      for (let i = 0; i < pages.length; i++) {
        if (connectionChecks[i]) {
          const timestampCheck = await pages[i].evaluate(() => {
            const bodyText = document.body.textContent || '';
            return bodyText.match(/\d{2}:\d{2}:\d{2}\.\d{3}/) !== null;
          });
          
          const echoDelayCheck = await pages[i].evaluate(() => {
            return document.body.textContent.includes('Echo delay:');
          });
          
          console.log(`🕐 Browser ${i + 1} - Millisecond timestamps: ${timestampCheck ? '✅' : '❌'}`);
          console.log(`⏱️ Browser ${i + 1} - Echo delay visible: ${echoDelayCheck ? '✅' : '❌'}`);
        }
      }
      
      console.log('🎯 Testing side-by-side comparison...');
      
      await pages[0].evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Side by Side Comparison'));
        if (btn) btn.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const comparisonCheck = await pages[0].evaluate(() => {
        const hasWSSection = document.body.textContent.includes('WebSocket Chat');
        const hasSSESection = document.body.textContent.includes('SSE Chat');
        return hasWSSection && hasSSESection;
      });
      
      console.log(`⚖️ Side-by-side comparison loaded: ${comparisonCheck ? '✅' : '❌'}`);
      
      console.log('✅ Visual chat demo completed successfully!');
      console.log('📊 Summary: Multiple browsers showing real-time chat with timestamps');
      console.log('👀 You can now see the chat messages displayed in the browser windows');
      console.log('⏰ Keep browsers open to continue observing the chat interface');
      
      console.log('🔄 Browsers will remain open for 30 seconds for observation...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
    } else {
      console.log('❌ No SSE connections established - cannot demonstrate chat');
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  } finally {
    console.log('🧹 Closing browsers...');
    for (const browser of browsers) {
      await browser.close();
    }
  }
}

if (require.main === module) {
  runVisualChatDemo().catch(error => {
    console.error('💥 Demo execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runVisualChatDemo };
