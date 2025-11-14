const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// ⚠️ CHANGE THESE TWO LINES:
const BOT_TOKEN = '5115555200:AAESOTMyoEaeVa-aA6tj9sUYS2b6n5gFFeg';
const SHOP_URL = 'https://kounsokong.github.io/telegram-shop/';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();

// Handle /start command
bot.on('message', (msg) => {
  if (msg.text === '/start') {
    bot.sendMessage(msg.chat.id, 
      '👋 Welcome to my shop!\n\nClick the button below to start shopping:', 
      {
        reply_markup: {
          keyboard: [[{
            text: '🛒 Open Shop',
            web_app: { url: SHOP_URL }
          }]],
          resize_keyboard: true
        }
      }
    );
  }
});

// Handle checkout (order received)
bot.on('web_app_data', async (msg) => {
  try {
    const data = JSON.parse(msg.web_app_data.data);
    const chatId = msg.chat.id;
    
    // Create order message
    let orderMsg = '🎉 *Order Received!*\n\n';
    orderMsg += `📦 Order #${Date.now()}\n`;
    orderMsg += `👤 Customer: ${data.userName || 'Guest'}\n\n`;
    orderMsg += '*Items:*\n';
    
    data.items.forEach(item => {
      orderMsg += `${item.emoji} *${item.name}*\n`;
      orderMsg += `   ${item.quantity} × $${item.price} = $${(item.quantity * item.price).toFixed(2)}\n\n`;
    });
    
    orderMsg += `*Total: $${data.total.toFixed(2)}*\n`;
    orderMsg += `Total items: ${data.itemCount}`;
    
    // Send order confirmation
    await bot.sendMessage(chatId, orderMsg, { parse_mode: 'Markdown' });
    
    // Send success message
    await bot.sendMessage(chatId, 
      '✅ *Order Confirmed!*\n\n' +
      'Thank you for your purchase!\n' +
      'We\'ll process your order and send tracking info soon.\n\n' +
      'Need help? Reply to this message.',
      { parse_mode: 'Markdown' }
    );
    
    console.log('Order received:', data);
    
  } catch (error) {
    console.error('Error processing order:', error);
    await bot.sendMessage(msg.chat.id, 
      '❌ Sorry, there was an error processing your order. Please try again.'
    );
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('✅ Bot is running!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🤖 Bot is active and listening...');
});
