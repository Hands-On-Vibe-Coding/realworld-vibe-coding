import { 
  Paper, 
  Title, 
  TextInput, 
  PasswordInput, 
  Button, 
  Stack, 
  Text, 
  Center 
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login data:', data);
    // TODO: Implement login logic
  };

  return (
    <Center>
      <Paper w={400} p="xl" withBorder>
        <Stack>
          <Title order={1} ta="center">
            Sign in
          </Title>
          
          <Text ta="center" c="dimmed">
            <Link to="/register">Need an account?</Link>
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" loading={isSubmitting} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
}