import { Group, Button, Text, Burger, Drawer, Stack } from '@mantine/core';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { useDisclosure } from '@mantine/hooks';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
    close();
  };

  const navigationItems = isAuthenticated ? [
    { to: '/', label: 'Home', variant: location.pathname === '/' ? 'filled' : 'subtle' },
    { to: '/editor', label: 'New Article', variant: location.pathname === '/editor' ? 'filled' : 'subtle', color: 'green' },
  ] : [
    { to: '/login', label: 'Sign In', variant: location.pathname === '/login' ? 'filled' : 'subtle' },
    { to: '/register', label: 'Sign Up', variant: location.pathname === '/register' ? 'filled' : 'subtle', color: 'green' },
  ];

  return (
    <>
      <Group h="100%" px="md" justify="space-between">
        <Text size="xl" fw={700} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          RealWorld
        </Text>
        
        {/* Desktop Navigation */}
        <Group visibleFrom="sm">
          {navigationItems.map((item) => (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              variant={item.variant}
              color={item.color}
              onClick={close}
            >
              {item.label}
            </Button>
          ))}
          {isAuthenticated && (
            <>
              <Text size="sm" c="dimmed">{user?.username}</Text>
              <Button color="red" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Group>

        {/* Mobile Navigation */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </Group>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title="Menu"
        hiddenFrom="sm"
      >
        <Stack gap="md" p="md">
          {navigationItems.map((item) => (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              variant={item.variant}
              color={item.color}
              fullWidth
              onClick={close}
            >
              {item.label}
            </Button>
          ))}
          {isAuthenticated && (
            <>
              <Text ta="center" size="sm" c="dimmed" mt="md">
                Logged in as {user?.username}
              </Text>
              <Button color="red" onClick={handleLogout} fullWidth>
                Logout
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
}