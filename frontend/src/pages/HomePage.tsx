import { useState } from 'react';
import CPUUsage from '../components/CPUUsage';
import RAMUsage from '../components/RAMUsage';

const HomePage = () => {
    const [refreshRate, setRefreshRate] = useState(1000);

    return (
        <main className="p-4">
            <header className="flex gap-2 mb-4">
                <h1>Refresh Rate</h1>
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
            <div className="grid grid-cols-2 gap-8 w-max">
                <CPUUsage refreshRate={refreshRate} />
                <RAMUsage refreshRate={refreshRate} />
            </div>
        </main>
    );
};

export default HomePage;
