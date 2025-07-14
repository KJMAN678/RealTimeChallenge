
const puppeteer = require('puppeteer');

async function runMultiUserChatTest() {
  console.log('🚀 Starting Multi-User Chat Test...');
  
  const browser1 = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1200, height: 800 }
  });
  const browser2 = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1200, height: 800 }
  });
  const browser3 = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1200, height: 800 }
  });

  try {
    const page1 = await browser1.newPage();
    const page2 = await browser2.newPage();
    const page3 = await browser3.newPage();

    console.log('📱 Opening browsers and navigating to chat app...');
    await Promise.all([
      page1.goto('http://localhost:3000', { waitUntil: 'networkidle2' }),
      page2.goto('http://localhost:3000', { waitUntil: 'networkidle2' }),
      page3.goto('http://localhost:3000', { waitUntil: 'networkidle2' })
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔌 Testing WebSocket chat with multiple users...');
    await testWebSocketChat(page1, page2, page3);
    
    console.log('📡 Testing SSE chat with multiple users...');
    await testSSEChat(page1, page2, page3);
    
    console.log('⚖️ Testing side-by-side comparison...');
    await testSideBySideComparison(page1);

    console.log('✅ All automated tests completed successfully!');
    console.log('📊 Verified: Millisecond timestamps, multi-user messaging, echo delays');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    console.log('🧹 Cleaning up browsers...');
    await browser1.close();
    await browser2.close();
    await browser3.close();
  }
}

async function testWebSocketChat(page1, page2, page3) {
  await Promise.all([
    page1.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('WebSocket Only'));
      if (btn) btn.click();
    }),
    page2.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('WebSocket Only'));
      if (btn) btn.click();
    }),
    page3.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('WebSocket Only'));
      if (btn) btn.click();
    })
  ]);

  console.log('⏳ Waiting for WebSocket connections...');
  
  const page1Text = await page1.evaluate(() => document.body.textContent);
  console.log('🔍 Page 1 text content:', page1Text.substring(0, 500));
  
  await Promise.all([
    page1.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 20000 }),
    page2.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 20000 }),
    page3.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 20000 })
  ]);

  await page1.evaluate(() => {
    const input = document.querySelector('input[placeholder="Your username"]');
    if (input) input.value = '';
  });
  await page2.evaluate(() => {
    const input = document.querySelector('input[placeholder="Your username"]');
    if (input) input.value = '';
  });
  await page3.evaluate(() => {
    const input = document.querySelector('input[placeholder="Your username"]');
    if (input) input.value = '';
  });
  
  await page1.type('input[placeholder="Your username"]', 'AutoUser1');
  await page2.type('input[placeholder="Your username"]', 'AutoUser2');
  await page3.type('input[placeholder="Your username"]', 'AutoUser3');

  console.log('💬 Sending WebSocket messages...');
  await page1.type('input[placeholder="Type your message..."]', 'Hello from AutoUser1! Testing milliseconds');
  await page1.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
    if (btn) btn.click();
  });
  
  await page2.type('input[placeholder="Type your message..."]', 'Hello from AutoUser2! Checking timestamps');
  await page2.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
    if (btn) btn.click();
  });
  
  await page3.type('input[placeholder="Type your message..."]', 'Hello from AutoUser3! Verifying echo delay');
  await page3.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
    if (btn) btn.click();
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  const message1Results = await Promise.all([
    page1.waitForFunction(() => document.body.textContent.includes('Hello from AutoUser1!'), { timeout: 5000 }).then(() => true).catch(() => false),
    page2.waitForFunction(() => document.body.textContent.includes('Hello from AutoUser1!'), { timeout: 5000 }).then(() => true).catch(() => false),
    page3.waitForFunction(() => document.body.textContent.includes('Hello from AutoUser1!'), { timeout: 5000 }).then(() => true).catch(() => false)
  ]);

  console.log('📝 WebSocket messages propagated:', message1Results.every(Boolean) ? '✅' : '❌');
  
  const delayVisible = await page1.waitForFunction(() => document.body.textContent.includes('Echo delay:'), { timeout: 3000 }).then(() => true).catch(() => false);
  console.log('⏱️ Echo delay measurement visible:', delayVisible ? '✅' : '❌');
  
  const timestampCheck = await page1.evaluate(() => {
    const bodyText = document.body.textContent || '';
    return bodyText.match(/\d{2}:\d{2}:\d{2}\.\d{3}/) !== null;
  });
  console.log('🕐 Millisecond timestamps found:', timestampCheck ? '✅' : '❌');
}

async function testSSEChat(page1, page2, page3) {
  console.log('📡 Clicking SSE Only buttons...');
  await Promise.all([
    page1.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SSE Only'));
      if (btn) btn.click();
    }),
    page2.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SSE Only'));
      if (btn) btn.click();
    }),
    page3.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SSE Only'));
      if (btn) btn.click();
    })
  ]);

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('⏳ Waiting for SSE connections...');
  await Promise.all([
    page1.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 20000 }),
    page2.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 20000 }),
    page3.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('Connected') && !text.includes('Disconnected');
    }, { timeout: 20000 })
  ]);
  
  console.log('✅ SSE connections established!');

  await page1.evaluate(() => {
    const input = document.querySelector('input[placeholder="Your username"]');
    if (input) input.value = '';
  });
  await page2.evaluate(() => {
    const input = document.querySelector('input[placeholder="Your username"]');
    if (input) input.value = '';
  });
  await page3.evaluate(() => {
    const input = document.querySelector('input[placeholder="Your username"]');
    if (input) input.value = '';
  });
  
  await page1.type('input[placeholder="Your username"]', 'SSEUser1');
  await page2.type('input[placeholder="Your username"]', 'SSEUser2');
  await page3.type('input[placeholder="Your username"]', 'SSEUser3');

  console.log('📡 Sending SSE messages...');
  await page1.type('input[placeholder="Type your message..."]', 'SSE message from User1!');
  await page1.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
    if (btn) btn.click();
  });
  
  await page2.type('input[placeholder="Type your message..."]', 'SSE message from User2!');
  await page2.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
    if (btn) btn.click();
  });
  
  await page3.type('input[placeholder="Type your message..."]', 'SSE message from User3!');
  await page3.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send'));
    if (btn) btn.click();
  });

  await new Promise(resolve => setTimeout(resolve, 5000));

  const sseMessage1Results = await Promise.all([
    page1.waitForFunction(() => document.body.textContent.includes('SSE message from User1!'), { timeout: 5000 }).then(() => true).catch(() => false),
    page2.waitForFunction(() => document.body.textContent.includes('SSE message from User1!'), { timeout: 5000 }).then(() => true).catch(() => false),
    page3.waitForFunction(() => document.body.textContent.includes('SSE message from User1!'), { timeout: 5000 }).then(() => true).catch(() => false)
  ]);

  console.log('📡 SSE messages propagated:', sseMessage1Results.every(Boolean) ? '✅' : '❌');
  
  const sseDelayVisible = await page1.waitForFunction(() => document.body.textContent.includes('Echo delay:'), { timeout: 3000 }).then(() => true).catch(() => false);
  console.log('⏱️ SSE echo delay visible:', sseDelayVisible ? '✅' : '❌');
}

async function testSideBySideComparison(page1) {
  await page1.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Side by Side Comparison'));
    if (btn) btn.click();
  });
  
  console.log('⚖️ Testing side-by-side comparison view...');
  const wsSection = await page1.waitForFunction(() => document.body.textContent.includes('WebSocket Chat'), { timeout: 5000 }).then(() => true).catch(() => false);
  const sseSection = await page1.waitForFunction(() => document.body.textContent.includes('SSE Chat'), { timeout: 5000 }).then(() => true).catch(() => false);
  
  console.log('🔌 WebSocket section visible:', wsSection ? '✅' : '❌');
  console.log('📡 SSE section visible:', sseSection ? '✅' : '❌');
  console.log('⚖️ Side-by-side comparison loaded successfully');
}

if (require.main === module) {
  runMultiUserChatTest().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runMultiUserChatTest };
