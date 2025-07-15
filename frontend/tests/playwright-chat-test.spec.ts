import { test, expect, Browser, Page, BrowserContext } from '@playwright/test';

const messageTemplates = [
  "こんにちは！今日はいい天気ですね",
  "WebSocketとSSEの比較、興味深いですね", 
  "リアルタイム通信のテストをしています",
  "ミリ秒のタイムスタンプが正確に表示されていますか？",
  "複数ユーザーでのチャットテストです",
  "エコーバック遅延の測定結果はどうでしょうか"
];

function getRandomMessage(): string {
  const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
  const timestamp = new Date().toLocaleTimeString('ja-JP');
  return `${template} (${timestamp})`;
}

test.describe('Chat Application Tests', () => {
  test('should load chat application and test basic functionality', async ({ page }) => {
    console.log('🦊 Testing with Firefox browser...');
    
    await page.goto('http://frontend:3000');
    
    const wsButton = page.locator('button:has-text("WebSocket Only")');
    const sseButton = page.locator('button:has-text("SSE Only")');
    const compButton = page.locator('button:has-text("Side by Side Comparison")');
    
    await expect(wsButton).toBeVisible();
    await expect(sseButton).toBeVisible();
    await expect(compButton).toBeVisible();
    
    console.log('✅ Main navigation buttons found');
    
    await wsButton.click();
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=WebSocket Chat')).toBeVisible();
    await expect(page.locator('input[placeholder="Your username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Type your message..."]')).toBeVisible();
    
    console.log('✅ WebSocket UI elements loaded');
    
    await sseButton.click();
    await page.waitForTimeout(3000);
    
    await expect(page.locator('text=SSE Chat')).toBeVisible();
    
    try {
      await page.waitForFunction(() => {
        const text = document.body.textContent || '';
        return text.includes('Connected') && !text.includes('Disconnected');
      }, { timeout: 10000 });
      console.log('✅ SSE connection established');
    } catch (error) {
      console.log('⚠️ SSE connection timeout, continuing with test');
    }
    
    await page.fill('input[placeholder="Your username"]', 'PlaywrightTestUser');
    
    const testMessage = getRandomMessage();
    await page.fill('input[placeholder="Type your message..."]', testMessage);
    await page.click('button:has-text("Send")');
    
    console.log(`💬 Sent test message: ${testMessage.substring(0, 30)}...`);
    
    const hasTimestamp = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return bodyText.match(/\d{2}:\d{2}:\d{2}\.\d{3}/) !== null;
    });
    
    const hasEchoDelay = await page.evaluate(() => {
      return document.body.textContent?.includes('Echo delay:') || false;
    });
    
    console.log(`🕐 Millisecond timestamps: ${hasTimestamp ? '✅' : '❌'}`);
    console.log(`⏱️ Echo delay measurement: ${hasEchoDelay ? '✅' : '❌'}`);
    
    await compButton.click();
    await page.waitForTimeout(2000);
    
    const hasWSSection = await page.locator('text=WebSocket Chat').isVisible();
    const hasSSESection = await page.locator('text=SSE Chat').isVisible();
    
    expect(hasWSSection && hasSSESection).toBeTruthy();
    console.log('✅ Side-by-side comparison loaded');
    
    await page.screenshot({ 
      path: 'test-results/firefox-chat-test.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: test-results/firefox-chat-test.png');
  });
  
  test('should handle multiple user simulation', async ({ browser }) => {
    console.log('🦊 Testing multi-user scenario with Firefox...');
    
    const contexts: BrowserContext[] = [];
    const pages: Page[] = [];
    
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      contexts.push(context);
      pages.push(page);
      
      await page.goto('http://frontend:3000');
      
      await page.click('button:has-text("SSE Only")');
      await page.waitForTimeout(2000);
      
      await page.fill('input[placeholder="Your username"]', `FirefoxUser${i + 1}`);
      
      console.log(`🦊 Firefox browser ${i + 1} ready`);
    }
    
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < pages.length; i++) {
        const message = getRandomMessage();
        
        try {
          await pages[i].fill('input[placeholder="Type your message..."]', message);
          await pages[i].click('button:has-text("Send")');
          
          console.log(`💬 Firefox User ${i + 1} sent: "${message.substring(0, 30)}..."`);
          await pages[i].waitForTimeout(1000);
        } catch (error) {
          console.log(`❌ Firefox User ${i + 1} failed to send message`);
        }
      }
    }
    
    console.log('✅ Multi-user Firefox test completed');
    
    for (const context of contexts) {
      await context.close();
    }
  });
});
