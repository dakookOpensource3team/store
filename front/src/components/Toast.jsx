import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function Toast({ open, message, severity = 'success', onClose }) {
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <MuiAlert onClose={onClose} severity={severity} sx={{ width: '100%' }} variant="filled">
        {message}
      </MuiAlert>
    </Snackbar>
  );
} 