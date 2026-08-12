import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
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
        )}
      </Toolbar>
    </AppBar>
  );
}
