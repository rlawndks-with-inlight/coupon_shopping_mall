// @mui
import { Stack, Button, Typography, Box } from '@mui/material';
// auth
import { useAuthContext } from '../auth/useAuthContext';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function NavDocs() {
  const { user } = useAuthContext();
  useEffect(()=>{
    console.log(user)
  },[])
  return (
    <Stack
      spacing={3}
      sx={{
        px: 5,
        pb: 5,
        mt: 10,
        width: 1,
        display: 'block',
        textAlign: 'center',
      }}
    >
      <Box component="img" src="/assets/illustrations/illustration_docs.svg" />

      <div>
        <Typography gutterBottom variant="subtitle1">
          {`hi, ${user?.name}`}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
          {`hello`}
        </Typography>
      </div>

      <Button variant="contained">{`nice day`}</Button>
    </Stack>
  );
}
