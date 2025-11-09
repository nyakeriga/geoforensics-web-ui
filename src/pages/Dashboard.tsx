import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
} from '@mui/material';
import {
  Image as ImageIcon,
  Analytics as AnalyticsIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchAnalysisSummary } from '../store/slices/analysisSlice';

const Dashboard: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { analysisSummary, loading, error } = useSelector(
    (state: RootState) => state.analysis
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAnalysisSummary() as any);
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Upload Image',
      description: 'Analyze a new image for geolocation and forensics',
      icon: <ImageIcon />,
      action: () => history.push('/analysis'),
      color: 'primary' as const,
    },
    {
      title: 'View Results',
      description: 'Browse previous analysis results',
      icon: <AnalyticsIcon />,
      action: () => history.push('/results'),
      color: 'secondary' as const,
    },
    {
      title: 'Call Logs',
      description: 'Manage call tracking data',
      icon: <PhoneIcon />,
      action: () => history.push('/call-logs'),
      color: 'success' as const,
    },
    {
      title: 'Settings',
      description: 'Configure your account and preferences',
      icon: <LocationIcon />,
      action: () => history.push('/settings'),
      color: 'info' as const,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.username}!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        GeoForensics Dashboard - Advanced digital image forensics and geolocation analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        color: `${action.color}.main`,
                        fontSize: 48,
                        mb: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Statistics */}
        {analysisSummary && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Analysis Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Total Images
                    </Typography>
                    <Typography variant="h4">
                      {analysisSummary.totalImages}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main">
                      Processed
                    </Typography>
                    <Typography variant="h4">
                      {analysisSummary.processedImages}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="warning.main">
                      Pending
                    </Typography>
                    <Typography variant="h4">
                      {analysisSummary.pendingAnalyses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="error.main">
                      Failed
                    </Typography>
                    <Typography variant="h4">
                      {analysisSummary.failedAnalyses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="API Status"
                    secondary="All systems operational"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Online" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="ML Services"
                    secondary="AI detection and geolocation active"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Active" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Database"
                    secondary="PostgreSQL connection healthy"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Healthy" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Storage"
                    secondary="S3-compatible storage available"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Available" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Analyses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Image analysis completed"
                    secondary="Analysis #1234 - High confidence location found"
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" color="text.secondary">
                      2 min ago
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Call log uploaded"
                    secondary="15 new call records processed"
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" color="text.secondary">
                      1 hour ago
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="AI detection model updated"
                    secondary="Improved accuracy for diffusion models"
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" color="text.secondary">
                      2 hours ago
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth>
                  View All Activity
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;