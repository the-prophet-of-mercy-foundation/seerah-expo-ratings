// src/lib/ratingUtils.js
import { supabase, generateUserID } from './supabaseClient';
import { getModels } from './modelsApi';

// Fetch model by model number
export async function fetchModelByNumber(modelNumber) {
  const models = await getModels();
  return models?.find((m) => m.model_number === modelNumber) || null;
}

// Check if a user has already rated the model
export async function checkIfAlreadyRated(modelNumber) {
  return await isModelAlreadyRated(modelNumber);
  /**
  if (alreadyRated) return true;
  const user_id = await generateUserID();
  const { data, error } = await supabase
    .from('ratings')
    .select()
    .eq('model_number', modelNumber)
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) console.log('Error checking rating:', error);
  return !!data;
   */
}

// Submit a new rating
export async function submitRating(ratingData) {
  const alreadyRated = await isModelAlreadyRated(ratingData.model_number);
  if (alreadyRated) return;

  const { data, error } = await supabase
    .from('ratings')
    .insert(ratingData)
    .select();

  const googleFormUrl = `https://docs.google.com/forms/d/e/1FAIpQLSfY9rly6Kuc4E43TA_zV0-nhJV4ZgQjrOkkNbjly_p7b7A2OA/formResponse?entry.299367324=${ratingData.model_number}&entry.381056859=${ratingData.star_rating}&entry.1501257721=${ratingData.user_id}`;
  fetch(googleFormUrl, { mode: 'no-cors' }).catch((err) => {
    console.log('Error submitting to Google Forms:', err);
  });

  if (error) {
    console.log('Error submitting rating:', error);
  } else {
    addRatedModel(ratingData);
  }
  return data;
}

const getRatedModels = async () => {
  try {
    let ratedModels = localStorage.getItem('ratedModels');
    if (!ratedModels) {
      const user_id = await generateUserID();
      if (!user_id) return [];
      const { data, error } = await supabase
        .from('ratings')
        .select('user_id, model_number, star_rating, comments')
        .eq('user_id', user_id);
      if (error) {
        console.log('Error fetching rated models:', error);
        return [];
      }
      localStorage.setItem('ratedModels', JSON.stringify(data));
      return data;
    }
    return JSON.parse(ratedModels) || [];
  } catch {
    return [];
  }
};

const addRatedModel = async (ratingData) => {
  const existing = await getRatedModels();
  // avoid duplicates
  const updated = existing.filter(
    (r) => r.model_number !== ratingData.model_number,
  );
  updated.push(ratingData);
  localStorage.setItem('ratedModels', JSON.stringify(updated));
};

const isModelAlreadyRated = async (modelNumber) => {
  const ratedModels = await getRatedModels();
  let alreadyRated = ratedModels.some((r) => r.model_number === modelNumber);
  console.log(
    `isModelAlreadyRated for modelNumber ${modelNumber}:`,
    alreadyRated,
  );
  return alreadyRated;
};

export const updateModelVisited = (modelNumber) => {
  try {
    const modelsCache = localStorage.getItem('modelsCache');
    if (!modelsCache) {
      console.warn('No modelsCache found in localStorage');
      return;
    }
    const models = JSON.parse(modelsCache);
    const updatedModels = models.map((model) =>
      model.model_number === modelNumber ? { ...model, visited: 1 } : model,
    );
    localStorage.setItem('modelsCache', JSON.stringify(updatedModels));
  } catch (error) {
    console.log('Error updating model visited status:', error);
  }
};
