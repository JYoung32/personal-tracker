import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f6b52', // muted green — adjust freely, this is just a starting point
    },
    secondary: {
      main: '#8a6d3b',
    },
  },
  shape: {
    borderRadius: 10,
  },
});
