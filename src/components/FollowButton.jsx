import { useState } from 'react';
import { followUser, unfollowUser } from '../lib/api';
import { f } from '../utils/constants';

export default function FollowButton({ targetUserId, initialIsFollowing, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
        onFollowChange?.(-1);
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
        onFollowChange?.(1);
      }
    } catch (e) {
      console.error('Follow error:', e);
    } finally {
      setLoading(false);
    }
  };

  const label = loading ? '…' : isFollowing ? (hovered ? 'Unfollow' : 'Following') : 'Follow';
  const isUnfollowHover = isFollowing && hovered;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 20px',
        borderRadius: 20,
        border: isFollowing ? '1px solid var(--border)' : 'none',
        background: isFollowing
          ? (isUnfollowHover ? '#E6394620' : 'transparent')
          : 'var(--text-primary)',
        color: isFollowing
          ? (isUnfollowHover ? '#E63946' : 'var(--text-secondary)')
          : 'var(--bg)',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: f,
        cursor: loading ? 'default' : 'pointer',
        transition: 'all .15s',
        opacity: loading ? 0.6 : 1,
        minWidth: 90,
      }}
    >
      {label}
    </button>
  );
}
