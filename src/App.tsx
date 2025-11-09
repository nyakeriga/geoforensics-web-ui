import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { initializeAuth } from './store/slices/authSlice';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ImageAnalysis from './pages/ImageAnalysis';
import AnalysisResults from './pages/AnalysisResults';
import CallLogs from './pages/CallLogs';
import Settings from './pages/Settings';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  const isAuthenticated = store.getState().auth.isAuthenticated;

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '24px' }}>
          <Switch>
            <Route path="/login" Component={Login} />
            {isAuthenticated ? (
              <>
                <Route path="/dashboard" Component={Dashboard} />
                <Route path="/analysis" Component={ImageAnalysis} />
                <Route path="/results/:id" Component={AnalysisResults} />
                <Route path="/call-logs" Component={CallLogs} />
                <Route path="/settings" Component={Settings} />
                <Redirect from="/" to="/dashboard" />
              </>
            ) : (
              <Redirect to="/login" />
            )}
            <Redirect from="*" to={isAuthenticated ? "/dashboard" : "/login"} />
          </Switch>
        </main>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;