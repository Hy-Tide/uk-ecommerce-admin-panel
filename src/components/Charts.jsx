import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Custom Tooltip component
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '12px',
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ fontWeight: '600', marginBottom: '4px' }}>{label}</p>
        {payload.map((item, index) => {
          const nameStr = String(item?.name || 'Value');
          const valStr = typeof item?.value === 'number' && nameStr.toLowerCase().includes('revenue') ? `£${item.value.toFixed(2)}` : (item?.value ?? 0);
          return (
            <p key={index} style={{ color: item?.color || item?.fill || 'var(--primary)' }}>
              {nameStr}: <span style={{ fontWeight: '700' }}>{valStr}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const isAnimationEnabled = () => {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem('dashboard-has-animated') !== 'true';
};

// Line Chart
export const LineChartWidget = ({ data = [], xKey = 'name', yKey = 'value', height = 300 }) => {
  const activeAnim = isAnimationEnabled();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomChartTooltip />} />
        <Line isAnimationActive={activeAnim} type="monotone" dataKey={yKey} name={yKey.toUpperCase()} stroke="var(--primary)" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Bar Chart
export const BarChartWidget = ({ data = [], xKey = 'name', yKey = 'value', height = 300 }) => {
  const activeAnim = isAnimationEnabled();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomChartTooltip />} />
        <Bar isAnimationActive={activeAnim} dataKey={yKey} name={yKey.toUpperCase()} fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Area Chart
export const AreaChartWidget = ({ data = [], xKey = 'name', yKeys = ['value'], height = 300 }) => {
  const activeAnim = isAnimationEnabled();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomChartTooltip />} />
        {yKeys.map((key, i) => (
          <Area
            isAnimationActive={activeAnim}
            key={key}
            type="monotone"
            dataKey={key}
            name={key.toUpperCase()}
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrimary)"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Pie / Donut Chart
export const DonutChartWidget = ({ data = [], innerRadius = 60, outerRadius = 80, height = 300 }) => {
  const COLORS = ['#10b981', '#f97316', '#ef4444', '#f59e0b', '#64748b'];
  const activeAnim = isAnimationEnabled();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          isAnimationActive={activeAnim}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
