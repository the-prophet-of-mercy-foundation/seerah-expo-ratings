import { supabase } from './supabaseClient';

export async function isRepeatUser(id) {}

export async function getUsers() {
  const { data, error } = await supabase.from('users').select();
  if (error) {
    console.log('Error fetching models:', error);
  }
  return data || [];
}

export async function addUser(user) {
  const { data, error } = await supabase.from('users').insert(user).select();
  if (error) console.log('Error inserting models:', error);
  return data?.[0] ?? null;
}

export async function updateUser(id, changes) {
  const { data, error } = await supabase
    .from('users')
    .update(changes)
    .eq('id', id)
    .select();
  if (error) console.log('Error updating users:', error);
  return data?.[0] ?? null;
}

export async function updateVisitorCount(user_id, visitor_count) {
  const { data, error } = await supabase
    .from('users')
    .update({ visitor_count: visitor_count })
    .eq('user_id', user_id)
    .select();
  if (error) console.log('Error updating visitor count:', error);
  return data?.[0] ?? null;
}

export async function deleteUser(id) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select();
  if (error) console.log('Error deleting users:', error);
  return data;
}

export async function upsertUserByPhone(user) {
  let dbUser = null;
  try {
    // Check if a user with the same phone exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select()
      .or(`user_id.eq.${user.user_id}, phone.eq.${user.phone}`)
      .maybeSingle();

    // User exists → update the record
    if (existingUsers) {
      user.repeat_count = parseInt(existingUsers.repeat_count || 0) + 1;
      user.visitor_count =
        parseInt(existingUsers.visitor_count || 0) +
        parseInt(user.visitor_count || 1);
      const { user_id, ...newUser } = user;

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(newUser)
        .eq('id', existingUsers.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.log('Error updating user:', updateError);
      }

      dbUser = updatedUser;
    } else {
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert(user)
        .select()
        .maybeSingle();

      if (insertError) {
        console.log('Error inserting user:', insertError);
      }
      dbUser = insertedUser;
    }
    if (dbUser.user_id !== user.user_id) {
      localStorage.setItem('user_id', dbUser.user_id);
      await supabase
        .from('ratings')
        .update({ user_id: dbUser.user_id })
        .eq('user_id', user.user_id)
        .maybeSingle();
    }
    console.log('Upserted User:', dbUser.user_id, user.user_id);
    return dbUser;
  } catch (err) {
    console.log('Unexpected error:', err);
    return null;
  }
}
