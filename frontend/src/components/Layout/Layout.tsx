import { AppShell, Container, Group, Title, Button, Avatar, Menu } from '@mantine/core';
import { Outlet, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';

export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group justify="space-between" h="100%">
            <Title order={2} c="green" data-testid="brand-logo">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} data-testid="home-link">
                RealWorld
              </Link>
            </Title>

            <Group>
              {isAuthenticated && user ? (
                <>
                  <Button variant="subtle" component={Link} to="/">
                    Home
                  </Button>
                  <Button variant="subtle" component={Link} to="/editor">
                    New Article
                  </Button>
                  <Button variant="subtle" component={Link} to="/settings">
                    Settings
                  </Button>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Avatar 
                        src={user.image} 
                        alt={user.username} 
                        style={{ cursor: 'pointer' }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item component={Link} to={`/profile/${user.username}`}>
                        Profile
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item onClick={logout} color="red">
                        Logout
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              ) : (
                <>
                  <Button variant="subtle" component={Link} to="/">
                    Home
                  </Button>
                  <Button variant="subtle" component={Link} to="/login" data-testid="login-link">
                    Sign in
                  </Button>
                  <Button component={Link} to="/register" data-testid="register-link">
                    Sign up
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}