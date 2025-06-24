# 🎨 Collaborative Whiteboard

A real-time collaborative whiteboard application built with React, TypeScript, and Socket.io featuring professional drawing tools and a cute pastel UI theme.

## 🌟 Project Overview

This full-stack application enables multiple users to collaborate on a shared whiteboard in real-time. Users can draw with various tools, create shapes, add text, and see each other's cursors live. The application features a modern pastel-themed UI with randomized toolbar layout for a playful experience.

### Key Features
- **Real-time collaboration** with live cursor tracking
- **Professional drawing tools** (pen, pencil, brush, eraser, shapes)
- **Advanced text editing** with font customization
- **Cute pastel UI theme** with component-specific colors
- **Room-based system** with access control (Edit/View Only)
- **Tech-themed room names** (e.g., "Pixel-Forge-101", "Quantum-Den-202")

### Technology Stack
- **Frontend**: React 18.3.1, TypeScript 5.5.3, Redux Toolkit 2.0.1, Tailwind CSS 3.4.17
- **Backend**: Node.js, Express 4.18.2, Socket.io 4.7.5
- **Build Tool**: Vite 6.3.5

## 🚀 Steps to Reproduce Results

### Prerequisites
- Node.js 18+ ([Download here](https://nodejs.org/))
- npm 8+ (comes with Node.js)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Servers** (requires 2 terminals)

   **Terminal 1 - Frontend:**
   ```bash
   npm run dev
   ```
   
   **Terminal 2 - Backend:**
   ```bash
   npm run server
   ```

3. **Access Application**
   - Open browser to `http://localhost:5173`
   - You should see the pastel-themed whiteboard interface

### Testing Collaboration

1. **Create a Room**
   - Click "Create Room" in the center dialog
   - Choose "Edit" or "View Only" access
   - Note the generated room name

2. **Test Real-time Features**
   - Open second browser tab/window to `http://localhost:5173`
   - Join the same room using the room name
   - Draw in one tab and see it appear in the other instantly

3. **Try Different Tools**
   - Use the randomized toolbar (shuffles each load)
   - Test pen, shapes, text tool with various properties
   - Verify color picker and stroke width controls work

## 🎨 Expected Results

After setup, you should see:

✅ **Frontend running** on port 5173 with pastel UI theme  
✅ **Backend running** on port 3001 (Socket.io server)  
✅ **Room creation/joining** working with tech-themed names  
✅ **Real-time drawing sync** between multiple browser tabs  
✅ **All drawing tools** functional with customizable properties  
✅ **Text tool** with font options and alignment controls  
✅ **Live cursor tracking** showing collaborators' positions  

## 🔧 Available Scripts

```bash
npm run dev      # Start frontend (port 5173)
npm run server   # Start backend (port 3001)
npm run build    # Build for production
```

## 🏗️ Project Structure

```
├── src/components/          # React components
│   ├── ToolDock.tsx        # Main toolbar (pink theme)
│   ├── DrawingSurface.tsx  # Canvas component
│   ├── RoomPickerDialog.tsx # Room creation (blue theme)
│   ├── HeaderPanel.tsx     # Top nav (lavender theme)
│   └── ActionFooter.tsx    # Bottom controls (yellow theme)
├── server/index.js         # Socket.io server
└── package.json           # Dependencies & scripts
```

## 🐛 Troubleshooting

**Port in use error:**
```bash
# Kill processes on ports 5173 or 3001
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Dependencies issues:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---