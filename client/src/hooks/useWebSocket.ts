import { useEffect, useRef, useCallback } from 'react';

type WebSocketOptions = {
  onMessage: (message: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

export const useWebSocket = (url: string, options: WebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      optionsRef.current.onOpen?.();
    };

    ws.onmessage = (message) => {
      optionsRef.current.onMessage(message);
    };

    ws.onclose = () => {
      optionsRef.current.onClose?.();
    };

    ws.onerror = (error) => {
      optionsRef.current.onError?.(error);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { sendMessage };
};