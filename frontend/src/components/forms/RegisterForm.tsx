import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, PasswordInput, Button, Card, Title, Stack, Alert } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, registerError, isRegistering } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      user: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
  };

  return (
    <Card withBorder shadow="sm" padding="lg" role="main">
      <Title order={2} ta="center" mb="lg" id="register-title">Sign Up</Title>
      
      <form onSubmit={handleSubmit(onSubmit)} aria-labelledby="register-title">
        <Stack>
          <TextInput
            {...register('username')}
            label="Username"
            placeholder="Choose a username"
            error={errors.username?.message}
            required
            aria-describedby={errors.username ? 'username-error' : undefined}
            data-autofocus
          />

          <TextInput
            {...register('email')}
            type="email"
            label="Email"
            placeholder="Enter your email address"
            error={errors.email?.message}
            required
            aria-describedby={errors.email ? 'email-error' : undefined}
          />

          <PasswordInput
            {...register('password')}
            label="Password"
            placeholder="Create a password (minimum 6 characters)"
            error={errors.password?.message}
            required
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
            description="Password must be at least 6 characters long"
          />

          {registerError && (
            <Alert 
              color="red" 
              title="Registration Error"
              role="alert"
              aria-live="polite"
            >
              {registerError.message}
            </Alert>
          )}

          <Button
            type="submit"
            loading={isRegistering}
            color="green"
            fullWidth
            aria-describedby={registerError ? 'register-error' : undefined}
          >
            {isRegistering ? 'Creating account...' : 'Sign up'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}