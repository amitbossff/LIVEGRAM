import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.substring(1);
  
  if (req.method === "GET" && path === "set-webhook") {
    return await setAllWebhooks(req);
  }
  
  if (req.method === "POST") {
    return await handleWebhook(req, path);
  }
  
  return new Response("Bot is running!", { status: 200 });
});

async function setAllWebhooks(req) {
  const workerUrl = new URL(req.url).origin;
  const results = [];
  
  for (let i = 12; i <= 20; i++) {
    const token = Deno.env.get(`BOT${i}_TOKEN`);
    
    if (token && token !== '') {
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

async function handleWebhook(req, botKey) {
  try {
    const update = await req.json();
    
    if (!update.message) {
      return new Response('OK', { status: 200 });
    }
    
    const msg = update.message;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text || '';
    
    const bots = {
      'bot12': { token: Deno.env.get('BOT12_TOKEN'), owner: Deno.env.get('BOT12_OWNER'), name: Deno.env.get('BOT12_NAME') },
      'bot13': { token: Deno.env.get('BOT13_TOKEN'), owner: Deno.env.get('BOT13_OWNER'), name: Deno.env.get('BOT13_NAME') },
      'bot14': { token: Deno.env.get('BOT14_TOKEN'), owner: Deno.env.get('BOT14_OWNER'), name: Deno.env.get('BOT14_NAME') },
      'bot15': { token: Deno.env.get('BOT15_TOKEN'), owner: Deno.env.get('BOT15_OWNER'), name: Deno.env.get('BOT15_NAME') },
      'bot16': { token: Deno.env.get('BOT16_TOKEN'), owner: Deno.env.get('BOT16_OWNER'), name: Deno.env.get('BOT16_NAME') },
      'bot17': { token: Deno.env.get('BOT17_TOKEN'), owner: Deno.env.get('BOT17_OWNER'), name: Deno.env.get('BOT17_NAME') },
      'bot18': { token: Deno.env.get('BOT18_TOKEN'), owner: Deno.env.get('BOT18_OWNER'), name: Deno.env.get('BOT18_NAME') },
      'bot19': { token: Deno.env.get('BOT19_TOKEN'), owner: Deno.env.get('BOT19_OWNER'), name: Deno.env.get('BOT19_NAME') },
      'bot20': { token: Deno.env.get('BOT20_TOKEN'), owner: Deno.env.get('BOT20_OWNER'), name: Deno.env.get('BOT20_NAME') }
    };
    
    const bot = bots[botKey];
    
    if (!bot || !bot.token) {
      return new Response('Bot not found', { status: 404 });
    }
    
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
