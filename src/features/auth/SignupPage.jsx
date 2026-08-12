import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { needsEmailConfirmation } = await signup(email, password);
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate('/overview', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Create an account
        </Typography>

        {confirmationSent ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Check your email to confirm your account, then log in.
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
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="At least 6 characters"
              fullWidth
            />
            <Button type="submit" variant="contained" size="large">
              Sign up
            </Button>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <RouterLink to="/login" style={{ color: 'inherit' }}>
            Log in
          </RouterLink>
        </Typography>
      </Paper>
    </Box>
  );
}
