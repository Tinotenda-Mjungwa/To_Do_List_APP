import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, Typography, Paper } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: any[];
  onEdit: (task: any) => void;
  onDelete: (id: number) => void;
}

export function KanbanColumn({ id, title, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
          {title} ({tasks.length})
        </Typography>
      </Box>
      <Paper
        ref={setNodeRef}
        sx={{
          flexGrow: 1,
          p: 2,
          bgcolor: 'rgba(0,0,0,0.02)',
          borderRadius: 4,
          minHeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: '2px dashed transparent',
          transition: 'all 0.2s ease',
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </Paper>
    </Box>
  );
}
