import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'To-Do', path: '/todos' },
  { label: 'Hobbies', path: '/hobbies' },
  { label: 'Purchase Orders', path: '/purchases' },
];

export function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Personal Tracker
        </Typography>

        {isAuthenticated && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Button key={link.path} component={RouterLink} to={link.path} color="inherit">
                {link.label}
              </Button>
            ))}
            <Typography variant="body2" sx={{ ml: 2, opacity: 0.8 }}>
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Log out
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
