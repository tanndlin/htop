import { useEffect } from 'react';
import { RamInfo } from '../common/types';
import { fetchApi } from '../utils/fetchApi';
import CPU from './CPU';

type Props = { refreshRate: number };

const RAMUsage = (props: Props) => {
    const { refreshRate } = props;

    const { data, loading, error, refetch } = fetchApi<RamInfo>('ram');

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, refreshRate);
        return () => clearInterval(interval);
    }, [refreshRate, refetch]);

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
        <div className="flex flex-col w-full gap-2 pb-4 border-2 rounded-md border-secondary">
            <header className="flex justify-between p-2 px-4 rounded-t-md bg-secondary">
                <h1>RAM Usage</h1>
                <span className="flex gap-1">
                    <p>Used {(data.used / Math.pow(1024, 3)).toFixed(2)} GB</p>
                    <p>/</p>
                    <p>{(data.total / Math.pow(1024, 3)).toFixed(2)} GB</p>
                </span>
            </header>
            <div className="flex h-full px-4">
                <CPU usage={(data.used / data.total) * 100} />
            </div>
        </div>
    );
};

export default RAMUsage;
