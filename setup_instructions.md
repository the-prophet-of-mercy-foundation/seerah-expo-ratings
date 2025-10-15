# Exhibition Rating System - Complete Setup Instructions

## 📋 Prerequisites
- Node.js (v14 or higher) installed
- npm or yarn package manager
- A code editor (VS Code recommended)
- A Supabase account (free)

---

## 🚀 Part 1: Local Setup (10 minutes)

### Step 1: Create React App

```bash
npx create-react-app exhibition-rating
cd exhibition-rating
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### Step 3: Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

### Step 4: Configure Tailwind

Replace content in `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 5: Update CSS

Replace everything in `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 6: Copy Application Code

Replace everything in `src/App.js` with the React code from the artifact.

### Step 7: Run Locally

```bash
npm start
```

Your app should now open at `http://localhost:3000` with full styling! ✅

---

## 🗄️ Part 2: Supabase Setup (10 minutes)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for free account
3. Click "New Project"
4. Enter project details:
   - Name: `exhibition-rating`
   - Database Password: (save this securely)
   - Region: Choose closest to your location
5. Wait 2-3 minutes for project to be created

### Step 2: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create Models Table
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_number INTEGER UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_ur TEXT,
    name_kn TEXT,
    description_en TEXT,
    description_ur TEXT,
    description_kn TEXT,
    location TEXT,
    volunteer_id UUID,
    qr_code_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on model_number
CREATE INDEX idx_models_number ON models(model_number);

-- Create Volunteers Table
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    volunteer_code TEXT UNIQUE,
    contact_info TEXT,
    assigned_models INTEGER[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Ratings Table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    rater_type TEXT CHECK (rater_type IN ('visitor', 'evaluator')),
    
    -- Rating Categories (1-5 stars each)
    design_craftsmanship INTEGER CHECK (design_craftsmanship BETWEEN 1 AND 5),
    historical_accuracy INTEGER CHECK (historical_accuracy BETWEEN 1 AND 5),
    volunteer_explanation INTEGER CHECK (volunteer_explanation BETWEEN 1 AND 5),
    educational_value INTEGER CHECK (educational_value BETWEEN 1 AND 5),
    overall_experience INTEGER CHECK (overall_experience BETWEEN 1 AND 5),
    
    -- Optional feedback
    comments TEXT,
    language_used TEXT CHECK (language_used IN ('en', 'ur', 'kn')),
    
    -- Metadata
    rating_date DATE DEFAULT CURRENT_DATE,
    rating_time TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ratings_model ON ratings(model_id);
CREATE INDEX idx_ratings_fingerprint ON ratings(device_fingerprint);
CREATE INDEX idx_ratings_date ON ratings(rating_date);

-- Prevent duplicate ratings from same device for same model
CREATE UNIQUE INDEX idx_ratings_unique_device_model 
    ON ratings(device_fingerprint, model_id);

-- Exhibition Feedback Table
CREATE TABLE exhibition_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    comments TEXT,
    suggestions TEXT,
    language_used TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

4. Click "Run" to execute

### Step 3: Create Analytics Views

Continue in SQL Editor, create new query:

```sql
-- Model Rankings View
CREATE OR REPLACE VIEW model_rankings AS
SELECT 
    m.id,
    m.model_number,
    m.name_en,
    m.location,
    COUNT(r.id) as total_ratings,
    ROUND(AVG(r.design_craftsmanship)::numeric, 2) as avg_design,
    ROUND(AVG(r.historical_accuracy)::numeric, 2) as avg_accuracy,
    ROUND(AVG(r.volunteer_explanation)::numeric, 2) as avg_explanation,
    ROUND(AVG(r.educational_value)::numeric, 2) as avg_education,
    ROUND(AVG(r.overall_experience)::numeric, 2) as avg_overall,
    ROUND(AVG(
        (r.design_craftsmanship + r.historical_accuracy + 
         r.volunteer_explanation + r.educational_value + 
         r.overall_experience) / 5.0
    )::numeric, 2) as composite_score,
    RANK() OVER (ORDER BY AVG(
        (r.design_craftsmanship + r.historical_accuracy + 
         r.volunteer_explanation + r.educational_value + 
         r.overall_experience) / 5.0
    ) DESC) as rank
FROM models m
LEFT JOIN ratings r ON m.id = r.model_id
GROUP BY m.id, m.model_number, m.name_en, m.location
ORDER BY composite_score DESC NULLS LAST;

-- Volunteer Performance View
CREATE OR REPLACE VIEW volunteer_performance AS
SELECT 
    v.id,
    v.name,
    v.volunteer_code,
    COUNT(DISTINCT r.id) as total_ratings_received,
    ROUND(AVG(r.volunteer_explanation)::numeric, 2) as avg_explanation_score,
    COUNT(DISTINCT r.model_id) as models_assigned,
    RANK() OVER (ORDER BY AVG(r.volunteer_explanation) DESC) as performance_rank
FROM volunteers v
LEFT JOIN models m ON m.volunteer_id = v.id
LEFT JOIN ratings r ON r.model_id = m.id
GROUP BY v.id, v.name, v.volunteer_code
ORDER BY avg_explanation_score DESC NULLS LAST;

-- Daily Summary View
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
    rating_date,
    COUNT(*) as total_ratings,
    COUNT(DISTINCT model_id) as unique_models_rated,
    COUNT(DISTINCT device_fingerprint) as unique_visitors,
    ROUND(AVG(
        (design_craftsmanship + historical_accuracy + 
         volunteer_explanation + educational_value + 
         overall_experience) / 5.0
    )::numeric, 2) as avg_score,
    COUNT(CASE WHEN rater_type = 'visitor' THEN 1 END) as visitor_ratings,
    COUNT(CASE WHEN rater_type = 'evaluator' THEN 1 END) as evaluator_ratings
FROM ratings
GROUP BY rating_date
ORDER BY rating_date DESC;
```

### Step 4: Enable Row Level Security

Continue in SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_feedback ENABLE ROW LEVEL SECURITY;

-- Public read access to models
CREATE POLICY "Models are viewable by everyone"
    ON models FOR SELECT
    USING (true);

-- Anyone can insert ratings (anonymous)
CREATE POLICY "Anyone can submit ratings"
    ON ratings FOR INSERT
    WITH CHECK (true);

-- Public read access to ratings for dashboard
CREATE POLICY "Ratings are viewable by everyone"
    ON ratings FOR SELECT
    USING (true);

-- Volunteers viewable by everyone
CREATE POLICY "Volunteers are viewable by everyone"
    ON volunteers FOR SELECT
    USING (true);

-- Anyone can submit exhibition feedback
CREATE POLICY "Anyone can submit feedback"
    ON exhibition_feedback FOR INSERT
    WITH CHECK (true);
```

### Step 5: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## 🔌 Part 3: Connect Supabase to App (2 minutes)

### Step 1: Create Environment File

Create a new file `.env.local` in your project root:

```bash
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual values from Supabase.

### Step 2: Create Supabase Client

Create a new file `src/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 3: Update App.js

At the very top of `src/App.js`, replace the mock Supabase section with:

```javascript
import { supabase } from './supabaseClient';

// Remove the entire createMockSupabase function and const supabase = createMockSupabase();
```

### Step 4: Remove Sample Data Initialization

In `App.js`, find and remove or comment out the `initSampleData()` function call (you'll add real data via admin panel instead).

### Step 5: Restart App

```bash
npm start
```

Your app is now connected to real Supabase database! 🎉

---

## 📊 Part 4: Add Your Exhibition Data (15 minutes)

### Option A: Via Admin Panel (Recommended)

1. Go to `http://localhost:3000/#admin`
2. Click "Models" tab
3. Add your 100 models one by one with:
   - Model number (1-100)
   - Names in English, Urdu, Kannada
   - Description
   - Location (e.g., "Hall A, Stall 1")

### Option B: Bulk Import via SQL

Create a file `models_data.sql` and run in Supabase SQL Editor:

```sql
INSERT INTO models (model_number, name_en, name_ur, name_kn, description_en, location) VALUES
(1, 'The Prophet''s House in Makkah', 'مکہ میں نبی کا گھر', 'ಮಕ್ಕಾದಲ್ಲಿ ಪ್ರವಾದಿಯ ಮನೆ', 'Recreation of the Prophet''s home in Makkah', 'Hall A, Stall 1'),
(2, 'Dar al-Arqam', 'دار الارقم', 'ದಾರ್ ಅಲ್-ಅರ್ಕಾಮ್', 'The first house of Islam where early Muslims gathered', 'Hall A, Stall 2'),
(3, 'Cave of Hira', 'غار حرا', 'ಹಿರಾ ಗುಹೆ', 'Where the first revelation was received', 'Hall A, Stall 3'),
-- Add remaining 97 models...
;
```

### Add Volunteers

```sql
INSERT INTO volunteers (name, volunteer_code, assigned_models) VALUES
('Ahmed Khan', 'V001', ARRAY[1,2,3,4,5]),
('Fatima Ali', 'V002', ARRAY[6,7,8,9,10]),
-- Add more volunteers...
;
```

---

## 📱 Part 5: Generate QR Codes (10 minutes)

### Option A: Online Generator (Easiest)

1. Go to Admin Panel → QR Codes tab
2. Click "Generate All QR Codes"
3. Copy each URL from console
4. Go to [https://qr-code-generator.com](https://qr-code-generator.com)
5. Paste each URL and download QR image
6. Name files as `Model_001_QR.png`, `Model_002_QR.png`, etc.

### Option B: Automated Script

Create `generate-qr.js` in project root:

```javascript
const QRCode = require('qrcode');
const fs = require('fs');

const baseURL = 'https://your-app-url.vercel.app'; // Update after deployment

async function generateQRCodes() {
  if (!fs.existsSync('./qr-codes')) {
    fs.mkdirSync('./qr-codes');
  }

  for (let i = 1; i <= 100; i++) {
    const url = `${baseURL}/#rate?model=${i}`;
    const filename = `./qr-codes/Model_${String(i).padStart(3, '0')}_QR.png`;
    
    await QRCode.toFile(filename, url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log(`Generated: ${filename}`);
  }
  
  console.log('All QR codes generated successfully!');
}

generateQRCodes();
```

Install and run:

```bash
npm install qrcode
node generate-qr.js
```

All QR codes will be in `./qr-codes/` folder.

---

## 🚀 Part 6: Deploy to Production (10 minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Build the App

```bash
npm run build
```

### Step 3: Deploy

```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? `exhibition-rating`
- Which directory? `./`
- Override settings? **N**

### Step 4: Add Environment Variables

After deployment:

1. Go to [https://vercel.com](https://vercel.com)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `REACT_APP_SUPABASE_URL` = your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key
5. Redeploy: `vercel --prod`

Your app is now live! 🎉

---

## 📋 Part 7: Pre-Exhibition Checklist

### 1 Week Before:

- [ ] All 100 models added to database
- [ ] All volunteers added and assigned
- [ ] QR codes generated and printed
- [ ] QR codes tested on 5+ different devices
- [ ] Dashboard tested on large screen
- [ ] Translation accuracy verified
- [ ] Backup plan for internet issues

### 1 Day Before:

- [ ] Print QR codes on A5/A6 laminated cards
- [ ] Mount QR codes at each stall
- [ ] Test complete flow: Scan → Rate → Dashboard update
- [ ] Brief volunteers on encouraging ratings
- [ ] Set up dashboard display screen at entrance
- [ ] Test venue WiFi connectivity

### Exhibition Day:

- [ ] Dashboard running on display screen
- [ ] All QR codes in place
- [ ] Monitor ratings in real-time
- [ ] Have troubleshooting guide ready
- [ ] Collect feedback throughout

---

## 🛠️ Troubleshooting

### Issue: "Supabase is not defined"

**Solution:** Make sure you created `src/supabaseClient.js` and imported it correctly.

### Issue: Styling not working

**Solution:** 
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Add Tailwind directives to `src/index.css`

### Issue: QR code leads to 404

**Solution:** Make sure you're using hash routing (`/#rate?model=1`) not regular routing.

### Issue: "Already rated" shown incorrectly

**Solution:** Clear localStorage: `localStorage.clear()` in browser console

### Issue: Dashboard not updating

**Solution:** Check Supabase RLS policies are set correctly, refresh page.

### Issue: Can't submit rating

**Solution:** Check network tab for errors, verify Supabase connection.

---

## 📞 Support Resources

- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [https://vercel.com/docs](https://vercel.com/docs)
- **React Docs:** [https://react.dev](https://react.dev)
- **Tailwind Docs:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 🎉 Success Criteria

Your setup is complete when:

✅ App runs locally with styling  
✅ Can add models via admin panel  
✅ Can rate a model and see it on dashboard  
✅ Dashboard updates in real-time  
✅ QR codes scan and open rating form  
✅ App deployed and accessible online  

---

## 📊 Post-Exhibition

### Export All Data:

1. Go to Admin Panel → Export tab
2. Click "Export Ratings to CSV"
3. Open in Excel for analysis

### Generate Final Report:

In Supabase SQL Editor:

```sql
-- Overall Exhibition Stats
SELECT 
  COUNT(DISTINCT device_fingerprint) as total_visitors,
  COUNT(*) as total_ratings,
  ROUND(AVG((design_craftsmanship + historical_accuracy + 
             volunteer_explanation + educational_value + 
             overall_experience) / 5.0)::numeric, 2) as overall_avg
FROM ratings;

-- Top 10 Models
SELECT * FROM model_rankings LIMIT 10;

-- Best Volunteers
SELECT * FROM volunteer_performance LIMIT 10;
```

---

## 🤲 Final Note

May Allah accept this effort and make it a source of knowledge and inspiration for all visitors to learn about the life of Prophet Muhammad ﷺ.

**Ameen.**

---

*Last Updated: October 2025*  
*Version: 1.0*