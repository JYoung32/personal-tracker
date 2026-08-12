import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { useAuth } from '../context/AuthContext';

const BLANK_PROFILE = { username: '', firstName: '', lastName: '' };

function rowToProfile(row) {
  return {
    username: row?.username ?? '',
    firstName: row?.first_name ?? '',
    lastName: row?.last_name ?? '',
  };
}

/**
 * The user's profile — username, first/last name — one row per auth user
 * in the `profiles` table (auto-created on signup, see supabase/schema.sql).
 * Unlike useCollection this isn't a list, so it manages its own single-row
 * fetch/update against Supabase directly.
 */
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(BLANK_PROFILE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username, first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!error) setProfile(rowToProfile(data));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateProfile(updates) {
    const row = {};
    if ('username' in updates) row.username = updates.username;
    if ('firstName' in updates) row.first_name = updates.firstName;
    if ('lastName' in updates) row.last_name = updates.lastName;

    const { data, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('user_id', user.id)
      .select('username, first_name, last_name')
      .single();
    if (error) throw error;
    setProfile(rowToProfile(data));
  }

  return { profile, loading, updateProfile };
}
