import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Chip, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { api } from '../services/api';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.tasks.getAll();
        setTasks(data.tasks);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), day));
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Calendar</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
          <Typography variant="h6" sx={{ minWidth: 150, textAlign: 'center', fontWeight: 700 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Grid container columns={7} sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid size={1} key={day} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{day}</Typography>
            </Grid>
          ))}
        </Grid>
        
        <Grid container columns={7}>
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <Grid 
                size={1} 
                key={idx} 
                sx={{ 
                  height: 120, 
                  borderRight: '1px solid', 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  p: 1,
                  bgcolor: isCurrentMonth ? 'background.paper' : 'rgba(0,0,0,0.02)',
                  position: 'relative',
                  '&:nth-of-type(7n)': { borderRight: 'none' }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? 'primary.main' : isCurrentMonth ? 'text.primary' : 'text.disabled',
                    display: 'inline-block',
                    width: 24,
                    height: 24,
                    textAlign: 'center',
                    lineHeight: '24px',
                    borderRadius: '50%',
                    bgcolor: isToday ? 'primary.light' : 'transparent'
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflow: 'hidden' }}>
                  {dayTasks.map(task => (
                    <Tooltip key={task.id} title={task.title}>
                      <Chip 
                        label={task.title} 
                        size="small" 
                        sx={{ 
                          height: 18, 
                          fontSize: '0.65rem', 
                          bgcolor: task.priority === 'high' ? 'error.light' : 'primary.light',
                          color: task.priority === 'high' ? 'error.main' : 'primary.main',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '& .MuiChip-label': { px: 0.5 }
                        }} 
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}
