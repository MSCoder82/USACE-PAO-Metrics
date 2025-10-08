import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationProvider';
import Avatar from './Avatar';

interface ProfilePageProps {
  session: Session;
  profile: Profile;
  onProfileUpdate: (updatedProfileData: Partial<Profile>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ session, profile, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useNotification();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded avatar.');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      onProfileUpdate({ avatarUrl: publicUrl });

    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel mx-auto max-w-2xl space-y-8 md:p-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar url={profile.avatarUrl} name={session.user.email} size={128} />
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">{session.user.email}</h2>
          <p className="text-sm text-navy-600 dark:text-navy-200">{profile.teamName}</p>
        </div>
        <div>
          <label htmlFor="avatar-upload" className="surface-button">
            {uploading ? 'Uploading…' : 'Upload new avatar'}
          </label>
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-white/30 bg-white/40 p-6 text-left dark:border-white/10 dark:bg-white/5">
        <h3 className="text-xl font-semibold text-navy-900 dark:text-white">Profile details</h3>
        <dl className="space-y-4 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">Email address</dt>
            <dd className="text-navy-800 dark:text-white">{session.user.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">Team</dt>
            <dd className="text-navy-800 dark:text-white">{profile.teamName}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">Role</dt>
            <dd className="capitalize text-navy-800 dark:text-white">{profile.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfilePage;
