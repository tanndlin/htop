import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';

import { api } from '../proto/api';
import CpuInfo = api.CpuInfo;
import RamInfo = api.RamInfo;
import RequestMessage = api.RequestMessage;
import ResponseMessage = api.ResponseMessage;

import { WEBSOCKET_URL } from '../utils/env';

type WebSocketData = {
    cpuInfo: CpuInfo | null;
    ramInfo: RamInfo | null;
    ready?: boolean;
};

type WebSocketContextType = WebSocketData & {
    sendMessage: (message: RequestMessage) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
    undefined
);

export const WebSocketProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [cpuInfo, setCpuInfo] = useState<CpuInfo | null>(null);
    const [ramInfo, setRamInfo] = useState<RamInfo | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(WEBSOCKET_URL);
        setSocket(socket);

        socket.onopen = () => {
            console.log('WebSocket connection established to ', socket.url);
            setReady(true);
        };

        socket.onmessage = async (event) => {
            const response: ResponseMessage = ResponseMessage.deserializeBinary(
                new Uint8Array(await event.data.arrayBuffer())
            );

            if (response.has_cpu_info) {
                setCpuInfo(response.cpu_info);
            } else if (response.has_ram_info) {
                setRamInfo(response.ram_info);
            }
        };

        socket.onclose = (event) => {
            console.log('WebSocket closed:', event);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    const sendMessage = useCallback(
        (message: RequestMessage) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(message.serialize());
            }
        },
        [socket]
    );

    return (
        <WebSocketContext.Provider
            value={{ cpuInfo, ramInfo, ready, sendMessage }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
