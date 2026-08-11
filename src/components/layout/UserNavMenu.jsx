import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

/**
 * The username/profile button, with a hover dropdown exposing "Log out" —
 * so the nav bar doesn't need a permanently-visible logout button. Clicking
 * the name or icon itself navigates to the profile page. Same plain
 * CSS :hover reveal as NavDropdownItem, for the same reason (a MUI Menu's
 * modal overlay causes hover flicker; see NavDropdownItem for details).
 */
export function UserNavMenu({ username, onLogout }) {
  return (
    <Box
      sx={{
        position: 'relative',
        ml: 2,
        '&:hover .user-dropdown, &:focus-within .user-dropdown': {
          display: 'block',
        },
      }}
    >
      <Button
        component={RouterLink}
        to="/profile"
        color="inherit"
        startIcon={<AccountCircleIcon fontSize="small" />}
        sx={{ opacity: 0.8, textTransform: 'none', fontSize: 14 }}
      >
        {username}
      </Button>
      <Paper
        className="user-dropdown"
        elevation={4}
        sx={{
          display: 'none',
          position: 'absolute',
          top: '100%',
          right: 0,
          minWidth: 140,
          zIndex: (theme) => theme.zIndex.appBar + 1,
        }}
      >
        <Button
          fullWidth
          color="inherit"
          onClick={onLogout}
          sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}
        >
          Log out
        </Button>
      </Paper>
    </Box>
  );
}
