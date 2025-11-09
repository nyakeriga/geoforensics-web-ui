import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Image {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  is_processed: boolean;
  processing_started_at?: string;
  processing_completed_at?: string;
}

interface AnalysisResult {
  id: number;
  image_id: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  estimatedLocation?: {
    latitude: number;
    longitude: number;
    confidence: number;
  };
  confidenceScore?: number;
  evidenceItems: Array<{
    type: string;
    source: string;
    confidence: number;
    details: any;
    explanation: string;
  }>;
  humanReadableExplanation?: string;
  processingTimeSeconds?: number;
}

interface CallLog {
  id: number;
  phoneNumber: string;
  callType: string;
  callStart: string;
  callEnd?: string;
  durationSeconds?: number;
  locationLat?: number;
  locationLon?: number;
  locationAccuracy?: number;
}

interface AnalysisSummary {
  totalImages: number;
  processedImages: number;
  pendingAnalyses: number;
  failedAnalyses: number;
  averageProcessingTime?: number;
  successRate: number;
}

interface AnalysisState {
  images: Image[];
  currentAnalysis: AnalysisResult | null;
  callLogs: CallLog[];
  analysisSummary: AnalysisSummary | null;
  uploading: boolean;
  analyzing: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  images: [],
  currentAnalysis: null,
  callLogs: [],
  analysisSummary: null,
  uploading: false,
  analyzing: false,
  loading: false,
  error: null,
};

// Async thunks
export const uploadImage = createAsyncThunk(
  'analysis/uploadImage',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/v1/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Upload failed');
    }
  }
);

export const analyzeImage = createAsyncThunk(
  'analysis/analyzeImage',
  async (imageId: number, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/analyses/analyze', {
        image_id: imageId,
        analysis_types: ['full'],
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Analysis failed');
    }
  }
);

export const fetchAnalysisResult = createAsyncThunk(
  'analysis/fetchAnalysisResult',
  async (analysisId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v1/analyses/${analysisId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch analysis');
    }
  }
);

export const fetchAnalysisSummary = createAsyncThunk(
  'analysis/fetchAnalysisSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/analyses/summary');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch summary');
    }
  }
);

export const fetchCallLogs = createAsyncThunk(
  'analysis/fetchCallLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/call-logs');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch call logs');
    }
  }
);

export const uploadCallLogs = createAsyncThunk(
  'analysis/uploadCallLogs',
  async (callLogData: CallLog[], { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/call-logs/upload', {
        entries: callLogData,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Upload failed');
    }
  }
);

// Slice
const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAnalysis: (state, action: PayloadAction<AnalysisResult | null>) => {
      state.currentAnalysis = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action: PayloadAction<Image>) => {
        state.uploading = false;
        state.images.unshift(action.payload);
        state.error = null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })

      // Analyze Image
      .addCase(analyzeImage.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(analyzeImage.fulfilled, (state, action: PayloadAction<AnalysisResult>) => {
        state.analyzing = false;
        state.currentAnalysis = action.payload;
        state.error = null;
      })
      .addCase(analyzeImage.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload as string;
      })

      // Fetch Analysis Result
      .addCase(fetchAnalysisResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisResult.fulfilled, (state, action: PayloadAction<AnalysisResult>) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalysisResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Analysis Summary
      .addCase(fetchAnalysisSummary.fulfilled, (state, action: PayloadAction<AnalysisSummary>) => {
        state.analysisSummary = action.payload;
      })

      // Fetch Call Logs
      .addCase(fetchCallLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCallLogs.fulfilled, (state, action: PayloadAction<CallLog[]>) => {
        state.loading = false;
        state.callLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchCallLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload Call Logs
      .addCase(uploadCallLogs.fulfilled, (state, action: PayloadAction<any>) => {
        // Refresh call logs after upload
        // This would typically trigger a refetch
      });
  },
});

export const { clearError, setCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;