import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/socketProvider';

const useRoomManager = (initialNickname) => {
    const socket = useSocket();
    const [roomId, setRoomId] = useState('');
    const [room, setRoom] = useState({});
    const [roomJoined, setRoomJoined] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);

    // Create room with dynamic game type
    const handleCreateRoom = useCallback((gameType = 'defaultGame') => {
        if (!socket) return;
        socket.emit('createRoom', { gameType, nickname: initialNickname });
    }, [socket, initialNickname]);

    // Join room
    const handleJoinRoom = useCallback((roomId, nickname) => {
        if (!socket) return;
        if (roomId && nickname) {
            socket.emit('joinRoom', { roomId, nickname });
            setRoomId(roomId);
        } else {
            setAlertMessage('Please enter a valid room code.');
            setAlertOpen(true);
        }
    }, [socket]);

    // Leave room
    const handleLeaveRoom = useCallback(() => {
        if (roomId && initialNickname) {
            socket.emit('leaveRoom', { roomId, nickname: initialNickname });
            setRoom({});
            setRoomId('');
            setRoomJoined(false);
        }
    }, [socket, roomId, initialNickname]);

    // Handle socket events
    useEffect(() => {
        if (!socket) return;

        const handleEvents = () => {
            socket.on('roomCreated', (data) => {
                setRoomId(data.roomId);
                setRoom(data.room);
                setRoomJoined(true);
            });

            socket.on('roomJoined', (data) => {
                setRoomId(data.roomId);
                setRoom(data.room);
                setRoomJoined(true);
            });

            socket.on('playerLeft', (data) => {
                setRoom(prevRoom => ({
                    ...prevRoom,
                    players: prevRoom.players.filter(player => player.nickname !== data.nickname)
                }));
            });

            socket.on('error', (message) => {
                setAlertMessage(message);
                setAlertOpen(true);
            });
        };

        handleEvents();

        return () => {
            socket.off('roomCreated');
            socket.off('roomJoined');
            socket.off('playerLeft');
            socket.off('error');
        };
    }, [socket]);

    // Handle unloading the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (roomJoined) {
                socket.emit('leaveRoom', { roomId, nickname: initialNickname });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [socket, roomId, initialNickname, roomJoined]);

    return {
        roomId,
        room,
        roomJoined,
        alertMessage,
        alertOpen,
        setAlertOpen,
        handleJoinRoom,
        handleLeaveRoom,
        handleCreateRoom
    };
};

export default useRoomManager;
