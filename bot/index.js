require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Environment & Config ───────────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USERS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://locdepagwmrkzxpgimgt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_FxKPiWkgHKf6w3dbNu0LIg_a47b6bEZ';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!BOT_TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is missing in .env file!');
  process.exit(1);
}

// ─── Clients ────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ─── Telegram Bot Setup ──────────────────────────────────────────────────────
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🌸 Anji\'s Kitchen AI Telegram Admin Bot is running...');
console.log('🤖 AI Description Mode:', genAI ? '✅ Gemini AI Enabled' : '⚡ Smart Copywriter AI Mode');
console.log('📱 Allowed User IDs:', ALLOWED_USER_IDS.length > 0 ? ALLOWED_USER_IDS.join(', ') : 'All users');

// Handle polling errors silently
bot.on('polling_error', (error) => {
  console.warn('Telegram Polling warning:', error.message);
});

// ─── Security Check ─────────────────────────────────────────────────────────
function isAuthorized(msg) {
  if (ALLOWED_USER_IDS.length === 0) return true;
  const userId = msg.from?.id?.toString();
  const username = msg.from?.username ? `@${msg.from.username}` : '';
  return ALLOWED_USER_IDS.includes(userId) || (username && ALLOWED_USER_IDS.includes(username));
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function inferCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('cake') || n.includes('cookie') || n.includes('brownie') || n.includes('pastry') || n.includes('muffin') || n.includes('cupcake')) {
    return 'Baked Goods & Cakes';
  }
  if (n.includes('pickle') || n.includes('achar') || n.includes('chutney') || n.includes('preserve')) {
    return 'Pickles & Preserves';
  }
  if (n.includes('namkeen') || n.includes('mathri') || n.includes('chips') || n.includes('makhana') || n.includes('snack') || n.includes('kaju')) {
    return 'Snacks & Namkeen';
  }
  if (n.includes('cream') || n.includes('rose water') || n.includes('mist') || n.includes('soap') || n.includes('lotion') || n.includes('balm') || n.includes('skincare')) {
    return 'Cosmetics & Skincare';
  }
  if (n.includes('clutcher') || n.includes('clip') || n.includes('hair') || n.includes('band') || n.includes('scrunchie')) {
    return 'Hair Clutchers';
  }
  return 'Homemade Food';
}

async function findOrCreateCategory(categoryInput) {
  const cleanInput = categoryInput.trim();
  const slug = generateSlug(cleanInput);

  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${slug},name.ilike.%${cleanInput}%`)
    .limit(1);

  if (existing && existing.length > 0) return existing[0];

  const { data: newCat, error } = await supabase
    .from('categories')
    .insert({ name: cleanInput, slug: slug, display_order: 10, is_active: true })
    .select()
    .single();

  return error ? null : newCat;
}

// ─── AI Description Generator ────────────────────────────────────────────────
async function generateProductDescription(name, categoryName, imageBuffer) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };
      const prompt = `Write a mouthwatering, appealing 2-3 sentence product description for an Indian home kitchen brand named "Anji's Kitchen". Product name: "${name}", Category: "${categoryName}". Look at the image provided. Highlight homemade freshness, pure ingredients, authentic flavor, and loving care. Keep it engaging. Do NOT use hashtags or markdown formatting.`;

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (e) {
      console.warn('Gemini AI Vision call fallback:', e.message);
    }
  }

  const cat = categoryName.toLowerCase();

  if (cat.includes('baked') || cat.includes('cake')) {
    return `Handcrafted with love at Anji's Kitchen! Our ${name} is freshly baked using pure butter and premium ingredients for a rich, delicious melt-in-your-mouth flavor.`;
  }
  if (cat.includes('pickle')) {
    return `Authentic homemade ${name} prepared using traditional family recipes, sun-dried spices, and pure oil. Packed with traditional flavor and zero artificial preservatives.`;
  }
  if (cat.includes('snack') || cat.includes('namkeen')) {
    return `Crispy, savory ${name} prepared fresh in small batches at Anji's Kitchen. The ultimate tea-time companion made with authentic Indian spices.`;
  }
  if (cat.includes('cosmetic') || cat.includes('skin')) {
    return `Pure, handcrafted ${name} made with natural botanical ingredients. Formulated to nourish, refresh, and care for your skin gently without harsh chemicals.`;
  }
  if (cat.includes('hair') || cat.includes('clutcher')) {
    return `Beautiful handcrafted ${name} designed to add an elegant touch to your style. Durable, lightweight, and crafted with attention to detail.`;
  }

  return `Freshly prepared homemade ${name} crafted with love and authentic ingredients at Anji's Kitchen, Jabalpur. Made fresh to order for peak quality and taste.`;
}

// ─── /start & /help ──────────────────────────────────────────────────────────
bot.onText(/\/(start|help)/, (msg) => {
  if (!isAuthorized(msg)) {
    return bot.sendMessage(msg.chat.id, '⛔ Unauthorized access. ID: ' + msg.from.id);
  }

  const text = `
✨ Anji's Kitchen AI Telegram Admin Bot

Upload products directly from your phone — AI writes descriptions automatically!

📸 How to Upload (Super Easy):

1️⃣ Option 1: Name & Price Only (AI Auto-Fills Description & Category)
Send photo with caption:
Special Paneer Thali | 180

2️⃣ Option 2: Name, Price & Category
Send photo with caption:
Chocolate Fudge Cake | 450 | Baked Goods

3️⃣ Option 3: Full Custom Caption
Send photo with caption:
Mango Pickle | 150 | Pickles | Homemade Aam Ka Achar with pure mustard oil

-----------------------------------
📋 Commands:
• /products — View all live products
• /categories — View categories
• /addcat <Category> — Add a new category
• /toggle <ID> — Hide / Show product
• /feature <ID> — Toggle homepage feature
• /delete <ID> — Delete product

Your User ID: ${msg.from.id}
`;

  bot.sendMessage(msg.chat.id, text);
});

// ─── Photo Handler with AI Description Generation ─────────────────────────────
bot.on('photo', async (msg) => {
  if (!isAuthorized(msg)) {
    return bot.sendMessage(msg.chat.id, '⛔ Unauthorized access.');
  }

  const caption = msg.caption;
  if (!caption) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ Please include a caption with Product Name & Price when sending a photo!\n\nExample:\nSpecial Veg Thali | 180'
    );
  }

  const parts = caption.split('|').map(s => s.trim());
  const name = parts[0];
  const priceStr = parts[1] || '';

  if (!name || !priceStr) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ Invalid format! Please provide at least:\nProduct Name | Price\n\nExample:\nPaneer Butter Masala | 220'
    );
  }

  const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(price)) {
    return bot.sendMessage(msg.chat.id, '⚠️ Invalid price format! E.g. 180');
  }

  const rawCat = parts[2] ? parts[2] : inferCategory(name);
  let description = parts[3] || '';
  const sizesStr = parts[4] || '';
  const origPriceStr = parts[5] || '';
  const originalPrice = origPriceStr ? parseFloat(origPriceStr.replace(/[^0-9.]/g, '')) : null;

  const statusMsg = await bot.sendMessage(msg.chat.id, '✨ Analyzing photo & generating AI product description...');

  try {
    const photo = msg.photo[msg.photo.length - 1];
    const fileLink = await bot.getFileLink(photo.file_id);

    const response = await fetch(fileLink);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!description) {
      description = await generateProductDescription(name, rawCat, buffer);
    }

    const fileName = `${Date.now()}-${generateSlug(name)}.jpg`;
    let publicUrl = fileLink;

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
    } else {
      console.warn('Supabase storage warning:', uploadErr.message);
    }

    const category = await findOrCreateCategory(rawCat);

    const productData = {
      name: name,
      slug: generateSlug(name) + '-' + Math.floor(Math.random() * 1000),
      description: description,
      price: price,
      original_price: originalPrice || null,
      images: [publicUrl],
      category_id: category ? category.id : null,
      sizes: sizesStr ? sizesStr.split(',').map(s => s.trim()) : [],
      tags: ['AI Generated', 'Telegram Upload'],
      is_active: true,
      is_featured: true
    };

    const { data: inserted, error: dbErr } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (dbErr) {
      console.error('DB Insert Error:', dbErr);
      let errTip = dbErr.message;
      if (dbErr.message.includes('row-level security') || dbErr.code === '42501') {
        errTip += '\n\n💡 TIP: Please run the SQL schema update in your Supabase SQL Editor to allow product uploads!';
      }
      return bot.editMessageText(`❌ Failed to save product to database:\n${errTip}`, {
        chat_id: msg.chat.id,
        message_id: statusMsg.message_id
      });
    }

    const successText = `
🎉 Product Published Live!

🛍️ Name: ${inserted.name}
💰 Price: ₹${inserted.price}
📂 Category: ${category ? category.name : rawCat}

✨ AI Generated Description:
"${inserted.description}"

📌 ID: ${inserted.id}
🔗 View Live: https://anjiskitchen.in/catalog
`;

    bot.editMessageText(successText, {
      chat_id: msg.chat.id,
      message_id: statusMsg.message_id
    });

  } catch (err) {
    console.error('Error processing upload:', err);
    bot.editMessageText(`❌ Error: ${err.message}`, {
      chat_id: msg.chat.id,
      message_id: statusMsg.message_id
    });
  }
});

// ─── Commands ────────────────────────────────────────────────────────────────
bot.onText(/\/products/, async (msg) => {
  if (!isAuthorized(msg)) return;

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, is_active, is_featured')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error || !products || products.length === 0) {
    return bot.sendMessage(msg.chat.id, '🛍️ No products found.');
  }

  let text = '🛍️ Live Products (Latest 15):\n\n';
  products.forEach((p, i) => {
    const status = p.is_active ? '✅ Active' : '🙈 Hidden';
    const featured = p.is_featured ? '⭐' : '';
    text += `${i + 1}. ${p.name} ${featured}\n   ₹${p.price} | ${status}\n   ID: ${p.id}\n\n`;
  });

  text += '💡 Use /toggle <ID> or /delete <ID> to manage.';
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/categories/, async (msg) => {
  if (!isAuthorized(msg)) return;
  const { data: categories } = await supabase.from('categories').select('*').order('display_order');
  if (!categories || categories.length === 0) return bot.sendMessage(msg.chat.id, '📂 No categories found.');

  let text = '📂 Product Categories:\n\n';
  categories.forEach((c, i) => { text += `${i + 1}. ${c.name} (${c.slug})\n`; });
  text += '\n💡 Use /addcat <Category Name> to create a new category.';
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/addcat (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const name = match[1].trim();
  const category = await findOrCreateCategory(name);
  if (category) {
    bot.sendMessage(msg.chat.id, `✅ Category "${category.name}" created successfully!`);
  } else {
    bot.sendMessage(msg.chat.id, '❌ Failed to create category.');
  }
});

bot.onText(/\/toggle (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const id = match[1].trim();
  const { data: prod } = await supabase.from('products').select('is_active, name').eq('id', id).single();
  if (!prod) return bot.sendMessage(msg.chat.id, '❌ Product not found.');

  const { error } = await supabase.from('products').update({ is_active: !prod.is_active }).eq('id', id);
  if (!error) {
    bot.sendMessage(msg.chat.id, `🔄 Status for "${prod.name}" toggled to: ${!prod.is_active ? '✅ Active' : '🙈 Hidden'}`);
  }
});

bot.onText(/\/feature (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const id = match[1].trim();
  const { data: prod } = await supabase.from('products').select('is_featured, name').eq('id', id).single();
  if (!prod) return bot.sendMessage(msg.chat.id, '❌ Product not found.');

  const { error } = await supabase.from('products').update({ is_featured: !prod.is_featured }).eq('id', id);
  if (!error) {
    bot.sendMessage(msg.chat.id, `⭐ Featured status for "${prod.name}" toggled to: ${!prod.is_featured ? '⭐ Featured' : 'Normal'}`);
  }
});

bot.onText(/\/delete (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const id = match[1].trim();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (!error) {
    bot.sendMessage(msg.chat.id, '🗑️ Product deleted successfully.');
  } else {
    bot.sendMessage(msg.chat.id, `❌ Delete failed: ${error.message}`);
  }
});
