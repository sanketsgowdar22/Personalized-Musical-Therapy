import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = {
  happy: '#F59E0B',
  sad: '#3B82F6',
  angry: '#EF4444',
  surprise: '#8B5CF6',
  fear: '#10B981',
  disgust: '#64748B',
  neutral: '#94A3B8'
};

const mockData = [
  { name: 'Mon', happy: 4, sad: 1, angry: 0, neutral: 2 },
  { name: 'Tue', happy: 3, sad: 2, angry: 1, neutral: 1 },
  { name: 'Wed', happy: 5, sad: 0, angry: 0, neutral: 3 },
  { name: 'Thu', happy: 2, sad: 4, angry: 1, neutral: 1 },
  { name: 'Fri', happy: 6, sad: 1, angry: 0, neutral: 2 },
  { name: 'Sat', happy: 7, sad: 0, angry: 0, neutral: 4 },
  { name: 'Sun', happy: 8, sad: 1, angry: 0, neutral: 2 },
];

const mockPieData = [
  { name: 'happy', value: 35 },
  { name: 'sad', value: 9 },
  { name: 'angry', value: 2 },
  { name: 'neutral', value: 15 },
  { name: 'fear', value: 1 },
];

export const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, fetch this from `/api/v1/analytics`
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>Loading Analytics...</div>;
  }

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
          Mood Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Track your emotional well-being over time.
        </p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Total Sessions', value: '42', delta: '+12%' },
          { label: 'Dominant Mood', value: 'Happy', delta: '+5%' },
          { label: 'Therapy Minutes', value: '315', delta: '+45%' },
          { label: 'Emotional Variance', value: 'Low', delta: 'Stable' },
        ].map((kpi, i) => (
          <div key={i} className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
              {kpi.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>{kpi.value}</span>
              <span style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{kpi.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Weekly Trend Chart */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-6)' }}>Weekly Emotional Trend</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="happy" stroke={COLORS.happy} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="sad" stroke={COLORS.sad} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-6)' }}>Emotion Distribution</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.neutral} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            {mockPieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS[item.name as keyof typeof COLORS] }} />
                <span style={{ textTransform: 'capitalize', fontSize: 'var(--font-size-sm)' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
