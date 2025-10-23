import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://atipdxvrlydcldrfshpi.supabase.co';
// const supabaseAnonKey =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0aXBkeHZybHlkY2xkcmZzaHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0OTYzNzUsImV4cCI6MjA3NjA3MjM3NX0.JGah2Crk4vZFL5zpWIum3iwpMStU-ukZcEGr7KrTWfo';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const initSampleData = () => {
  const models = Array.from({ length: 20 }, (_, i) => ({
    id: `model-${i + 1}`,
    model_number: i + 1,
    name_en: `Model ${i + 1}: Historical Site`,
    name_ur: `ماڈل ${i + 1}: تاریخی مقام`,
    name_kn: `ಮಾದರಿ ${i + 1}: ಐತಿಹಾಸಿಕ ಸ್ಥಳ`,
    description_en: `Detailed recreation of significant location from the Prophet's life`,
    location: `Hall ${String.fromCharCode(65 + Math.floor(i / 5))}, Stall ${
      (i % 5) + 1
    }`,
    volunteer_id: `vol-${(i % 5) + 1}`,
  }));

  const volunteers = Array.from({ length: 5 }, (_, i) => ({
    id: `vol-${i + 1}`,
    name: `Volunteer ${i + 1}`,
    volunteer_code: `V${String(i + 1).padStart(3, '0')}`,
  }));

  const ratings = [];
  models.forEach((model) => {
    const numRatings = Math.floor(Math.random() * 50) + 10;
    for (let i = 0; i < numRatings; i++) {
      ratings.push({
        id: `rating-${model.id}-${i}`,
        model_id: model.id,
        device_fingerprint: `device-${Math.floor(Math.random() * 1000)}`,
        rater_type: Math.random() > 0.2 ? 'visitor' : 'evaluator',
        design_craftsmanship: Math.floor(Math.random() * 2) + 4,
        historical_accuracy: Math.floor(Math.random() * 2) + 4,
        volunteer_explanation: Math.floor(Math.random() * 2) + 3,
        educational_value: Math.floor(Math.random() * 2) + 4,
        overall_experience: Math.floor(Math.random() * 2) + 4,
        rating_time: new Date(
          Date.now() - Math.random() * 86400000 * 4,
        ).toISOString(),
        language_used: ['en', 'ur', 'kn'][Math.floor(Math.random() * 3)],
      });
    }
  });

  supabase
    .from('models')
    .select()
    .then(({ data }) => {
      if (!data || data.length === 0) {
        models.forEach((m) => supabase.from('models').insert(m).select());
        volunteers.forEach((v) =>
          supabase.from('volunteers').insert(v).select(),
        );
        ratings.forEach((r) => supabase.from('ratings').insert(r).select());
      }
    });
};

export const generateUserID = async () => {
  let deviceId = localStorage.getItem('user_id');
  if (!deviceId) {
    const user_id = Number(
      parseInt(Math.random() * 899 + 100) +
        '' +
        Date.now().toString().split('').reverse().join('') +
        parseInt(Math.random() * 90 + 10),
    ).toString(16);
    localStorage.setItem('user_id', user_id);
  }
  return deviceId;
};
