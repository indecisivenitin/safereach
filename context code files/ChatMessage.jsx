import { formatDistanceToNow } from 'date-fns';

export default function ChatMessage({
  message,
  isOwn,
  senderName,
  senderRole
}) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {/* Show sender name for messages from other person */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold">
              {senderName || 'Unknown'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {senderRole === 'woman' ? '👩' : '🙋'}
            </span>
          </div>
        )}

        {/* Message text */}
        <p className="text-sm break-words">{message.message}</p>

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true
          })}
        </div>
      </div>
    </div>
  );
}