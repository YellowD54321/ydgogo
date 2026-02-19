import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Alert, CircularProgress } from '@mui/material';
import { googleLoginOrRegister } from '@/services/api/authApi';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: googleLoginOrRegister,
    onSuccess: (data) => {
      auth.login(data.token, data.user);
      router.navigate({ to: '/' });
    },
  });

  const handleGoogleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      loginMutation.mutate(response.credential);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">ydgogo</h1>

      {loginMutation.isPending && <CircularProgress size={24} />}

      {loginMutation.isError && (
        <Alert severity="error" className="max-w-xs">
          登入失敗，請稍後再試
        </Alert>
      )}

      {!loginMutation.isPending && (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => loginMutation.reset()}
        />
      )}
    </div>
  );
}
