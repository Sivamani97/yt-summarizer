# 🚀 VidBrain — Complete Setup Guide (Beginner Friendly)

> Follow these steps in order. Even if you've never coded before, this will work.

---

## WHAT YOU NEED BEFORE STARTING

| Tool | Why | Download Link |
|------|-----|---------------|
| Node.js | Runs the backend server | https://nodejs.org → click "LTS" |
| MongoDB | Stores your data | https://www.mongodb.com/try/download/community |
| VS Code | Edit config files | https://code.visualstudio.com (optional but helpful) |

---

## STEP 1 — Extract the ZIP

1. Find the file `yt-summarizer-final.zip` you downloaded
2. Right-click it → **Extract All** (Windows) or double-click (Mac)
3. You'll get a folder called `yt-summarizer`
4. Open that folder

---

## STEP 2 — Install Node.js

1. Go to **https://nodejs.org**
2. Click the big green **"LTS"** button to download
3. Run the installer — click Next → Next → Install
4. To verify it worked, open a terminal and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

> **How to open a terminal:**
> - **Windows**: Press `Win + R`, type `cmd`, press Enter
> - **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter

---

## STEP 3 — Install MongoDB (Local Database)

### Windows:
1. Go to **https://www.mongodb.com/try/download/community**
2. Select: Version = Latest, Platform = Windows, Package = msi
3. Download and run the installer
4. During install, check **"Install MongoDB as a Service"** ← important!
5. Click through and finish

### Mac:
```bash
# If you have Homebrew (recommended):
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Verify MongoDB is running:
Open terminal and type:
```bash
mongosh
```
If you see a `>` prompt, MongoDB is running. Type `exit` to leave.

> **Alternative**: Skip local MongoDB and use **MongoDB Atlas FREE cloud** instead.
> See "Optional: Use MongoDB Atlas" section at the bottom.

---

## STEP 4 — Get Your FREE AI API Key (Google Gemini)

This is the key that makes the AI work. **It's completely free.**

1. Open your browser and go to:
   **https://aistudio.google.com/app/apikey**

2. Sign in with your **Google account** (Gmail, YouTube, etc.)

3. Click the blue **"Create API Key"** button

4. Click **"Create API key in new project"**

5. A long string of letters and numbers appears — **copy it**
   (it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX`)

6. Keep this somewhere safe — you'll need it in Step 6

> ✅ This is 100% free. No credit card. No billing. Ever.
> Google gives you 1,500 free requests per day which is plenty.

---

## STEP 5 — Install All Dependencies

Open a terminal and navigate into the project folder:

```bash
# Windows example (adjust path to where you extracted):
cd C:\Users\YourName\Downloads\yt-summarizer

# Mac/Linux example:
cd ~/Downloads/yt-summarizer
```

Then run:
```bash
npm run install:all
```

This will download all required packages for both frontend and backend.
**Wait for it to finish** (may take 2-3 minutes).

---

## STEP 6 — Create Your Config File

### 6a. Go into the backend folder and copy the example config:

**Windows (Command Prompt):**
```cmd
cd backend
copy .env.example .env
cd ..
```

**Mac/Linux (Terminal):**
```bash
cd backend
cp .env.example .env
cd ..
```

### 6b. Open the `.env` file in a text editor

- **Windows**: Right-click the file → Open with → Notepad
- **Mac**: Right-click → Open with → TextEdit
- **VS Code**: `code backend/.env`

### 6c. Find these two lines and edit them:

**Find this line:**
```
GEMINI_API_KEY=paste_your_gemini_key_here
```
**Change it to** (paste your key from Step 4):
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXX
```

**Find these lines:**
```
JWT_SECRET=change_this_to_any_long_random_string_at_least_32_chars
JWT_REFRESH_SECRET=change_this_to_a_different_long_random_string_here
```
**Change them to any random text** (just mash the keyboard, needs 32+ chars):
```
JWT_SECRET=myappsecretkey123456789abcdefghijklmnop
JWT_REFRESH_SECRET=anothersecretkey987654321zyxwvutsrqpon
```

**Save the file.**

---

## STEP 7 — Start the App

In your terminal (make sure you're in the `yt-summarizer` folder), run:

```bash
npm run dev
```

You'll see output like this — wait for both to appear:

```
✅ MongoDB Connected: localhost
🚀 VidBrain API Server Started
✅ Port: 5000

Compiled successfully!
Local: http://localhost:3000
```

**If you see these, the app is running!**

---

## STEP 8 — Open the App

Open your browser and go to:

**http://localhost:3000**

You should see the VidBrain landing page!

1. Click **"Get Started"**
2. Create an account (name, email, password — all stored locally)
3. Click **"Analyze"** in the top menu
4. Paste a YouTube URL like:
   ```
   https://www.youtube.com/watch?v=aircAruvnKk
   ```
5. Click **"Analyze Video"**
6. Wait 10-30 seconds for AI to process
7. See your summary, bullet points, concepts and quiz! 🎉

---

## STOPPING THE APP

Press **Ctrl + C** in the terminal to stop the server.

To start again later:
```bash
cd yt-summarizer
npm run dev
```

---

## TROUBLESHOOTING

### ❌ "MongoDB connection failed"
- Make sure MongoDB is running
- Windows: Open Services app → find "MongoDB Server" → Start it
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongodb`

### ❌ "npm: command not found"
- Node.js isn't installed or the terminal needs to be restarted
- Close the terminal, reopen it, try again

### ❌ "npm run install:all failed"
- Try running inside each folder separately:
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

### ❌ App loads but analysis shows "Get your API key"
- Your GEMINI_API_KEY in `.env` is still the placeholder text
- Make sure you saved the `.env` file after editing
- Restart the server: Ctrl+C then `npm run dev`

### ❌ "Transcript not available"
- The video doesn't have English captions enabled
- Try a different YouTube video — educational/tech videos usually have captions
- Example videos that work well:
  - https://www.youtube.com/watch?v=aircAruvnKk (3Blue1Brown)
  - https://www.youtube.com/watch?v=kCc8FmEb1nY (Andrej Karpathy)

### ❌ Port 3000 or 5000 already in use
- Another app is using that port
- Change in `backend/.env`: `PORT=5001`
- Or kill the process:
  - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <number> /F`
  - Mac/Linux: `kill -9 $(lsof -t -i:3000)`

---

## OPTIONAL: Use MongoDB Atlas (Free Cloud Database)

If you don't want to install MongoDB locally:

1. Go to **https://cloud.mongodb.com**
2. Click **"Try Free"** → Create account
3. Choose **"M0 FREE"** cluster → Select a region → Create
4. Go to **Security → Database Access** → Add a database user (username + password)
5. Go to **Security → Network Access** → Add IP Address → Allow from Anywhere (0.0.0.0/0)
6. Go to **Databases** → Click **"Connect"** → **"Drivers"**
7. Copy the connection string (looks like `mongodb+srv://...`)
8. In your `backend/.env`, change:
   ```
   MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/yt-summarizer
   ```

---

## OPTIONAL: Use Anthropic Claude Instead of Gemini

If you want higher quality AI responses:

1. Go to **https://console.anthropic.com**
2. Sign up → Go to **Billing** → Add a payment method
3. Add $5 credit (the minimum — lasts months for light use)
4. Go to **API Keys** → Create Key → Copy it
5. In `backend/.env`:
   - Comment out the Gemini line: `# GEMINI_API_KEY=...`
   - Add: `ANTHROPIC_API_KEY=sk-ant-api03-yourkey`

Both keys can coexist — Anthropic takes priority if both are set.

---

## QUICK REFERENCE — All Commands

```bash
# Navigate to project
cd yt-summarizer

# Install everything (only needed once)
npm run install:all

# Start the full app (backend + frontend together)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build frontend for production
npm run build
```

---

*VidBrain — Turn any YouTube video into structured knowledge.*
