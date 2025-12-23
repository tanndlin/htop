import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebsocketContext';
import { api } from '../proto/api';
import CPU from './CPU';
import InfoType = api.InfoType;
import RequestMessage = api.RequestMessage;

type Props = { refreshRate: number };

const CPUUsage = (props: Props) => {
    const { refreshRate } = props;

    const { cpuInfo, ready, sendMessage } = useWebSocket();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (cpuInfo) {
            setLoading(false);
        }
    }, [cpuInfo]);

    useEffect(() => {
        if (!ready) {
            return;
        }

        sendMessage(new RequestMessage({ info_type: InfoType.CPU }));
        const interval = setInterval(() => {
            sendMessage(new RequestMessage({ info_type: InfoType.CPU }));
        }, refreshRate);
        return () => clearInterval(interval);
    }, [refreshRate, ready, sendMessage]);

    if (!cpuInfo) {
        return <></>;
    }

    return (
        <div className="flex flex-col gap-2 pb-4 border-2 rounded-md w-max border-secondary">
            <header className="flex justify-between p-2 px-4 rounded-t-md bg-secondary">
                <h1>CPU Usages</h1>
            </header>
            <div className="flex px-4">
                {loading && <p>Loading CPU usages...</p>}
                {!loading && cpuInfo && (
                    <ul className="grid grid-cols-6 gap-4">
                        {cpuInfo.cpu_usages.map((usage, index) => (
                            <div className="w-24 h-24" key={index}>
                                <CPU id={index + 1} usage={usage} />
                            </div>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CPUUsage;
