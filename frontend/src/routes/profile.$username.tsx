import { createFileRoute } from '@tanstack/react-router';
import { ProfileInfo } from '../components/Profile/ProfileInfo';

export const Route = createFileRoute('/profile/$username')({
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  
  return <ProfileInfo username={username} />;
}