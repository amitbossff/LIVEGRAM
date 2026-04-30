export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.substring(1);
    
    // NEW: Set all webhooks route
    if (request.method === 'GET' && path === 'set-webhook') {
      return setAllWebhooks(request, env);
    }
    
    if (request.method === 'POST') {
      return handleWebhook(request, env, path);
    }
    
    return new Response('Bot is running!', { status: 200 });
  }
};

// NEW: Set all webhooks function
async function setAllWebhooks(request, env) {
  const workerUrl = `https://${request.headers.get('host')}`;
  const results = [];
  
  for (let i = 1; i <= 15; i++) {
    const token = env[`BOT${i}_TOKEN`];
    
    if (token && token !== `token${i}` && token !== '') {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/setWebhook?url=${workerUrl}/bot${i}`
        );
        const data = await res.json();
        results.push(`Bot ${i}: ${data.ok ? '✅ Set' : '❌ ' + data.description}`);
      } catch (e) {
        results.push(`Bot ${i}: ❌ Network error`);
      }
    } else {
      results.push(`Bot ${i}: ⚠️ No token`);
    }
  }
  
  return new Response(results.join('\n'), {
    headers: { 'Content-Type': 'text/plain' }
  });
}

async function handleWebhook(request, env, botKey) {
  try {
    const update = await request.json();
    
    if (!update.message) {
      return new Response('OK', { status: 200 });
    }
    
    const msg = update.message;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text || '';
    
    // All 15 bots config
    const bots = {
      'bot1':  { token: env.BOT1_TOKEN,  owner: env.BOT1_OWNER,  name: env.BOT1_NAME },
      'bot2':  { token: env.BOT2_TOKEN,  owner: env.BOT2_OWNER,  name: env.BOT2_NAME },
      'bot3':  { token: env.BOT3_TOKEN,  owner: env.BOT3_OWNER,  name: env.BOT3_NAME },
      'bot4':  { token: env.BOT4_TOKEN,  owner: env.BOT4_OWNER,  name: env.BOT4_NAME },
      'bot5':  { token: env.BOT5_TOKEN,  owner: env.BOT5_OWNER,  name: env.BOT5_NAME },
      'bot6':  { token: env.BOT6_TOKEN,  owner: env.BOT6_OWNER,  name: env.BOT6_NAME },
      'bot7':  { token: env.BOT7_TOKEN,  owner: env.BOT7_OWNER,  name: env.BOT7_NAME },
      'bot8':  { token: env.BOT8_TOKEN,  owner: env.BOT8_OWNER,  name: env.BOT8_NAME },
      'bot9':  { token: env.BOT9_TOKEN,  owner: env.BOT9_OWNER,  name: env.BOT9_NAME },
      'bot10': { token: env.BOT10_TOKEN, owner: env.BOT10_OWNER, name: env.BOT10_NAME },
      'bot11': { token: env.BOT11_TOKEN, owner: env.BOT11_OWNER, name: env.BOT11_NAME },
      'bot12': { token: env.BOT12_TOKEN, owner: env.BOT12_OWNER, name: env.BOT12_NAME },
      'bot13': { token: env.BOT13_TOKEN, owner: env.BOT13_OWNER, name: env.BOT13_NAME },
      'bot14': { token: env.BOT14_TOKEN, owner: env.BOT14_OWNER, name: env.BOT14_NAME },
      'bot15': { token: env.BOT15_TOKEN, owner: env.BOT15_OWNER, name: env.BOT15_NAME }
    };
    
    const bot = bots[botKey];
    
    if (!bot) {
      return new Response('Bot not found', { status: 404 });
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
      return new Response('OK', { status: 200 });
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
    
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    return new Response('OK', { status: 200 });
  }
}
