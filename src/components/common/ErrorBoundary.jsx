import { Component } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

/**
 * Catches a rendering error thrown by whatever it wraps (App.jsx wraps
 * this around <Routes>, outside <NavBar>) so a bug on one page shows a
 * fallback instead of a blank white app, and the nav bar stays usable to
 * get somewhere else. Error boundaries have to be class components — React
 * has no hook equivalent for getDerivedStateFromError/componentDidCatch.
 *
 * App.jsx passes `key={location.pathname}` on this component (not a plain
 * prop) — changing a `key` remounts the whole subtree, which is React's
 * own recommended way to reset a boundary's state, so navigating away from
 * a crashed page gives the next one a clean try automatically.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in a routed page:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            This page hit an unexpected error. Try another page from the nav
            bar above, or reload.
          </Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}
