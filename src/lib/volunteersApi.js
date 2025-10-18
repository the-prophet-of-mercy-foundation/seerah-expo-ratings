import { supabase } from './supabaseClient';

export async function getVolunteers() {
  const { data, error } = await supabase.from('volunteers').select();
  if (error) console.log('Error fetching volunteers:', error);
  return data || [];
}

export async function addVolunteer(vol) {
  const { data, error } = await supabase.from('volunteers').insert(vol).select();
  if (error) console.log('Error adding volunteers:', error);
  return data?.[0] ?? null;
}

export async function updateVolunteer(id, changes) {
  const { data, error } = await supabase.from('volunteers').update(changes).eq('id', id).select();
  if (error) console.log('Error updating volunteers:', error);
  return data?.[0] ?? null;
}

export async function deleteVolunteer(id) {
  const { data, error } = await supabase.from('volunteers').delete().eq('id', id).select();
  if (error) console.log('Error deleting volunteers:', error);
  return data;
}
