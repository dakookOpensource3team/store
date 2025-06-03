import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#a259e6', // 연보라/퍼플
      contrastText: '#fff',
    },
    secondary: {
      main: '#b07cff',
      contrastText: '#fff',
    },
    background: {
      default: '#f9f9f9',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#888',
    },
    warning: {
      main: '#ffb300',
    },
    info: {
      main: '#6dd5ed',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Noto Sans KR, Pretendard, Arial, sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      borderRadius: 12,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px 0 rgba(162,89,230,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme; 