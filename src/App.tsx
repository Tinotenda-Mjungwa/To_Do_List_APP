import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu as MenuIcon,
  User
} from 'lucide-react';

// Pages (to be created)
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import CalendarView from './pages/CalendarView';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#10b981', // Emerald
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const DRAWER_WIDTH = 240;

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Tasks', icon: <ListTodo size={20} />, path: '/tasks' },
    { text: 'Calendar', icon: <CalendarIcon size={20} />, path: '/calendar' },
    { text: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
          TaskFlow Pro
        </Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            sx={{ 
              mb: 1, 
              borderRadius: 2,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItem 
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2, 
            cursor: 'pointer',
            color: 'error.main',
            '&:hover': { bgcolor: 'error.light' }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogOut size={20} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            {menuItems.find(item => item.path === window.location.pathname)?.text || 'TaskFlow'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
              {user.name}
            </Typography>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user.name?.[0]}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}><User size={16} style={{ marginRight: 8 }} /> Profile</MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><LogOut size={16} style={{ marginRight: 8 }} /> Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><Layout><TaskList /></Layout></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><Layout><CalendarView /></Layout></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
