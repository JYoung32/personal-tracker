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
import { useCollection } from '../../hooks/useCollection';
import { TrackerNavItem } from './TrackerNavItem';
import { UserNavMenu } from './UserNavMenu';

const NAV_LINKS = [
  { label: 'To-Do', path: '/todos' },
  { label: 'Hobbies', path: '/hobbies' },
  { label: 'Trackers', path: '/trackers' },
];

// Rendered after every user-created Tracker's own nav entry (see
// trackerTypes.map below) rather than living in NAV_LINKS, so it always
// comes after Trackers and whatever tabs a user's Trackers add — not
// wherever it'd otherwise fall in the static list.
const FINANCES_LINK = { label: 'Finances', path: '/purchases' };

export function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { profile } = useProfile();
  // User-created Trackers (see src/features/trackers/) each get their own
  // nav entry, appended after the static NAV_LINKS — same low-risk "fetch
  // regardless of auth state" pattern useProfile() already uses here; RLS
  // just returns an empty list pre-login.
  const { items: trackerTypes } = useCollection('trackerTypes');
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
              {NAV_LINKS.map((link) => (
                <Button key={link.path} component={RouterLink} to={link.path} color="inherit">
                  {link.label}
                </Button>
              ))}
              {trackerTypes.map((type) => (
                <TrackerNavItem key={type.id} type={type} />
              ))}
              <Button component={RouterLink} to={FINANCES_LINK.path} color="inherit">
                {FINANCES_LINK.label}
              </Button>
              <UserNavMenu username={profile.username || user?.email} onLogout={handleLogout} />
            </Stack>

            {/* below md: hamburger opens a drawer instead — hover doesn't
                work on touch, so this also replaces the per-item Tracker
                dropdowns with plain links to those pages */}
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
                  {trackerTypes.map((type) => (
                    <ListItemButton
                      key={type.id}
                      component={RouterLink}
                      to={`/trackers/${type.id}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <ListItemText primary={type.name} />
                    </ListItemButton>
                  ))}
                  <ListItemButton
                    component={RouterLink}
                    to={FINANCES_LINK.path}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ListItemText primary={FINANCES_LINK.label} />
                  </ListItemButton>
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
