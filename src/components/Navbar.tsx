import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout() as any);
    handleClose();
    history.push('/login');
  };

  const handleProfile = () => {
    handleClose();
    history.push('/settings');
  };

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return null;
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => history.push('/dashboard')}
        >
          GeoForensics
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => history.push('/dashboard')}
              sx={{ mr: 2 }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              onClick={() => history.push('/analysis')}
              sx={{ mr: 2 }}
            >
              Analysis
            </Button>
            <Button
              color="inherit"
              onClick={() => history.push('/call-logs')}
              sx={{ mr: 2 }}
            >
              Call Logs
            </Button>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Typography variant="body2">
                  {user?.fullName || user?.username}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleProfile}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => history.push('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;