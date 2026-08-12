import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { GarageNavItem } from './GarageNavItem';
import { ArmoryNavItem } from './ArmoryNavItem';
import { UserNavMenu } from './UserNavMenu';

const NAV_LINKS = [
  { label: 'To-Do', path: '/todos' },
  { label: 'Hobbies', path: '/hobbies' },
  { label: 'Armory', path: '/armory' },
  { label: 'Garage', path: '/garage' },
  { label: 'Finances', path: '/purchases' },
];

export function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    setMobileOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Personal Tracker
        </Typography>

        {isAuthenticated && (
          <>
            {/* md and up: today's hover-dropdown nav, unchanged */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}>
              {NAV_LINKS.map((link) => {
                if (link.path === '/garage') return <GarageNavItem key={link.path} />;
                if (link.path === '/armory') return <ArmoryNavItem key={link.path} />;
                return (
                  <Button key={link.path} component={RouterLink} to={link.path} color="inherit">
                    {link.label}
                  </Button>
                );
              })}
              <UserNavMenu username={profile.username || user?.email} onLogout={handleLogout} />
            </Stack>

            {/* below md: hamburger opens a drawer instead — hover doesn't
                work on touch, so this also replaces the per-item Garage/
                Armory dropdowns with plain links to those pages */}
            <IconButton
              color="inherit"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
              <Box sx={{ width: 240 }} role="presentation">
                <List>
                  {NAV_LINKS.map((link) => (
                    <ListItemButton
                      key={link.path}
                      component={RouterLink}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                    >
                      <ListItemText primary={link.label} />
                    </ListItemButton>
                  ))}
                </List>
                <Divider />
                <List>
                  <ListItemButton component={RouterLink} to="/profile" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary={profile.username || user?.email} secondary="Profile" />
                  </ListItemButton>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Log out" />
                  </ListItemButton>
                </List>
              </Box>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
