import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVertical, Calendar, Tag, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    data: { status: task.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const getPriorityColor = (p: string) => {
    switch (p.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{ 
        borderRadius: 3, 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip 
            label={task.priority} 
            size="small" 
            color={getPriorityColor(task.priority)} 
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }} 
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {task.recurring && task.recurring !== 'none' && (
              <RefreshCw size={14} color="#6366f1" style={{ marginRight: 4 }} />
            )}
            <IconButton size="small" onClick={handleMenu}>
              <MoreVertical size={16} />
            </IconButton>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={(e) => { handleClose(e); onEdit(task); }}>Edit</MenuItem>
            <MenuItem onClick={(e) => { handleClose(e); onDelete(task.id); }} sx={{ color: 'error.main' }}>Delete</MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2 }}>
          {task.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {task.due_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Calendar size={14} />
              <Typography variant="caption">{format(new Date(task.due_date), 'MMM d')}</Typography>
            </Box>
          )}
          {task.category_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: task.category_color || 'primary.main' }}>
              <Tag size={14} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{task.category_name}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
