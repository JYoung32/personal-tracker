import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext';

/**
 * Landing page for the link emailed by requestPasswordReset. Supabase's
 * client detects the recovery token in the URL and establishes a session
 * automatically, so this only needs to collect the new password and call
 * updatePassword — no token handling here.
 */
export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await updatePassword(password);
      navigate('/overview', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Set a new password
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 6 characters"
            autoFocus
            fullWidth
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large">
            Update password
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
