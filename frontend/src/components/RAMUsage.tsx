import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebsocketContext';
import { api } from '../proto/api';
import CPU from './CPU';
import InfoType = api.InfoType;
import RequestMessage = api.RequestMessage;

type Props = { refreshRate: number };

const RAMUsage = (props: Props) => {
    const { refreshRate } = props;

    const { ramInfo, sendMessage, ready } = useWebSocket();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (ramInfo) {
            setLoading(false);
        }
    }, [ramInfo]);

    useEffect(() => {
        if (!ready) {
            return;
        }

        sendMessage(new RequestMessage({ info_type: InfoType.RAM }));
        const interval = setInterval(() => {
            sendMessage(new RequestMessage({ info_type: InfoType.RAM }));
        }, refreshRate);
        return () => clearInterval(interval);
    }, [refreshRate, ready, sendMessage]);

    if (!ramInfo) {
        return <></>;
    }

    return (
        <div className="flex flex-col w-full gap-2 pb-4 border-2 rounded-md border-secondary">
            <header className="flex justify-between p-2 px-4 rounded-t-md bg-secondary">
                <h1>RAM Usage</h1>
                <span className="flex gap-1">
                    <p>
                        Used
                        {((ramInfo?.used ?? 0) / Math.pow(1024, 3)).toFixed(
                            2
                        )}{' '}
                        GB
                    </p>
                    <p>/</p>
                    <p>
                        {((ramInfo?.total ?? 0) / Math.pow(1024, 3)).toFixed(2)}{' '}
                        GB
                    </p>
                </span>
            </header>
            <div className="flex h-full px-4">
                {loading && <p>Loading RAM usage...</p>}
                {!loading && ramInfo && (
                    <CPU usage={(ramInfo.used / ramInfo.total) * 100} />
                )}
            </div>
        </div>
    );
};

export default RAMUsage;
