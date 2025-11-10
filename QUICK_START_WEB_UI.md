# Quick Start - Memory Bank Web Interface

Get the web interface up and running in minutes!

## 🚀 Fastest Way (One Command)

```bash
cd /path/to/memory-bank
./start-web-interface.sh
```

Then open your browser to: **http://localhost:3000**

That's it! The script will:
- ✓ Check for Node.js
- ✓ Install dependencies automatically
- ✓ Start the backend server (port 3001)
- ✓ Start the frontend server (port 3000)

## 📖 Manual Setup (If Script Doesn't Work)

### Step 1: Start the Backend

```bash
cd web-server
npm install  # if not already done
npm run dev
```

You'll see: `Memory Bank Web Server running on port 3001`

### Step 2: Start the Frontend (New Terminal)

```bash
cd web-ui
npm install  # if not already done
npm run dev
```

You'll see: `Local: http://localhost:3000/`

### Step 3: Open Browser

Navigate to: **http://localhost:3000**

## 🎯 What You Can Do

### Browse Chronologically
- View all documents sorted by date (newest first)
- See what's been updated recently
- Quick access to latest documentation

### Browse by Task
- Select a task (T1-T18) from the sidebar
- View all documents related to that task
- Filter by task to find related documentation

### Browse by Topic
- Select a topic from the sidebar
- Explore documents organized by subject area
- Navigate by categories like "Architecture", "Implementation", etc.

### Search
- Type in the search box at the top
- Results appear in real-time
- Works across all views
- Search looks at titles, content, and task references

### View Documents
- Click any document to see its full content
- Markdown is rendered nicely with syntax highlighting
- See metadata (dates, word count, file size)
- Click "Back" to return to the list

## ⚙️ Configuration

### Change Memory Bank Location
Edit `web-server/.env`:
```
MEMORY_BANK_PATH=/path/to/your/memory-bank
```

### Change Ports
Edit `web-server/.env`:
```
PORT=3001  # Backend port (default: 3001)
```

Edit `web-ui/vite.config.js`:
```javascript
server: {
  port: 3000,  // Frontend port (default: 3000)
  proxy: {
    '/api': {
      target: 'http://localhost:3001'  // Change if backend port changed
    }
  }
}
```

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Port already in use
```bash
# Find what's using the port (Unix/Linux/Mac)
lsof -i :3000
lsof -i :3001

# Kill the process (get PID from above)
kill -9 <PID>
```

### "Failed to load documents"
- Make sure backend is running on port 3001
- Check that `MEMORY_BANK_PATH` in `.env` is correct
- Verify the memory bank directory exists and is readable

### Slow to start
- First startup indexes all markdown files (can take a few seconds)
- Subsequent startups are faster
- Large memory banks may take longer

## 📁 Project Structure

```
memory-bank/
├── web-server/          # Backend API
│   ├── src/
│   ├── .env
│   └── package.json
├── web-ui/              # Frontend React app
│   ├── src/
│   ├── index.html
│   └── package.json
├── WEB_INTERFACE_README.md    # Detailed documentation
├── QUICK_START_WEB_UI.md      # This file
└── start-web-interface.sh     # Startup helper script
```

## 💡 Tips

- **Development Tip**: Keep both terminal windows open side-by-side so you can see any errors
- **Memory Bank Tip**: The web interface indexes your memory bank on startup. If you add new files, restart the backend
- **Search Tip**: Search works best when you know what you're looking for. Try searching for task IDs (T1, T5, etc.)
- **Navigation Tip**: Use the three tabs to switch between different organization styles

## 🎓 Learn More

For detailed documentation, see: **WEB_INTERFACE_README.md**

This includes:
- Full feature list
- Complete API documentation
- Architecture details
- Customization guide
- Development setup

## ❓ Need Help?

1. Check the browser console (F12) for JavaScript errors
2. Check the terminal output for backend errors
3. Ensure Node.js 16+ is installed: `node --version`
4. Read the detailed README: **WEB_INTERFACE_README.md**

## 🎉 You're All Set!

Your Memory Bank web interface is ready to use. Happy exploring!
