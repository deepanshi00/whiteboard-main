import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Users, Plus, ArrowRight, X, Shuffle } from 'lucide-react';
import { setRoomId } from '../store/whiteboardSlice';

interface RoomSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoomPickerDialog: React.FC<RoomSelectionModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [roomInput, setRoomInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [accessType, setAccessType] = useState<'edit' | 'view'>('edit');

  const generateRandomRoomId = () => {
    const adjectives = ['Pixel', 'Quantum', 'Neon', 'Solar', 'Aqua', 'Cyber', 'Zen', 'Lunar'];
    const nouns = ['Forge', 'Den', 'Nest', 'Arena', 'Hive', 'Studio', 'Vault', 'Sphere'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}-${noun}-${number}`;
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!roomId.trim()) return;
    
    setIsJoining(true);
    
    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    dispatch(setRoomId(roomId.trim()));
    setIsJoining(false);
    onClose();
  };

  const handleCreateNewRoom = () => {
    const newRoomId = generateRandomRoomId();
    setRoomInput(newRoomId);
    // Store access type with room in localStorage for demo
    localStorage.setItem(`room-access-${newRoomId}`, accessType);
  };

  const handleQuickJoin = (roomId: string) => {
    handleJoinRoom(roomId);
  };

  const recentRooms = [
    'Pixel-Forge-101',
    'Quantum-Den-202',
    'Neon-Nest-303',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#D6F0FF] rounded-[2.5rem] shadow-2xl border-4 border-[#8DCBFF] w-full max-w-[380px] min-h-[480px] mx-4 flex flex-col items-center p-0 animate-scaleIn"
           style={{ aspectRatio: '4/5', boxShadow: '0 8px 32px 0 rgba(140,203,255,0.25)' }}>
        {/* Cute icon/illustration at the top */}
        <div className="w-full flex flex-col items-center pt-8 pb-2">
          <div className="w-16 h-16 rounded-full bg-[#8DCBFF] flex items-center justify-center shadow-lg mb-2 border-4 border-white">
            <Users size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#8DCBFF] mb-1">Create or Join a Team</h2>
          <p className="text-sm text-[#6CA6C1] mb-2">Collaborate in real-time with your team</p>
        </div>
        {/* Header */}
            <button
              onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
          aria-label="Close dialog"
            >
          <X size={22} />
            </button>
        {/* Content */}
        <div className="flex-1 w-full px-8 py-4 space-y-6 flex flex-col justify-center">
          {/* Create New Room */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Create New Whiteboard
            </h3>
            {/* Access Type Selector */}
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="edit"
                  checked={accessType === 'edit'}
                  onChange={() => setAccessType('edit')}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">Edit</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="view"
                  checked={accessType === 'view'}
                  onChange={() => setAccessType('view')}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">View Only</span>
              </label>
            </div>
            <button
              onClick={handleCreateNewRoom}
              className="w-full p-4 border-2 border-dashed border-[#8DCBFF] rounded-2xl hover:border-[#8DCBFF] hover:bg-[#E6F7FF] transition-all duration-200 group font-semibold text-base"
            >
              <div className="flex items-center justify-center gap-3 text-gray-600 group-hover:text-[#8DCBFF]">
                <Plus size={20} />
                <span className="font-medium">Create New Room</span>
                <Shuffle size={16} className="opacity-60" />
              </div>
            </button>
          </div>

          {/* Join Existing Room */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Join Existing Room
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Enter room ID..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinRoom(roomInput);
                    }
                  }}
                />
                <button
                  onClick={() => handleJoinRoom(roomInput)}
                  disabled={!roomInput.trim() || isJoining}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    roomInput.trim() && !isJoining
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isJoining ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Rooms */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Recent Rooms
            </h3>
            <div className="space-y-2">
              {recentRooms.map((roomId, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickJoin(roomId)}
                  className="w-full text-left p-3 rounded-2xl border-2 border-[#8DCBFF] bg-[#E6F7FF] hover:bg-[#D6F0FF] hover:border-[#8DCBFF] transition-all duration-200 group font-semibold"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#8DCBFF] rounded-xl flex items-center justify-center group-hover:bg-[#D6F0FF]">
                        <Users size={14} className="text-white group-hover:text-[#8DCBFF]" />
                      </div>
                      <span className="font-medium text-gray-800">{roomId}</span>
                    </div>
                    <ArrowRight size={14} className="text-[#8DCBFF] group-hover:text-[#8DCBFF]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full px-8 py-4 bg-[#E6F7FF] rounded-b-[2.5rem]">
          <div className="text-xs text-[#8DCBFF] text-center">
            <p className="mb-1">💡 <strong>Tip:</strong> Share the room ID with others to collaborate</p>
            <p>Anyone with the room ID can join and edit together</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPickerDialog;