import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/schemas';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.login({
        user: {
          email: data.email,
          password: data.password,
        },
      });

      login(response.user, response.user.token);
      
      // Small delay to ensure auth state is fully synchronized
      setTimeout(() => {
        navigate({ to: '/' });
      }, 100);
    } catch (err) {
      console.error('Login failed:', err);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold">
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account?{' '}
        <Anchor size="sm" component={Link} to="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Login Error"
              color="red"
              mb="md"
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            error={form.formState.errors.email?.message}
            data-testid="email-input"
            {...form.register('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            error={form.formState.errors.password?.message}
            data-testid="password-input"
            {...form.register('password')}
          />

          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={isLoading}
            data-testid="login-button"
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}