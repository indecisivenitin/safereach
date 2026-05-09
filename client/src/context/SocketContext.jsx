import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { io } from 'socket.io-client';

import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({
  children
}) => {

  const {
    token,
    user
  } = useAuth();

  const socketRef = useRef(null);

  const [connected, setConnected] =
    useState(false);

  // =====================================================
  // CONNECT SOCKET
  // =====================================================

  useEffect(() => {

    // DISCONNECT IF NO AUTH

    if (!token || !user) {

      socketRef.current?.disconnect();

      socketRef.current = null;

      setConnected(false);

      return;
    }

    // CREATE SOCKET

    const socket = io(

      import.meta.env.VITE_SOCKET_URL ||
      'http://localhost:5000',

      {
        auth: {
          token
        },

        transports: [
          'websocket',
          'polling'
        ],

        reconnection: true,

        reconnectionAttempts: 5,

        reconnectionDelay: 1000,

        autoConnect: true
      }
    );

    // =====================================================
    // CONNECTION EVENTS
    // =====================================================

    socket.on(
      'connect',
      () => {

        console.log(
          '✅ Socket connected:',
          socket.id
        );

        setConnected(true);
      }
    );

    socket.on(
      'disconnect',
      (reason) => {

        console.log(
          '🔌 Socket disconnected:',
          reason
        );

        setConnected(false);
      }
    );

    socket.on(
      'connect_error',
      (err) => {

        console.error(
          '❌ Socket connection error:',
          err.message
        );

        setConnected(false);
      }
    );

    // =====================================================
    // GLOBAL ERROR
    // =====================================================

    socket.on(
      'app-error',
      (err) => {

        console.error(
          '🚨 Socket App Error:',
          err
        );
      }
    );

    // SAVE INSTANCE

    socketRef.current = socket;

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {

      console.log(
        '🔌 Disconnecting socket...'
      );

      socket.disconnect();

      socketRef.current = null;

      setConnected(false);
    };

    // ✅ FIX: Only depend on token, NOT user object
    // User object changes shouldn't trigger socket reconnect/disconnect
    // This prevents auto-logout when user details are updated
  }, [token, user?._id]);

  // =====================================================
  // SOCKET HELPERS
  // =====================================================

  const emit = (
    event,
    data,
    callback
  ) => {

    const socket = socketRef.current;

    // IMPORTANT FIX
    // must check .connected also

    if (!socket || !socket.connected) {

      console.warn(
        `Socket not connected for emit: ${event}`
      );

      return false;
    }

    socket.emit(
      event,
      data,
      callback
    );

    return true;
  };
  const on = (
    event,
    handler
  ) => {

    socketRef.current?.on(
      event,
      handler
    );
  };

  const off = (
    event,
    handler
  ) => {

    socketRef.current?.off(
      event,
      handler
    );
  };

  // =====================================================
  // CONTEXT
  // =====================================================

  return (

    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        emit,
        on,
        off
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useSocket = () =>
  useContext(SocketContext);