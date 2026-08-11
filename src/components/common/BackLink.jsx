import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Small "< back" link used at the top of nested detail pages.
 */
export function BackLink({ to, label }) {
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="hover"
      color="text.secondary"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 4, fontSize: 14 }}
    >
      <ArrowBackIcon fontSize="inherit" />
      {label}
    </Link>
  );
}
