import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WebSocketProvider } from './contexts/WebsocketContext';
import './index.scss';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <WebSocketProvider>
            <App />
        </WebSocketProvider>
    </React.StrictMode>
);
