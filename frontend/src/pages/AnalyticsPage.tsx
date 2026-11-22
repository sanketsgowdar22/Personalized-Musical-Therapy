import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Clock, BarChart2 } from 'lucide-react';

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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading analytics data...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const icons = [Activity, TrendingUp, Clock, BarChart2];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.header variants={itemVariants} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Mood <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Track your emotional well-being and therapeutic progress over time.
        </p>
      </motion.header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Sessions', value: '42', delta: '+12%', color: 'var(--accent-primary)' },
          { label: 'Dominant Mood', value: 'Happy', delta: '+5%', color: 'var(--emotion-happy)' },
          { label: 'Therapy Minutes', value: '315', delta: '+45%', color: 'var(--emotion-surprise)' },
          { label: 'Emotional Variance', value: 'Low', delta: 'Stable', color: 'var(--emotion-fear)' },
        ].map((kpi, i) => {
          const Icon = icons[i];
          return (
            <motion.div variants={itemVariants} key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: kpi.color, filter: 'blur(40px)', opacity: 0.1, zIndex: 0 }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <Icon size={20} color={kpi.color} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                  {kpi.label}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{kpi.value}</span>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(139, 92, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  {kpi.delta}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Weekly Trend Chart */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Weekly Emotional Trend</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="happy" stroke={COLORS.happy} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-primary)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="sad" stroke={COLORS.sad} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-primary)' }} />
                <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Emotion Distribution</h3>
          <div style={{ height: '250px', width: '100%', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
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
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'white', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
            {mockPieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[item.name as keyof typeof COLORS] }} />
                <span style={{ textTransform: 'capitalize', fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </motion.div>
  );
};
