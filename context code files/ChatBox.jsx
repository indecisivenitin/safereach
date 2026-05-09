import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { alertService } from '../../services/api';
import ChatMessage from './ChatMessage';
import MessageInput from '../MessageInput';
import toast from 'react-hot-toast';

export default function ChatBox({
  alertId,
  isAlertActive = true,
  volunteerName = 'Volunteer'
}) {
  const { user } = useAuth();
  const { emit } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // =====================================================
  // LOAD CHAT HISTORY ON MOUNT
  // =====================================================

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!alertId) return;

      setLoading(true);

      try {
        const response = await alertService.getChatHistory(alertId);
        setMessages(response.data.chatMessages || []);
        console.log('✅ Chat history loaded:', response.data.chatMessages);
      } catch (error) {
        console.error('❌ Failed to load chat history:', error);
        // Silently fail - chat may be empty
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [alertId]);

  // =====================================================
  // AUTO-SCROLL TO LATEST MESSAGE
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = async (messageText) => {
    if (!alertId || !messageText.trim()) {
      throw new Error('Invalid message');
    }

    return new Promise((resolve, reject) => {
      emit(
        'chat:send-message',
        {
          alertId,
          message: messageText
        },
        (response) => {
          if (response?.success) {
            resolve();
          } else {
            reject(
              new Error(
                response?.message || 'Failed to send message'
              )
            );
          }
        }
      );
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex flex-col h-96 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary to-red-500 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
            Live Chat
          </p>
          <h3 className="text-lg font-bold mt-1">
            💬 {isAlertActive ? 'Active' : 'Resolved'}
          </h3>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            isAlertActive
              ? 'bg-green-400 animate-pulse'
              : 'bg-gray-400'
          }`}
        />
      </div>

      {/* MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-sm">⏳ Loading chat...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                💬 Start messaging to coordinate
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwn =
                msg.sender?._id === user?._id ||
                msg.sender === user?._id;

              return (
                <ChatMessage
                  key={index}
                  message={msg}
                  isOwn={isOwn}
                  senderName={msg.sender?.name || volunteerName}
                  senderRole={msg.senderRole}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* INPUT */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={loading}
        isAlertActive={isAlertActive}
      />
    </div>
  );
}