import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useOnlineGame() {
  const socketRef = useRef(null);
  const pendingJoinRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | creating | waiting | playing | finished | disconnected
  const [roomId, setRoomId] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [error, setError] = useState(null);
  const [waitingPlayAgain, setWaitingPlayAgain] = useState(false);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      if (pendingJoinRef.current) {
        socket.emit('join-room', pendingJoinRef.current);
        pendingJoinRef.current = null;
      }
    });

    socket.on('room-created', ({ roomId: id, symbol: sym }) => {
      setRoomId(id);
      setSymbol(sym);
      setStatus('waiting');
    });

    socket.on('room-joined', ({ roomId: id, symbol: sym }) => {
      setRoomId(id);
      setSymbol(sym);
    });

    socket.on('game-start', ({ board: b }) => {
      setBoard(b);
      setStatus('playing');
    });

    socket.on('move-made', ({ board: b, isXTurn: xt, winner: w, isDraw: d }) => {
      setBoard(b);
      setIsXTurn(xt);
      setWinner(w);
      setIsDraw(d);
      if (w || d) setStatus('finished');
    });

    socket.on('game-restart', () => {
      setBoard(Array(9).fill(null));
      setIsXTurn(true);
      setWinner(null);
      setIsDraw(false);
      setWaitingPlayAgain(false);
      setStatus('playing');
    });

    socket.on('waiting-for-play-again', () => {
      setWaitingPlayAgain(true);
    });

    socket.on('opponent-disconnected', () => {
      setStatus('disconnected');
    });

    socket.on('join-error', (msg) => {
      setError(msg);
      setStatus('idle');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(() => {
    setStatus('creating');
    setError(null);
    socketRef.current?.emit('create-room');
  }, []);

  const joinRoom = useCallback((id) => {
    setError(null);
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', id);
    } else {
      pendingJoinRef.current = id;
    }
  }, []);

  const makeMove = useCallback(
    (index) => {
      if (!roomId) return;
      socketRef.current?.emit('make-move', { roomId, index });
    },
    [roomId]
  );

  const requestPlayAgain = useCallback(() => {
    if (!roomId) return;
    socketRef.current?.emit('play-again', roomId);
  }, [roomId]);

  const isMyTurn = symbol === 'X' ? isXTurn : !isXTurn;

  return {
    status,
    roomId,
    symbol,
    board,
    isXTurn,
    winner,
    isDraw,
    error,
    isMyTurn,
    waitingPlayAgain,
    createRoom,
    joinRoom,
    makeMove,
    requestPlayAgain,
  };
}
