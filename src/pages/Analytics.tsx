import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, LinearProgress } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await api.analytics.getStats();
        setData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LinearProgress />;

  const statusData = data?.stats.map((s: any) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count
  }));

  const priorityData = data?.priorityStats.map((p: any) => ({
    name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
    count: p.count
  }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Analytics Dashboard</Typography>

      <Grid container spacing={3}>
        {/* Task Status Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Task Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Priority Breakdown</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Productivity Trend (Mock Data for Demo) */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Productivity Trend (Last 7 Days)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={[
                { day: 'Mon', completed: 4, pending: 2 },
                { day: 'Tue', completed: 3, pending: 4 },
                { day: 'Wed', completed: 6, pending: 1 },
                { day: 'Thu', completed: 2, pending: 5 },
                { day: 'Fri', completed: 8, pending: 2 },
                { day: 'Sat', completed: 5, pending: 0 },
                { day: 'Sun', completed: 3, pending: 1 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
