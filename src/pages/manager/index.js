import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();
  const { user } = useAuthContext();
  useEffect(() => {
    if(!user){
      router.push('/manager/login');
    }else{
      router.push('/manager/one');

    }
  });

  return null;
}
