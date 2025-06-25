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
import { registerSchema, type RegisterFormData } from '@/lib/schemas';

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.register({
        user: {
          username: data.username,
          email: data.email,
          password: data.password,
        },
      });

      login(response.user, response.user.token);
      navigate({ to: '/' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold">
        Join RealWorld
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Registration Error"
              color="red"
              mb="md"
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Username"
            placeholder="Your username"
            required
            error={form.formState.errors.username?.message}
            data-testid="username-input"
            {...form.register('username')}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            mt="md"
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
            data-testid="register-button"
          >
            Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  );
}