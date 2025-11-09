import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../store';
import { uploadImage, analyzeImage } from '../store/slices/analysisSlice';

const ImageAnalysis: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { uploading, analyzing, error } = useSelector((state: RootState) => state.analysis);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.bmp']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    try {
      const result = await dispatch(uploadImage(uploadedFile) as any);
      if (result.payload) {
        setUploadedImage(result.payload);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    try {
      const result = await dispatch(analyzeImage(uploadedImage.id) as any);
      if (result.payload) {
        setAnalysisResult(result.payload);
        // Redirect to results page after a short delay
        setTimeout(() => {
          history.push(`/results/${result.payload.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Image Analysis
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload an image for comprehensive forensic analysis including geolocation, AI detection, and metadata extraction.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Image
              </Typography>

              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <Box>
                    <Typography variant="h6" color="primary">
                      {uploadedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      or click to select a file
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Supported formats: JPEG, PNG, TIFF, BMP (max 50MB)
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!uploadedFile || uploading}
                  fullWidth
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>

                {uploadedImage && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    fullWidth
                  >
                    {analyzing ? 'Analyzing...' : 'Start Analysis'}
                  </Button>
                )}
              </Box>

              {(uploading || analyzing) && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {uploading ? 'Uploading image...' : 'Analyzing image...'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Preview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Preview
              </Typography>

              {uploadedImage && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded Image Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Filename" secondary={uploadedImage.original_filename} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Size" secondary={`${(uploadedImage.file_size / 1024 / 1024).toFixed(2)} MB`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Type" secondary={uploadedImage.mime_type} />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={uploadedImage.is_processed ? 'Processed' : 'Pending'}
                            color={uploadedImage.is_processed ? 'success' : 'warning'}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              )}

              {analysisResult && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Analysis Results
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Status" secondary={analysisResult.status} />
                      <ListItemSecondaryAction>
                        <Chip
                          label={analysisResult.status}
                          color={
                            analysisResult.status === 'completed' ? 'success' :
                            analysisResult.status === 'processing' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {analysisResult.confidence_score && (
                      <ListItem>
                        <ListItemText
                          primary="Confidence Score"
                          secondary={`${(analysisResult.confidence_score * 100).toFixed(1)}%`}
                        />
                      </ListItem>
                    )}
                    {analysisResult.estimated_location && (
                      <ListItem>
                        <ListItemText
                          primary="Estimated Location"
                          secondary={`${analysisResult.estimated_location.latitude.toFixed(4)}, ${analysisResult.estimated_location.longitude.toFixed(4)}`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {!uploadedImage && !analysisResult && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Upload an image to see analysis preview
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Types */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Types Included
              </Typography>

              <Grid container spacing={2}>
                {[
                  { name: 'Metadata Extraction', desc: 'EXIF, IPTC, XMP data parsing' },
                  { name: 'GPS Analysis', desc: 'Location data extraction and validation' },
                  { name: 'AI Detection', desc: 'Deepfake and manipulation detection' },
                  { name: 'Visual Geolocation', desc: 'Landmark recognition and scene analysis' },
                  { name: 'Device Fingerprinting', desc: 'Camera PRNU pattern analysis' },
                  { name: 'Reverse Image Search', desc: 'Multi-engine similarity search' },
                ].map((type, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {type.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImageAnalysis;