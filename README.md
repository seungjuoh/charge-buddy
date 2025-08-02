# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/99c3d9e4-92dc-45b1-8618-89754828551e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/99c3d9e4-92dc-45b1-8618-89754828551e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

### Option 1: Auto-Setup Scripts (Recommended)

**Windows Users:**
```bash
# Double-click run.bat or run in Command Prompt:
run.bat
```

**PowerShell Users:**
```powershell
# Run in PowerShell:
.\run.ps1
```

**Unix/Linux/macOS Users:**
```bash
# Make executable and run:
chmod +x run.sh
./run.sh
```

### Option 2: Manual Setup

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Option 3: One-Command Setup
```bash
npm run setup
```

## Troubleshooting Guide

If you encounter issues when running the project after cloning from GitHub, try these solutions:

### 1. **Dependencies Installation Issues**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. **Port Already in Use**
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill the process using the port (Windows)
taskkill /PID <PID_NUMBER> /F

# Or use a different port by modifying vite.config.ts
```

### 3. **Node.js Version Issues**
```bash
# Check your Node.js version
node --version

# This project works with Node.js 16+ and npm 8+
# If you have an older version, update Node.js
```

### 4. **Windows-Specific Issues**
```bash
# If you get 'vite' is not recognized error:
# Make sure you're in the project directory and run:
npm install
npm run dev

# If PowerShell execution policy blocks scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 5. **Firewall/Antivirus Issues**
- Temporarily disable Windows Defender or antivirus
- Add the project folder to antivirus exclusions
- Check Windows Firewall settings

### 6. **Alternative Port Configuration**
If port 8080 doesn't work, the server will automatically try port 5173. You can also manually change the port in `vite.config.ts`:

```typescript
server: {
  port: 3000, // Change to any available port
  open: true,
}
```

### 7. **Development Server Access**
Once running, the server will be available at:
- http://localhost:8080/ (default)
- http://localhost:5173/ (fallback)

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/99c3d9e4-92dc-45b1-8618-89754828551e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
