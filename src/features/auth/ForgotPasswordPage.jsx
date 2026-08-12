import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Reset your password
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            If an account exists for that email, a reset link is on its way — check your inbox.
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              fullWidth
            />
            <Button type="submit" variant="contained" size="large">
              Send reset link
            </Button>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          <RouterLink to="/login" style={{ color: 'inherit' }}>
            Back to log in
          </RouterLink>
        </Typography>
      </Paper>
    </Box>
  );
}
