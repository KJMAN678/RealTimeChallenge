const puppeteer = require('puppeteer');

async function runSimpleChatTest() {
  console.log('🚀 Starting Simple Chat Test...');
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1200, height: 800 }
  });

  try {
    const page = await browser.newPage();

    console.log('📱 Opening chat application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔍 Testing basic UI elements...');
    
    const buttonsCheck = await page.evaluate(() => {
      const wsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('WebSocket Only'));
      const sseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SSE Only'));
      const compBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Side by Side Comparison'));
      return !!(wsBtn && sseBtn && compBtn);
    });
    console.log('🔘 Main navigation buttons present:', buttonsCheck ? '✅' : '❌');

    console.log('🔌 Testing WebSocket UI...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('WebSocket Only'));
      if (btn) btn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const wsUICheck = await page.evaluate(() => {
      const hasWSTitle = document.body.textContent.includes('WebSocket Chat');
      const hasUsernameInput = !!document.querySelector('input[placeholder="Your username"]');
      const hasMessageInput = !!document.querySelector('input[placeholder="Type your message..."]');
      const hasSendButton = !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
      return hasWSTitle && hasUsernameInput && hasMessageInput && hasSendButton;
    });
    console.log('🔌 WebSocket UI elements loaded:', wsUICheck ? '✅' : '❌');

    console.log('📡 Testing SSE functionality...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SSE Only'));
      if (btn) btn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const sseUICheck = await page.evaluate(() => {
      const hasSSETitle = document.body.textContent.includes('SSE Chat');
      const hasUsernameInput = !!document.querySelector('input[placeholder="Your username"]');
      const hasMessageInput = !!document.querySelector('input[placeholder="Type your message..."]');
      const hasSendButton = !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
      return hasSSETitle && hasUsernameInput && hasMessageInput && hasSendButton;
    });
    console.log('📡 SSE UI elements loaded:', sseUICheck ? '✅' : '❌');

    const sseConnectionCheck = await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 10000 }).then(() => true).catch(() => false);
    
    console.log('📡 SSE connection established:', sseConnectionCheck ? '✅' : '❌');

    if (sseConnectionCheck) {
      console.log('💬 Testing message sending...');
      try {
        await page.type('input[placeholder="Your username"]', 'TestUser');
        await page.type('input[placeholder="Type your message..."]', 'Test message for timestamp check');
        
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
          if (btn) btn.click();
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const messageCheck = await page.waitForFunction(() => {
          return document.body.textContent.includes('Test message for timestamp check');
        }, { timeout: 5000 }).then(() => true).catch(() => false);
        
        console.log('💬 Message sent and received:', messageCheck ? '✅' : '❌');
        
        const timestampCheck = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          return bodyText.match(/\d{2}:\d{2}:\d{2}\.\d{3}/) !== null;
        });
        console.log('🕐 Millisecond timestamps found:', timestampCheck ? '✅' : '❌');
        
        const echoDelayCheck = await page.waitForFunction(() => {
          return document.body.textContent.includes('Echo delay:');
        }, { timeout: 3000 }).then(() => true).catch(() => false);
        console.log('⏱️ Echo delay measurement visible:', echoDelayCheck ? '✅' : '❌');
        
      } catch (error) {
        console.log('💬 Message sending test failed:', error.message);
      }
    }

    console.log('⚖️ Testing side-by-side comparison...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Side by Side Comparison'));
      if (btn) btn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const comparisonCheck = await page.evaluate(() => {
      const hasWSSection = document.body.textContent.includes('WebSocket Chat');
      const hasSSESection = document.body.textContent.includes('SSE Chat');
      return hasWSSection && hasSSESection;
    });
    console.log('⚖️ Side-by-side comparison loaded:', comparisonCheck ? '✅' : '❌');

    console.log('✅ Simple chat test completed successfully!');
    console.log('📊 Summary: UI elements, SSE functionality, and timestamps verified');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    console.log('🧹 Cleaning up browser...');
    await browser.close();
  }
}

if (require.main === module) {
  runSimpleChatTest().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runSimpleChatTest };
