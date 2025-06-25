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
    console.log('🔐 Login form submitted:', { email: data.email, timestamp: new Date().toISOString() });
    setError(null);
    setIsLoading(true);

    try {
      console.log('📡 Calling API login with:', { email: data.email });
      const response = await api.login({
        user: {
          email: data.email,
          password: data.password,
        },
      });
      
      console.log('✅ Login API response received:', { 
        username: response.user.username, 
        email: response.user.email,
        hasToken: !!response.user.token 
      });

      console.log('💾 Storing login data in auth store...');
      login(response.user, response.user.token);
      
      console.log('🧭 Navigating to home page...');
      navigate({ to: '/' });
    } catch (err) {
      console.error('❌ Login failed:', err);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
      console.log('🔄 Login process completed');
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
        <form onSubmit={(e) => {
          console.log('📝 Form submit event triggered');
          console.log('📊 Form state:', {
            isValid: form.formState.isValid,
            isDirty: form.formState.isDirty,
            errors: form.formState.errors,
            values: form.getValues()
          });
          return form.handleSubmit(onSubmit)(e);
        }}>
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
            onClick={() => {
              console.log('🖱️ Login button clicked');
              console.log('⏰ Current loading state:', isLoading);
            }}
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}