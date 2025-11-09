import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    fullName: user?.fullName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    analysisComplete: true,
    securityAlerts: true,
    weeklyReports: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [name]: event.target.checked,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(updateProfile({
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
      }) as any);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      // Note: Password change would need a separate API endpoint
      // For now, we'll just show a success message
      alert('Password change functionality would be implemented with a separate API endpoint');
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Account Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3 }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.fullName || user?.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleProfileUpdate}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>

              <Box component="form" onSubmit={handlePasswordChange}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={handleNotificationChange('emailNotifications')}
                    />
                  }
                  label="Email notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.analysisComplete}
                      onChange={handleNotificationChange('analysisComplete')}
                    />
                  }
                  label="Analysis completion notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.securityAlerts}
                      onChange={handleNotificationChange('securityAlerts')}
                    />
                  }
                  label="Security alerts"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.weeklyReports}
                      onChange={handleNotificationChange('weeklyReports')}
                    />
                  }
                  label="Weekly activity reports"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography>
                    {user?.isSuperuser ? 'Administrator' : 'Standard User'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Typography>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    API Access
                  </Typography>
                  <Typography>
                    Enabled
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" color="error">
                  Deactivate Account
                </Button>
                <Button variant="outlined">
                  Download Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;