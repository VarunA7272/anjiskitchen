# 🤖 Anji's Kitchen — Telegram Mobile Admin Bot

Manage your e-commerce store directly from Telegram on your phone!

---

## ⚡ Quick 2-Minute Setup

### Step 1: Create your Telegram Bot Token
1. Open Telegram on your phone and search for **`@BotFather`**.
2. Send the message `/newbot`.
3. Give your bot a name (e.g. `Anji's Kitchen Admin Bot`).
4. Choose a username (e.g. `anjiskitchen_admin_bot`).
5. **@BotFather** will reply with an **API Token** like `7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`. Copy this token!

### Step 2: Get your Telegram User ID (Security)
1. In Telegram, search for **`@userinfobot`**.
2. Send `/start`.
3. It will reply with your numerical **Id** (e.g. `123456789`). Copy this ID!

### Step 3: Configure `.env`
In the `bot` folder, create a `.env` file (or copy `.env.example` to `.env`):
```ini
TELEGRAM_BOT_TOKEN=7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_ALLOWED_USERS=123456789

SUPABASE_URL=https://locdepagwmrkzxpgimgt.supabase.co
SUPABASE_ANON_KEY=sb_publishable_FxKPiWkgHKf6w3dbNu0LIg_a47b6bEZ
```

### Step 4: Run the Bot
```bash
cd bot
npm install
npm start
```

---

## 📱 How to Upload Products from Mobile

1. Open Telegram on your phone and chat with your bot.
2. Send any photo from your camera or gallery.
3. In the caption, write:
   `Name | Price | Category | Description`

### Examples:
- `Special Veg Thali | 180 | Homemade Food | Fresh home-cooked meal with paneer & 4 phulkas`
- `Chocolate Fudge Cake | 450 | Baked Goods | Rich eggless dark chocolate cake | 500g, 1kg | 550`

The bot will instantly upload the photo to Supabase Storage, insert the product row in Supabase Database, and reply with confirmation!
