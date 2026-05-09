import { useState } from 'react';
import toast from 'react-hot-toast';

export default function MessageInput({
  onSendMessage,
  disabled = false,
  isAlertActive = true
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    if (message.trim().length > 1000) {
      toast.error('Message is too long (max 1000 characters)');
      return;
    }

    setSending(true);

    try {
      await onSendMessage(message.trim());
      setMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="border-t border-gray-200 bg-white p-4"
    >
      {!isAlertActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3 text-xs text-yellow-800">
          💬 Alert is no longer active. Chat is read-only.
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isAlertActive
              ? 'Type a message...'
              : 'Chat is read-only'
          }
          disabled={disabled || !isAlertActive || sending}
          maxLength={1000}
          className={`flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            disabled || !isAlertActive
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-white'
          }`}
        />
        <button
          type="submit"
          disabled={
            disabled ||
            !isAlertActive ||
            sending ||
            !message.trim()
          }
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            disabled ||
            !isAlertActive ||
            sending ||
            !message.trim()
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
          }`}
        >
          {sending ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            '📤'
          )}
        </button>
      </div>

      {message.length > 0 && (
        <div className="text-xs text-gray-400 mt-2 text-right">
          {message.length}/1000
        </div>
      )}
    </form>
  );
}