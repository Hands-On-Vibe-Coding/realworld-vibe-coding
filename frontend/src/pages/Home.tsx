import { Title, Text, Stack, Card } from '@mantine/core';

export function HomePage() {
  return (
    <Stack>
      <Card p="xl" ta="center">
        <Title order={1} mb="md">
          RealWorld
        </Title>
        <Text c="dimmed" size="lg">
          A place to share your knowledge.
        </Text>
      </Card>

      <Stack mt="xl">
        <Title order={2}>Global Feed</Title>
        <Text c="dimmed">
          Articles will be displayed here once the backend is connected.
        </Text>
      </Stack>
    </Stack>
  );
}