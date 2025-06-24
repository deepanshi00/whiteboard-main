import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleChatSidebar, clearUnreadChatCount } from '../store/whiteboardSlice';
import { useSocket } from '../hooks/useSocket';
import { MessageCircle, Send, X, Users } from 'lucide-react';

const ChatSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    chatSidebarOpen,
    messages,
    unreadCount,
    users,
    currentUser,
    roomId,
    isConnected,
  } = useSelector((state: RootState) => ({
    chatSidebarOpen: state.whiteboard.ui.chatSidebarOpen,
    messages: state.whiteboard.chat.messages,
    unreadCount: state.whiteboard.chat.unreadCount,
    users: state.whiteboard.users,
    currentUser: state.whiteboard.currentUser,
    roomId: state.whiteboard.roomId,
    isConnected: state.whiteboard.isConnected,
  }));

  const { emitChatMessage } = useSocket(roomId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (chatSidebarOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatSidebarOpen]);

  // Clear unread count when sidebar opens
  useEffect(() => {
    if (chatSidebarOpen) {
      dispatch(clearUnreadChatCount());
    }
  }, [chatSidebarOpen, dispatch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      emitChatMessage(message);
      setMessage('');
    }
  };

  const handleToggleSidebar = () => {
    dispatch(toggleChatSidebar());
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: typeof messages }, message) => {
    const dateKey = formatDate(message.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={handleToggleSidebar}
        className={`fixed top-1/2 right-4 transform -translate-y-1/2 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          chatSidebarOpen 
            ? 'bg-gray-600 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title={chatSidebarOpen ? 'Close Chat' : 'Open Chat'}
      >
        {chatSidebarOpen ? (
          <X size={20} />
        ) : (
          <div className="relative">
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${
          chatSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Room Chat</h3>
            </div>
            <button
              onClick={handleToggleSidebar}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Active Users */}
          <div className="flex items-center space-x-2 mt-2 text-sm opacity-90">
            <Users size={14} />
            <span>
              {users.length + (currentUser ? 1 : 0)} user{users.length + (currentUser ? 1 : 0) !== 1 ? 's' : ''} online
            </span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-140px)]">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="mb-4">
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((msg) => {
                  const isOwnMessage = msg.userId === currentUser?.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="flex items-center space-x-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: msg.userColor }}
                            />
                            <span className="text-xs font-medium opacity-75">
                              {msg.userName}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm break-words">{msg.message}</p>
                        
                        <div className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!message.trim() || !isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
          
          {!isConnected && (
            <div className="text-xs text-orange-600 mt-1 flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2" />
              Reconnecting...
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {chatSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={handleToggleSidebar}
        />
      )}
    </>
  );
};

export default ChatSidebar; 