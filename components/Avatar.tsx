import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AvatarProps {
  url: string | undefined;
  name: string | undefined;
  size: number;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, size }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
        // The URL from the profiles table should be a full public URL already.
        // If it's just a path, you would need to download it like this:
        // downloadImage(url);
        setAvatarUrl(url);
    } else {
        setAvatarUrl(null);
    }
  }, [url]);

  const getInitials = (email?: string) => {
    if (!email) return '?';
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <div
      className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-usace-blue/70 via-white/80 to-usace-red/70 p-[2px] shadow-lg shadow-navy-900/20 dark:via-white/20"
      style={{ height: size, width: size }}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-full bg-white/90 text-navy-900 backdrop-blur dark:bg-navy-900/80 dark:text-white"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span
            className="font-semibold"
            style={{ fontSize: size / 2.2 }}
          >
            {getInitials(name)}
          </span>
        )}
      </div>
    </div>
  );
};

export default Avatar;