import { useEffect } from 'react';
import { CpuInfo } from '../common/types';
import { useFetchApi } from '../utils/fetchApi';
import CPU from './CPU';

type Props = { refreshRate: number };

const CPUUsage = (props: Props) => {
    const { refreshRate } = props;

    const { data, loading, error, refetch } = useFetchApi<CpuInfo>('cpus');

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, refreshRate);
        return () => clearInterval(interval);
    }, [refreshRate, refetch]);

    return (
        <div className="flex flex-col gap-2 pb-4 border-2 rounded-md w-max border-secondary">
            <header className="flex justify-between p-2 px-4 rounded-t-md bg-secondary">
                <h1>CPU Usages</h1>
            </header>
            <div className="flex px-4">{getContent(loading, error, data)}</div>
        </div>
    );
};

function getContent(loading: boolean, error: string, data: CpuInfo | null) {
    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }
    if (!data) {
        return <div>No data available</div>;
    }
    return (
        <ul className="grid grid-cols-6 gap-4">
            {data.cpu_usages.map((usage, index) => (
                <div className="w-24 h-24" key={index}>
                    <CPU id={index + 1} usage={usage} />
                </div>
            ))}
        </ul>
    );
}

export default CPUUsage;
