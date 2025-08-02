# 🚀 Charge Buddy 2 - Quick Start Guide

## 📋 Prerequisites
- Node.js 16+ installed
- npm 8+ installed

## 🎯 One-Click Setup

### Windows Users
1. **Double-click `run.bat`** in the project folder
2. Wait for dependencies to install
3. The development server will start automatically

### PowerShell Users
1. **Right-click `run.ps1`** and select "Run with PowerShell"
2. Or open PowerShell and run: `.\run.ps1`

### Unix/Linux/macOS Users
1. **Open terminal** in the project folder
2. Run: `chmod +x run.sh && ./run.sh`

## 🔧 Manual Setup (Alternative)

```bash
# 1. Clone the repository
git clone <YOUR_REPO_URL>
cd charge-buddy-2

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

## 🌐 Access the Application
Once the server starts, open your browser and go to:
- **http://localhost:8080/** (default)
- **http://localhost:5173/** (fallback)

## 🛠️ Troubleshooting

### If you get "vite is not recognized":
```bash
npm install
npm run dev
```

### If PowerShell blocks script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### If port is already in use:
The server will automatically try alternative ports (5173, 3000, etc.)

## 📝 What the scripts do:
1. **Check if dependencies are installed**
2. **Install dependencies if needed** (`npm install`)
3. **Start development server** (`npm run dev`)
4. **Open browser automatically**

## 🎉 Success!
You should see the Charge Buddy 2 application running in your browser! 