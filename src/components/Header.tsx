import { Link, useRouter } from '@tanstack/react-router';
import { Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    router.navigate({ to: '/' });
  };

  return (
    <header className='flex justify-between items-center px-4 py-2 bg-neutral-950'>
      <Link to='/' className='text-lg font-bold text-white no-underline'>
        ydgogo
      </Link>

      {auth.isAuthenticated ? (
        <div className='flex gap-3 items-center'>
          <Link
            to='/records'
            className='text-sm no-underline text-neutral-300 hover:text-white'
          >
            我的棋譜
          </Link>
          <span className='text-sm text-neutral-300'>{auth.user?.email}</span>
          <Button
            size='small'
            variant='outlined'
            color='inherit'
            onClick={handleLogout}
          >
            登出
          </Button>
        </div>
      ) : (
        <Link to='/login'>
          <Button size='small' variant='outlined' color='inherit'>
            登入
          </Button>
        </Link>
      )}
    </header>
  );
}
