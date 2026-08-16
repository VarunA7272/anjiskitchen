require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// ─── Environment & Config ───────────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USERS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://locdepagwmrkzxpgimgt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_FxKPiWkgHKf6w3dbNu0LIg_a47b6bEZ';

if (!BOT_TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is missing in .env file!');
  console.log('Please set TELEGRAM_BOT_TOKEN in bot/.env or environment variables.');
  process.exit(1);
}

// ─── Supabase Client ────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Initialize Telegram Bot ────────────────────────────────────────────────
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🌸 Anji\'s Kitchen Telegram Admin Bot is running...');
console.log('📱 Allowed User IDs:', ALLOWED_USER_IDS.length > 0 ? ALLOWED_USER_IDS.join(', ') : 'All users (set TELEGRAM_ALLOWED_USERS for security)');

// ─── Security Middleware ────────────────────────────────────────────────────
function isAuthorized(msg) {
  if (ALLOWED_USER_IDS.length === 0) return true; // Allow all if not configured yet
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

async function findOrCreateCategory(categoryInput) {
  const cleanInput = categoryInput.trim();
  const slug = generateSlug(cleanInput);

  // 1. Try to find existing category
  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${slug},name.ilike.%${cleanInput}%`)
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0];
  }

  // 2. Create category if not found
  const { data: newCat, error } = await supabase
    .from('categories')
    .insert({
      name: cleanInput,
      slug: slug,
      display_order: 10,
      is_active: true
    })
    .select()
    .single();

  if (error || !newCat) {
    console.error('Error creating category:', error);
    return null;
  }

  return newCat;
}

// ─── /start & /help ──────────────────────────────────────────────────────────
bot.onText(/\/(start|help)/, (msg) => {
  if (!isAuthorized(msg)) {
    return bot.sendMessage(msg.chat.id, '⛔ Unauthorized access. Your User ID is: `' + msg.from.id + '`', { parse_mode: 'Markdown' });
  }

  const text = `
🌸 *Welcome to Anji's Kitchen Mobile Admin Bot!*

Upload products to your website directly from Telegram in seconds.

📸 *How to Upload a Product:*
1. Send a photo of the product to this bot.
2. In the photo caption, write:
\`Product Name | Price | Category | Description | Sizes (optional) | Original Price (optional)\`

📌 *Examples:*

• *Basic Upload:*
\`Special Veg Thali | 180 | Homemade Food | Fresh home-cooked thali with paneer sabzi, dal & phulkas\`

• *With Sizes & Discount:*
\`Chocolate Fudge Cake | 450 | Baked Goods | Rich eggless dark chocolate cake | 500g, 1kg | 550\`

• *Cosmetics / Hair Accessories:*
\`Rose Floral Clutcher | 199 | Hair Clutchers | Set of 2 handcrafted floral hair clips\`

-----------------------------------
📋 *Bot Commands:*
• /products — List all live products
• /categories — List product categories
• /addcat <Category Name> — Add a new category
• /toggle <product_id> — Toggle out of stock / active
• /feature <product_id> — Toggle featured on homepage
• /delete <product_id> — Delete a product

Your Telegram ID: \`${msg.from.id}\`
`;

  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

// ─── Photo Upload Handler ────────────────────────────────────────────────────
bot.on('photo', async (msg) => {
  if (!isAuthorized(msg)) {
    return bot.sendMessage(msg.chat.id, '⛔ Unauthorized access.');
  }

  const caption = msg.caption;
  if (!caption) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ *Please include a caption with product details when sending a photo!*\n\nFormat:\n`Product Name | Price | Category | Description`',
      { parse_mode: 'Markdown' }
    );
  }

  const parts = caption.split('|').map(s => s.trim());
  if (parts.length < 3) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ *Invalid format!* Please provide at least:\n`Name | Price | Category | Description`\n\nExample:\n`Chocolate Cake | 450 | Baked Goods | Rich eggless cake`',
      { parse_mode: 'Markdown' }
    );
  }

  const [name, priceStr, categoryStr, descriptionStr, sizesStr, origPriceStr] = parts;
  const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  const originalPrice = origPriceStr ? parseFloat(origPriceStr.replace(/[^0-9.]/g, '')) : null;

  if (isNaN(price)) {
    return bot.sendMessage(msg.chat.id, '⚠️ Invalid price format! E.g. `180`');
  }

  const statusMsg = await bot.sendMessage(msg.chat.id, '⏳ Processing image & saving to website...');

  try {
    // 1. Get highest quality photo from Telegram
    const photo = msg.photo[msg.photo.length - 1];
    const fileLink = await bot.getFileLink(photo.file_id);

    // 2. Fetch image buffer
    const response = await fetch(fileLink);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to Supabase Storage
    const fileName = `${Date.now()}-${generateSlug(name)}.jpg`;
    let publicUrl = fileLink; // Fallback to Telegram link if Supabase Storage fails

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
    }

    // 4. Resolve Category
    const category = await findOrCreateCategory(categoryStr);

    // 5. Insert Product into Supabase DB
    const productData = {
      name: name,
      slug: generateSlug(name) + '-' + Math.floor(Math.random() * 1000),
      description: descriptionStr || name,
      price: price,
      original_price: originalPrice || null,
      images: [publicUrl],
      category_id: category ? category.id : null,
      sizes: sizesStr ? sizesStr.split(',').map(s => s.trim()) : [],
      tags: ['Telegram Upload'],
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
      return bot.editMessageText(`❌ Failed to save product to database: ${dbErr.message}`, {
        chat_id: msg.chat.id,
        message_id: statusMsg.message_id
      });
    }

    const successText = `
🎉 *Product Published Live!*

🛍️ *Name:* ${inserted.name}
💰 *Price:* ₹${inserted.price}${inserted.original_price ? ` (was ₹${inserted.original_price})` : ''}
📂 *Category:* ${category ? category.name : categoryStr}
📌 *ID:* \`${inserted.id}\`

🔗 *View Live on Website:* https://anjiskitchen.in/catalog
`;

    bot.editMessageText(successText, {
      chat_id: msg.chat.id,
      message_id: statusMsg.message_id,
      parse_mode: 'Markdown'
    });

  } catch (err) {
    console.error('Error processing telegram upload:', err);
    bot.editMessageText(`❌ Error processing upload: ${err.message}`, {
      chat_id: msg.chat.id,
      message_id: statusMsg.message_id
    });
  }
});

// ─── Command: /products ──────────────────────────────────────────────────────
bot.onText(/\/products/, async (msg) => {
  if (!isAuthorized(msg)) return;

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, is_active, is_featured')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error || !products || products.length === 0) {
    return bot.sendMessage(msg.chat.id, '🛍️ No products found in database.');
  }

  let text = '🛍️ *Live Products (Latest 15):*\n\n';
  products.forEach((p, i) => {
    const status = p.is_active ? '✅ Active' : '🙈 Hidden';
    const featured = p.is_featured ? '⭐' : '';
    text += `${i + 1}. *${p.name}* ${featured}\n   ₹${p.price} | ${status}\n   ID: \`${p.id}\`\n\n`;
  });

  text += '💡 _Use /toggle <ID> or /delete <ID> to manage._';
  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

// ─── Command: /categories ────────────────────────────────────────────────────
bot.onText(/\/categories/, async (msg) => {
  if (!isAuthorized(msg)) return;

  const { data: categories } = await supabase.from('categories').select('*').order('display_order');
  if (!categories || categories.length === 0) {
    return bot.sendMessage(msg.chat.id, '📂 No categories found.');
  }

  let text = '📂 *Product Categories:*\n\n';
  categories.forEach((c, i) => {
    text += `${i + 1}. *${c.name}* (\`${c.slug}\`)\n`;
  });
  text += '\n💡 _Use /addcat <Category Name> to create a new category._';
  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

// ─── Command: /addcat <Name> ─────────────────────────────────────────────────
bot.onText(/\/addcat (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const name = match[1].trim();
  const category = await findOrCreateCategory(name);
  if (category) {
    bot.sendMessage(msg.chat.id, `✅ Category *${category.name}* created successfully!`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(msg.chat.id, '❌ Failed to create category.');
  }
});

// ─── Command: /toggle <product_id> ───────────────────────────────────────────
bot.onText(/\/toggle (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const id = match[1].trim();

  const { data: prod } = await supabase.from('products').select('is_active, name').eq('id', id).single();
  if (!prod) return bot.sendMessage(msg.chat.id, '❌ Product not found.');

  const { error } = await supabase.from('products').update({ is_active: !prod.is_active }).eq('id', id);
  if (!error) {
    bot.sendMessage(msg.chat.id, `🔄 Status for *${prod.name}* toggled to: ${!prod.is_active ? '✅ Active' : '🙈 Hidden'}`, { parse_mode: 'Markdown' });
  }
});

// ─── Command: /feature <product_id> ──────────────────────────────────────────
bot.onText(/\/feature (.+)/, async (msg, match) => {
  if (!isAuthorized(msg)) return;
  const id = match[1].trim();

  const { data: prod } = await supabase.from('products').select('is_featured, name').eq('id', id).single();
  if (!prod) return bot.sendMessage(msg.chat.id, '❌ Product not found.');

  const { error } = await supabase.from('products').update({ is_featured: !prod.is_featured }).eq('id', id);
  if (!error) {
    bot.sendMessage(msg.chat.id, `⭐ Featured status for *${prod.name}* toggled to: ${!prod.is_featured ? '⭐ Featured' : 'Normal'}`, { parse_mode: 'Markdown' });
  }
});

// ─── Command: /delete <product_id> ───────────────────────────────────────────
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
