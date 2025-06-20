import { useProfile } from '../../hooks/useProfile';
import { FollowButton } from './FollowButton';
import { useAuthStore } from '../../stores/authStore';

interface ProfileInfoProps {
  username: string;
}

export function ProfileInfo({ username }: ProfileInfoProps) {
  const { data, isLoading, error } = useProfile(username);
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border-b">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <p className="text-red-600">Profile not found</p>
          </div>
        </div>
      </div>
    );
  }

  const { profile } = data;
  const isOwnProfile = user && user.username === profile.username;

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <img
            src={profile.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.username}
            alt={profile.username}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {profile.username}
          </h1>
          {profile.bio && (
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {profile.bio}
            </p>
          )}
          {!isOwnProfile && user && (
            <FollowButton 
              username={profile.username}
              following={profile.following}
            />
          )}
          {isOwnProfile && (
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-300">
              Edit Profile Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}