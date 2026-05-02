export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname.slice(1);
  
  // Set all webhooks route
  if (req.method === 'GET' && path === 'set-webhook') {
    return setAllWebhooks(req, res);
  }
  
  if (req.method === 'POST') {
    return handleWebhook(req, res, path);
  }
  
  return res.status(200).send('Bot is running!');
}

async function setAllWebhooks(req, res) {
  const host = req.headers.host;
  const results = [];
  
  for (let i = 1; i <= 15; i++) {
    const token = process.env[`BOT${i}_TOKEN`];
    
    if (token && token !== `token${i}` && token !== '') {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${token}/setWebhook?url=https://${host}/bot${i}`
        );
        const data = await response.json();
        results.push(`Bot ${i}: ${data.ok ? '✅ Set' : '❌ ' + data.description}`);
      } catch (e) {
        results.push(`Bot ${i}: ❌ Network error`);
      }
    } else {
      results.push(`Bot ${i}: ⚠️ No token`);
    }
  }
  
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(results.join('\n'));
}

async function handleWebhook(req, res, botKey) {
  try {
    const update = req.body;
    
    if (!update.message) {
      return res.status(200).send('OK');
    }
    
    const msg = update.message;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text || '';
    
    // All 15 bots config
    const bots = {
      'bot1':  { token: process.env.BOT1_TOKEN,  owner: process.env.BOT1_OWNER,  name: process.env.BOT1_NAME },
      'bot2':  { token: process.env.BOT2_TOKEN,  owner: process.env.BOT2_OWNER,  name: process.env.BOT2_NAME },
      'bot3':  { token: process.env.BOT3_TOKEN,  owner: process.env.BOT3_OWNER,  name: process.env.BOT3_NAME },
      'bot4':  { token: process.env.BOT4_TOKEN,  owner: process.env.BOT4_OWNER,  name: process.env.BOT4_NAME },
      'bot5':  { token: process.env.BOT5_TOKEN,  owner: process.env.BOT5_OWNER,  name: process.env.BOT5_NAME },
      'bot6':  { token: process.env.BOT6_TOKEN,  owner: process.env.BOT6_OWNER,  name: process.env.BOT6_NAME },
      'bot7':  { token: process.env.BOT7_TOKEN,  owner: process.env.BOT7_OWNER,  name: process.env.BOT7_NAME },
      'bot8':  { token: process.env.BOT8_TOKEN,  owner: process.env.BOT8_OWNER,  name: process.env.BOT8_NAME },
      'bot9':  { token: process.env.BOT9_TOKEN,  owner: process.env.BOT9_OWNER,  name: process.env.BOT9_NAME },
      'bot10': { token: process.env.BOT10_TOKEN, owner: process.env.BOT10_OWNER, name: process.env.BOT10_NAME },
      'bot11': { token: process.env.BOT11_TOKEN, owner: process.env.BOT11_OWNER, name: process.env.BOT11_NAME },
      'bot12': { token: process.env.BOT12_TOKEN, owner: process.env.BOT12_OWNER, name: process.env.BOT12_NAME },
      'bot13': { token: process.env.BOT13_TOKEN, owner: process.env.BOT13_OWNER, name: process.env.BOT13_NAME },
      'bot14': { token: process.env.BOT14_TOKEN, owner: process.env.BOT14_OWNER, name: process.env.BOT14_NAME },
      'bot15': { token: process.env.BOT15_TOKEN, owner: process.env.BOT15_OWNER, name: process.env.BOT15_NAME }
    };
    
    const bot = bots[botKey];
    
    if (!bot || !bot.token || bot.token === `token${botKey.replace('bot', '')}`) {
      return res.status(404).send('Bot not found');
    }
    
    // Welcome message on /start
    if (text === '/start') {
      await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `👋 Welcome to ${bot.name}!\n\n✅ Your messages will be forwarded to our team.`,
          reply_to_message_id: messageId
        })
      });
      return res.status(200).send('OK');
    }
    
    // Forward message to owner
    await fetch(`https://api.telegram.org/bot${bot.token}/forwardMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: bot.owner,
        from_chat_id: chatId,
        message_id: messageId
      })
    });
    
    return res.status(200).send('OK');
    
  } catch (error) {
    return res.status(200).send('OK');
  }
}
