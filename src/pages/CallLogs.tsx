import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, Upload, Phone, LocationOn } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchCallLogs, uploadCallLogs } from '../store/slices/analysisSlice';

const CallLogs: React.FC = () => {
  const dispatch = useDispatch();
  const { callLogs, loading, error } = useSelector((state: RootState) => state.analysis);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchCallLogs() as any);
  }, [dispatch]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Parse CSV file (simplified - in real app, use a proper CSV parser)
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');

      const callLogData = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          phoneNumber: values[0] || '',
          callType: values[1] || 'unknown',
          callStart: values[2] || new Date().toISOString(),
          callEnd: values[3] || null,
          durationSeconds: parseInt(values[4]) || 0,
          locationLat: values[5] ? parseFloat(values[5]) : null,
          locationLon: values[6] ? parseFloat(values[6]) : null,
          locationAccuracy: values[7] ? parseFloat(values[7]) : null,
        };
      }).filter(log => log.phoneNumber);

      await dispatch(uploadCallLogs(callLogData) as any);
      setSelectedFile(null);

      // Refresh the list
      dispatch(fetchCallLogs() as any);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const filteredLogs = callLogs.filter(log =>
    log.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.callType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCallTypeColor = (callType: string) => {
    switch (callType) {
      case 'incoming':
        return 'success';
      case 'outgoing':
        return 'primary';
      case 'missed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Call Logs
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage call log data for temporal correlation with image analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Call Logs
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file with call log data. Format: phone_number,call_type,call_start,call_end,duration_seconds,lat,lon,accuracy
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
            >
              Select CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFile && (
              <Typography variant="body2">
                Selected: {selectedFile.name}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              startIcon={<Upload />}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Stats */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by phone number or call type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<Phone />}
            label={`${callLogs.length} Total Calls`}
            variant="outlined"
          />
          <Chip
            icon={<LocationOn />}
            label={`${callLogs.filter(log => log.locationLat && log.locationLon).length} With Location`}
            variant="outlined"
            color="primary"
          />
        </Box>
      </Box>

      {/* Call Logs Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Call Type</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Accuracy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.callType}
                        color={getCallTypeColor(log.callType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.callStart).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.durationSeconds ? `${Math.floor(log.durationSeconds / 60)}:${(log.durationSeconds % 60).toString().padStart(2, '0')}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.locationLat && log.locationLon ? (
                        <Typography variant="body2" fontFamily="monospace">
                          {log.locationLat.toFixed(4)}, {log.locationLon.toFixed(4)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No location
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.locationAccuracy ? (
                        <Typography variant="body2">
                          ±{log.locationAccuracy.toFixed(0)}m
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'No call logs match your search' : 'No call logs available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How Call Logs Help Analysis
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Call log data provides temporal context for image geolocation:
          </Typography>

          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <li>
              <Typography variant="body2">
                <strong>Temporal Correlation:</strong> Match call timestamps with image capture times
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Location Context:</strong> GPS data from calls during image capture periods
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Pattern Analysis:</strong> Identify location patterns from call activity
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Evidence Validation:</strong> Corroborate image geolocation with call locations
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CallLogs;