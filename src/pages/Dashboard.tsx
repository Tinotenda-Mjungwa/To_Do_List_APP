import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Button, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, tasksData] = await Promise.all([
          api.analytics.getStats(),
          api.tasks.getAll()
        ]);
        setStats(analyticsData);
        setUpcomingTasks(tasksData.sortedByDueDate.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LinearProgress />;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'info';
      default: return 'warning';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} sx={{ borderRadius: 2 }}>
          New Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 3, color: 'primary.main' }}>
              <CheckCircle2 size={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats?.stats.find((s: any) => s.status === 'completed')?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 3, color: 'info.main' }}>
              <Clock size={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats?.stats.find((s: any) => s.status === 'in progress')?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 3, color: 'warning.main' }}>
              <AlertCircle size={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats?.stats.find((s: any) => s.status === 'pending')?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 3, color: 'secondary.main' }}>
              <Calendar size={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {upcomingTasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Upcoming</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Upcoming Deadlines</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {upcomingTasks.map((task) => (
              <Card key={task.id} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '12px !important' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{task.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip label={task.priority} size="small" color={task.priority === 'high' ? 'error' : 'default'} sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }} />
                      <Typography variant="caption" color="text.secondary">
                        Due: {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No date'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={task.status} size="small" color={getStatusColor(task.status)} variant="outlined" sx={{ textTransform: 'capitalize' }} />
                </CardContent>
              </Card>
            ))}
            {upcomingTasks.length === 0 && (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No upcoming tasks</Typography>
            )}
          </Box>
        </Grid>

        {/* Quick Actions / Categories */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Quick Stats</Typography>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="subtitle2" gutterBottom>Priority Distribution</Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.priorityStats.map((p: any) => (
                <Box key={p.priority} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{p.priority}</Typography>
                    <Typography variant="caption" fontWeight={600}>{p.count}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(p.count / (stats.stats.reduce((a: any, b: any) => a + b.count, 0) || 1)) * 100} 
                    color={p.priority === 'high' ? 'error' : p.priority === 'medium' ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
