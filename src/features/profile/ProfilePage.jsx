import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    setUsername(profile.username);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
  }, [loading, profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await updateProfile({
        username: username.trim() || null,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSaved(true);
    } catch (err) {
      setSaved(false);
      setError(err.code === '23505' ? 'That username is already taken.' : err.message);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Button
        onClick={() => navigate(-1)}
        color="inherit"
        startIcon={<ArrowBackIcon fontSize="small" />}
        sx={{ display: 'inline-flex', mb: 4, pl: 0, color: 'text.secondary', fontSize: 14 }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight={500} align="center" gutterBottom sx={{ mb: 5 }}>
        Profile
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor="profile-email"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Email
            </Typography>
            <TextField id="profile-email" variant="standard" value={user?.email ?? ''} disabled fullWidth />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor="profile-username"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Username (optional — shown in the nav bar instead of your email)
            </Typography>
            <TextField
              id="profile-username"
              variant="standard"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setSaved(false);
              }}
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor="profile-first-name"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              First name
            </Typography>
            <TextField
              id="profile-first-name"
              variant="standard"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setSaved(false);
              }}
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor="profile-last-name"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Last name
            </Typography>
            <TextField
              id="profile-last-name"
              variant="standard"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setSaved(false);
              }}
              fullWidth
            />
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button type="submit" variant="outlined" disableElevation sx={{ borderRadius: 2, px: 4 }}>
              Save
            </Button>
            {saved && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Saved
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
}
