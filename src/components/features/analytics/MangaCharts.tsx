'use client'

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area, LabelList
} from 'recharts'

const COLORS = ['#000000', '#fbbf24', '#94a3b8', '#e2e8f0', '#ffffff'] // Black, Yellow, Slate, Light Slate, White

// Custom Tooltip
const MangaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0_0_#000]">
                <p className="font-bold text-xs uppercase">{label || payload[0].name}</p>
                <p className="font-mono font-black text-sm">
                    {payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}
                </p>
            </div>
        )
    }
    return null
}

export function CategoryPie({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                    label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<MangaTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    )
}

export function TrendChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div>No data</div>

    // Format dates to short strings if needed
    const formatted = data.map(d => ({ ...d, shortDate: d.date.split('-').slice(1).join('/') }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formatted} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shortDate" stroke="#000" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis
                    stroke="#000"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => Number(val).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })}
                />
                <Tooltip content={<MangaTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export function MemberBar({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                    type="number"
                    stroke="#000"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => Number(val).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })}
                />
                <YAxis dataKey="name" type="category" width={80} stroke="#000" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip content={<MangaTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                <Bar dataKey="paid" name="Contributed" fill="#000" stackId="a" stroke="#000">
                    <LabelList
                        dataKey="paid"
                        position="right"
                        formatter={(val: any) => Number(val) > 0 ? Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 }) : ''}
                        style={{ fontSize: '10px', fontWeight: 'bold', fill: '#000' }}
                    />
                </Bar>
                <Bar dataKey="share" name="Consumed" fill="#fbbf24" stackId="b" stroke="#000">
                    <LabelList
                        dataKey="share"
                        position="right"
                        formatter={(val: any) => Number(val) > 0 ? Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 }) : ''}
                        style={{ fontSize: '10px', fontWeight: 'bold', fill: '#000' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
