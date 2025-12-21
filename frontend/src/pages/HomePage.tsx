import { useEffect, useState } from 'react';
import CPU from '../components/CPU';
import { fetchApi } from '../utils/fetchApi';

const HomePage = () => {
    const [refreshRate, setRefreshRate] = useState(1000);
    const { data, loading, error, refetch } = fetchApi<number[]>('cpus');

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
        <div className="flex flex-col gap-2 pb-4 border-2 rounded-md w-max border-secondary">
            <header className="flex justify-between p-2 px-4 rounded-t-md bg-secondary">
                <h1>CPU Usage</h1>
                <select
                    name="refreshRate"
                    id="refreshRateSelect"
                    className="px-4 rounded-md bg-primary"
                    value={refreshRate}
                    onChange={(e) => setRefreshRate(Number(e.target.value))}
                >
                    <option value="1000">1 Hz</option>
                    <option value="500">2 Hz</option>
                    <option value="200">5 Hz</option>
                    <option value="100">10 Hz</option>
                </select>
            </header>
            <div className="flex px-4">
                <ul className="grid grid-cols-6 gap-4">
                    {data.map((usage, index) => (
                        <CPU key={index + 1} id={index + 1} usage={usage} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HomePage;
