import { useState } from 'react';

const PROFILE_STORAGE_KEY = 'personal-tracker:profile';

function readProfile() {
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : { firstName: '', lastName: '' };
}

/**
 * The user's profile is a single object (not a list), so it doesn't fit the
 * useCollection pattern — this reads/writes it directly under its own
 * localStorage key. localStorage access is synchronous, so unlike
 * useCollection there's no artificial loading state to model a future
 * async backend.
 */
export function useProfile() {
  const [profile, setProfile] = useState(readProfile);

  function updateProfile(updates) {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { profile, updateProfile };
}
