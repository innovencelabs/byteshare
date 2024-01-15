import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ByteShareSnackbar({open, handleClose, message, variant}) {
    const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);

    if (open) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, handleClose]);

  const handleSnackbarClose = () => {
    setIsOpen(false);
    handleClose();
  };

  return (
      <Snackbar open={isOpen} autoHideDuration={null} onClose={handleSnackbarClose}>
        <Alert severity={variant} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
  );
}