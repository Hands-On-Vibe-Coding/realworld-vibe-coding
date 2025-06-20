import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Center, Stack } from '@mantine/core';
import { RegisterForm } from '../components/forms/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
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
        <RegisterForm />
      </Stack>
    </Center>
  );
}