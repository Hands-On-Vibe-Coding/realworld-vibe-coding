import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, PasswordInput, Button, Card, Title, Stack, Alert } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login({
      user: {
        email: data.email,
        password: data.password,
      },
    });
  };

  return (
    <Card withBorder shadow="sm" padding="lg" role="main">
      <Title order={2} ta="center" mb="lg" id="login-title">Sign In</Title>
      
      <form onSubmit={handleSubmit(onSubmit)} aria-labelledby="login-title">
        <Stack>
          <TextInput
            {...register('email')}
            type="email"
            label="Email"
            placeholder="Enter your email address"
            error={errors.email?.message}
            required
            aria-describedby={errors.email ? 'email-error' : undefined}
            data-autofocus
          />

          <PasswordInput
            {...register('password')}
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            required
            aria-describedby={errors.password ? 'password-error' : undefined}
          />

          {loginError && (
            <Alert 
              color="red" 
              title="Login Error"
              role="alert"
              aria-live="polite"
            >
              {loginError.message}
            </Alert>
          )}

          <Button
            type="submit"
            loading={isLoggingIn}
            fullWidth
            aria-describedby={loginError ? 'login-error' : undefined}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}