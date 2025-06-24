import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { store } from './store';
import { setCurrentUser, setSelectedTool, undo, redo } from './store/whiteboardSlice';
import DrawingSurface from './components/DrawingSurface';
import ToolDock from './components/ToolDock';
import HeaderPanel from './components/HeaderPanel';
import ActionFooter from './components/ActionFooter';
import NetworkIndicator from './components/NetworkIndicator';
import RoomPickerDialog from './components/RoomPickerDialog';
import ChatSidebar from './components/ChatSidebar';
import { User } from './types';
import { useSelector } from 'react-redux';
import { RootState } from './store';

const generateUserColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateUserName = () => {
  const adjectives = ['Quick', 'Clever', 'Bright', 'Swift', 'Smart', 'Sharp', 'Fast', 'Bold'];
  const nouns = ['Fox', 'Eagle', 'Wolf', 'Tiger', 'Lion', 'Bear', 'Hawk', 'Owl'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
};

const WhiteboardApp: React.FC = () => {
  const [showRoomModal, setShowRoomModal] = useState(false);
  const roomId = useSelector((state: RootState) => state.whiteboard.roomId);

  useEffect(() => {
    // Initialize user
    const user: User = {
      id: uuidv4(),
      name: generateUserName(),
      color: generateUserColor(),
      isActive: true,
      joinedAt: Date.now(),
    };

    store.dispatch(setCurrentUser(user));

    // Set up keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { dispatch } = store;

      switch (e.key.toLowerCase()) {
        case 'v':
          dispatch(setSelectedTool('select'));
          break;
        case 'p':
          dispatch(setSelectedTool('pen'));
          break;
        case 'r':
          dispatch(setSelectedTool('rectangle'));
          break;
        case 'c':
          dispatch(setSelectedTool('circle'));
          break;
        case 'l':
          dispatch(setSelectedTool('line'));
          break;
        case 'a':
          dispatch(setSelectedTool('arrow'));
          break;
        case 't':
          dispatch(setSelectedTool('text'));
          break;
        case 'e':
          dispatch(setSelectedTool('eraser'));
          break;
        case 'b':
          dispatch(setSelectedTool('brush'));
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              dispatch(redo());
            } else {
              dispatch(undo());
            }
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            dispatch(redo());
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Show room selection modal if no room is selected
  if (!roomId) {
    return (
      <div className="w-full h-screen bg-gray-50 overflow-hidden relative">
        <RoomPickerDialog 
          isOpen={true} 
          onClose={() => {}} // Can't close if no room selected
        />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden relative">
      <DrawingSurface />
      <ToolDock />
      <HeaderPanel onChangeRoom={() => setShowRoomModal(true)} />
      <ActionFooter />
      <NetworkIndicator />
      <ChatSidebar />
      
      {/* Room Selection Modal */}
      <RoomPickerDialog 
        isOpen={showRoomModal} 
        onClose={() => setShowRoomModal(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <WhiteboardApp />
    </Provider>
  );
}

export default App;