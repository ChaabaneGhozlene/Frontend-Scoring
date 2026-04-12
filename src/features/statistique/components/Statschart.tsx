import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ChartType } from '../Statistiquetypes';


interface StatsChartProps {
  data: any[];
  chartType: ChartType;
  xKey: string;
  yKey: string;
  title: string;
}


const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];


// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,.08)',
      fontSize: 12,
    }}>
      <p style={{ color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: entry.color ?? COLORS[i],
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ color: '#111', fontWeight: 600 }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};


const tickStyle = { fontSize: 11, fill: '#6b7280' };
const gridStyle = { stroke: '#f0f0f0' };


const StatsChart: React.FC<StatsChartProps> = ({ data, chartType, xKey, yKey }) => {
  if (!data.length) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 300, color: '#9ca3af', fontSize: 13,
      border: '1px dashed #e5e7eb', borderRadius: 8,
    }}>
      Aucune donnée disponible
    </div>
  );


  const renderChart = () => {
    switch (chartType) {
      case 'Line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
            <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: COLORS[0], stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        );


      case 'Pie':
        return (
          <PieChart>
            <Pie
              data={data} dataKey={yKey} nameKey={xKey}
              outerRadius={150} innerRadius={55}
              paddingAngle={2}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        );


      case 'Area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS[0]} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
            <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        );


      case 'Radar':
        return (
          <RadarChart data={data} outerRadius={90}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey={xKey}
              tick={({ x, y, payload }) => {
                const max = 12;
                const label = payload.value?.length > max
                  ? payload.value.slice(0, max) + '…'
                  : payload.value;
                return (
                  <text x={x} y={y} textAnchor="middle" fontSize={10} fill="#6b7280">
                    {label}
                  </text>
                );
              }}
            />
            <Radar dataKey={yKey} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} strokeWidth={2} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );


      default: // Bar
        return (
          <BarChart data={data} barCategoryGap="32%">
            <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
            <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f6fa' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };


  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '16px 8px 8px',
      height: '100%',
      minHeight: 420,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};


export default StatsChart;

