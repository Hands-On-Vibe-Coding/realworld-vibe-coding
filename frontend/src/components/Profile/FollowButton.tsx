import { useFollowUser, useUnfollowUser } from '../../hooks/useProfile';

interface FollowButtonProps {
  username: string;
  following: boolean;
}

export function FollowButton({ username, following }: FollowButtonProps) {
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleClick = async () => {
    try {
      if (following) {
        await unfollowUser.mutateAsync(username);
      } else {
        await followUser.mutateAsync(username);
      }
    } catch (error) {
      console.error('Failed to update follow status:', error);
    }
  };

  const isLoading = followUser.isPending || unfollowUser.isPending;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg border font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
        following
          ? 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
          : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
      }`}
    >
      {isLoading ? (
        'Loading...'
      ) : following ? (
        <>
          <span className="mr-1">✓</span>
          Unfollow {username}
        </>
      ) : (
        <>
          <span className="mr-1">+</span>
          Follow {username}
        </>
      )}
    </button>
  );
}