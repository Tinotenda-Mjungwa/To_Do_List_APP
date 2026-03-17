import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, Grid, Divider, Switch, FormControlLabel } from '@mui/material';
import { User, Bell, Shield, Palette } from 'lucide-react';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
  });

  return (
    <Box maxWidth="md">
      <Typography variant="h4" sx={{ mb: 4 }}>Settings</Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, textAlign: 'center' }}>
            <Avatar 
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}
            >
              {user.name?.[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>{user.email}</Typography>
            <Button variant="outlined" size="small" sx={{ mt: 2 }}>Change Avatar</Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <User size={20} color="#6366f1" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Profile Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Full Name" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email Address" fullWidth value={formData.email} disabled />
                </Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Shield size={20} color="#6366f1" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Security</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Current Password" type="password" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="New Password" type="password" fullWidth />
                </Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 2 }}>Update Password</Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Bell size={20} color="#6366f1" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Notifications</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Email notifications for deadlines" />
                <FormControlLabel control={<Switch defaultChecked />} label="Daily summary report" />
                <FormControlLabel control={<Switch />} label="Browser push notifications" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
