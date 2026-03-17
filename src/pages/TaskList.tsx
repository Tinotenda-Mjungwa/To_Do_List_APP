import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Grid, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { Search, Plus, Filter, MoreVertical, Trash2, Edit2, Undo2 } from 'lucide-react';
import { api } from '../services/api';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/KanbanColumn';
import { TaskCard } from '../components/TaskCard';

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    category_id: '',
    recurring: 'none'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.tasks.getAll();
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      const results = await api.search(q);
      setTasks(results);
    } else if (q.length === 0) {
      fetchTasks();
    }
  };

  const handleOpenModal = (task: any = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date || '',
        priority: task.priority,
        status: task.status,
        category_id: task.category_id || '',
        recurring: task.recurring || 'none'
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
        category_id: '',
        recurring: 'none'
      });
    }
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await api.tasks.update(editingTask.id, formData);
        setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
      } else {
        await api.tasks.create(formData);
        setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      }
      setOpenModal(false);
      fetchTasks();
    } catch (err) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.tasks.delete(id);
        setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
        fetchTasks();
      } catch (err) {
        setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
      }
    }
  };

  const handleUndo = async () => {
    try {
      await api.tasks.undo();
      setSnackbar({ open: true, message: 'Action undone', severity: 'success' });
      fetchTasks();
    } catch (err) {
      setSnackbar({ open: true, message: 'Nothing to undo', severity: 'error' });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    if (active.data.current.status !== newStatus) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, status: newStatus };
        await api.tasks.update(taskId, updatedTask);
        fetchTasks();
      }
    }
  };

  const columns = ['pending', 'in progress', 'completed'];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Tasks</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Undo2 size={18} />} onClick={handleUndo}>
            Undo
          </Button>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            New Task
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search tasks by keyword..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: 3 }}
        />
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {columns.map(status => (
            <Grid size={{ xs: 12, md: 4 }} key={status}>
              <KanbanColumn 
                id={status} 
                title={status} 
                tasks={tasks.filter(t => t.status === status)} 
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      </DndContext>

      {/* Task Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Priority"
                  fullWidth
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Recurring"
                  fullWidth
                  value={formData.recurring || 'none'}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
