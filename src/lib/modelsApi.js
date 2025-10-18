import { supabase } from './supabaseClient';

export async function getModels() {
  let modelsCacheDate = localStorage.getItem('modelsCacheDate');
  let cachedModels = localStorage.getItem('modelsCache');
  if (modelsCacheDate) {
    let storedDate = new Date(modelsCacheDate);
    let today = new Date();
    if (storedDate.toDateString() === today.toDateString()) {
      if (cachedModels) {
        return JSON.parse(cachedModels);
      }
    }
  }

  const { data, error } = await supabase.from('models').select();
  if (error) {
    console.log('Error fetching models:', error);
    if (cachedModels) {
      return JSON.parse(cachedModels);
    }
  } else {
    localStorage.setItem('modelsCache', JSON.stringify(data));
    localStorage.setItem('modelsCacheDate', new Date().toISOString());
  }
  return data || [];
}

export async function addModel(model) {
  const { data, error } = await supabase.from('models').insert(model).select();
  if (error) console.log('Error inserting models:', error);
  return data?.[0] ?? null;
}

export async function updateModel(id, changes) {
  const { data, error } = await supabase
    .from('models')
    .update(changes)
    .eq('id', id)
    .select();
  if (error) console.log('Error updating models:', error);
  return data?.[0] ?? null;
}

export async function deleteModel(id) {
  const { data, error } = await supabase
    .from('models')
    .delete()
    .eq('id', id)
    .select();
  if (error) console.log('Error deleting models:', error);
  return data;
}
