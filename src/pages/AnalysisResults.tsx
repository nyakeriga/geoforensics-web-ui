import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, LocationOn, Image, Analytics, Phone } from '@mui/icons-material';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchAnalysisResult } from '../store/slices/analysisSlice';

const AnalysisResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const { currentAnalysis, loading, error } = useSelector((state: RootState) => state.analysis);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAnalysisResult(parseInt(id)) as any);
    }
  }, [id, dispatch]);

  const handleRefresh = async () => {
    if (!id) return;

    setRefreshing(true);
    try {
      await dispatch(fetchAnalysisResult(parseInt(id)) as any);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'exif':
        return <Image />;
      case 'visual':
        return <LocationOn />;
      case 'ai_detect':
        return <Analytics />;
      case 'fingerprint':
        return <Phone />;
      default:
        return <Analytics />;
    }
  };

  if (loading && !currentAnalysis) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading analysis results...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => history.push('/analysis')}>
            Back to Analysis
          </Button>
        </Box>
      </Container>
    );
  }

  if (!currentAnalysis) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Analysis not found
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => history.push('/analysis')}>
            Back to Analysis
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analysis Results
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="outlined" onClick={() => history.push('/analysis')}>
            New Analysis
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Status Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Analysis Overview
                </Typography>
                <Chip
                  label={currentAnalysis.status}
                  color={getStatusColor(currentAnalysis.status)}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Analysis ID
                  </Typography>
                  <Typography variant="body1">
                    {currentAnalysis.id}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Started At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentAnalysis.startedAt).toLocaleString()}
                  </Typography>
                </Grid>

                {currentAnalysis.completedAt && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Completed At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentAnalysis.completedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                )}

                {currentAnalysis.processingTimeSeconds && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Processing Time
                    </Typography>
                    <Typography variant="body1">
                      {currentAnalysis.processingTimeSeconds.toFixed(1)}s
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Results */}
        {currentAnalysis.estimatedLocation && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estimated Location
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary">
                    {currentAnalysis.estimatedLocation.latitude.toFixed(6)}, {currentAnalysis.estimatedLocation.longitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confidence: {(currentAnalysis.estimatedLocation.confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  fullWidth
                >
                  View on Map
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Confidence Score */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Confidence
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {(currentAnalysis.confidenceScore * 100).toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={currentAnalysis.confidenceScore * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Based on analysis of multiple evidence sources
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Evidence Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evidence Analysis
              </Typography>

              <List>
                {currentAnalysis.evidenceItems.map((evidence, index) => (
                  <ListItem key={index} divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {getEvidenceIcon(evidence.type)}
                    </Box>
                    <ListItemText
                      primary={evidence.source}
                      secondary={evidence.explanation}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={`${(evidence.confidence * 100).toFixed(1)}%`}
                        color={evidence.confidence > 0.8 ? 'success' : evidence.confidence > 0.6 ? 'warning' : 'error'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Results */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Analysis Results
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Metadata Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    EXIF data, camera information, and file properties extracted from the image.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>AI Detection Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Analysis for artificially generated or manipulated content using multiple detection methods.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Visual Geolocation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Landmark recognition and scene analysis for location estimation.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Device Fingerprinting</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Camera sensor pattern analysis for device identification.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Reverse Image Search</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Multi-engine search for similar images and temporal analysis.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        {/* Human Explanation */}
        {currentAnalysis.humanReadableExplanation && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Summary
                </Typography>
                <Typography variant="body1">
                  {currentAnalysis.humanReadableExplanation}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default AnalysisResults;