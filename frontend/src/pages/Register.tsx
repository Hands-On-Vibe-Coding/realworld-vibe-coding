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

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Register data:', data);
    // TODO: Implement registration logic
  };

  return (
    <Center>
      <Paper w={400} p="xl" withBorder>
        <Stack>
          <Title order={1} ta="center">
            Sign up
          </Title>
          
          <Text ta="center" c="dimmed">
            <Link to="/login">Have an account?</Link>
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <TextInput
                label="Username"
                placeholder="john"
                error={errors.username?.message}
                {...register('username')}
              />

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
                Sign up
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
}