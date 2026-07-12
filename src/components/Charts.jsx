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
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.color || item.fill }}>
            {item.name}: <span style={{ fontWeight: '700' }}>{typeof item.value === 'number' && item.name.toLowerCase().includes('revenue') ? `$${item.value.toFixed(2)}` : item.value}</span>
          </p>
        ))}
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

// Custom Grid Heatmap (Hourly sales hotspots)
export const HeatmapWidget = ({ height = 240 }) => {
  // Days of the week vs Time slots (Morning, Midday, Afternoon, Evening)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['08:00 - 11:00', '11:00 - 14:00', '14:00 - 17:00', '17:00 - 20:00'];
  
  // Seed random-like activity values (0 - 4) for colors
  const values = [
    [1, 2, 4, 3], // Mon
    [2, 3, 2, 1], // Tue
    [3, 4, 3, 2], // Wed
    [2, 2, 4, 3], // Thu
    [4, 3, 3, 4], // Fri
    [1, 4, 4, 4], // Sat
    [0, 3, 4, 4]  // Sun
  ];

  const getColorClass = (val) => {
    switch (val) {
      case 4: return 'rgba(5, 150, 105, 0.9)'; // emerald dark
      case 3: return 'rgba(5, 150, 105, 0.6)';
      case 2: return 'rgba(5, 150, 105, 0.4)';
      case 1: return 'rgba(5, 150, 105, 0.2)';
      case 0:
      default: return 'var(--border-color)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', overflowX: 'auto', minHeight: height }}>
      <div style={{ display: 'flex', gap: '8px', minWidth: '480px', paddingBottom: '8px' }}>
        {/* Day labels column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '40px', justifyContent: 'space-around', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          {days.map(d => <span key={d}>{d}</span>)}
        </div>

        {/* Heatmap Blocks Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {values.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', gap: '4px', flex: 1 }}>
              {row.map((val, cIdx) => (
                <div
                  key={cIdx}
                  title={`Checkout density: Level ${val} for ${days[rIdx]} at ${hours[cIdx]}`}
                  style={{
                    flex: 1,
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: getColorClass(val),
                    transition: 'transform var(--transition-fast)',
                    cursor: 'help'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          ))}
          
          {/* Hour labels footer */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            {hours.map(h => (
              <span key={h} style={{ flex: 1, fontSize: '10px', textAlign: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend indicator */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '8px' }}>
        <span>Less busy</span>
        <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--border-color)', borderRadius: '2px' }} />
        <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(5, 150, 105, 0.2)', borderRadius: '2px' }} />
        <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(5, 150, 105, 0.4)', borderRadius: '2px' }} />
        <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(5, 150, 105, 0.6)', borderRadius: '2px' }} />
        <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(5, 150, 105, 0.9)', borderRadius: '2px' }} />
        <span>Very Busy</span>
      </div>
    </div>
  );
};
