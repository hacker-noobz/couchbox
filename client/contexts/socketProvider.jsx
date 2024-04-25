import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (socketUrl) {
      console.log('Using socket URL: ', socketUrl);
      const newSocket = io(socketUrl);
      setSocket(newSocket);
      console.log('Socket initialized');

      return () => {
        newSocket.close();
        console.log('Socket disconnected');
      };
    } else {
      console.error('Socket URL not provided in environment variables');
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
