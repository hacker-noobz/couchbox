import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  console.log('Release Environment: ', process.env.NEXT_PUBLIC_RELEASE_ENV);
  useEffect(() => {
    fetch('/config')
      .then(response => response.json())
      .then(config => {
        console.log('Retrieved socket URL: ', config.socketUrl);
        const newSocket = io(config.socketUrl);
        setSocket(newSocket);
        console.log('Socket initialized');
        
        return () => newSocket.close();
      }).catch(error => console.error('Failed to fetch config:', error));
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
