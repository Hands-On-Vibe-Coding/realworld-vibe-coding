import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Center, Stack } from '@mantine/core';
import { LoginForm } from '../components/forms/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Center>
      <Stack w={400}>
        <LoginForm />
      </Stack>
    </Center>
  );
}