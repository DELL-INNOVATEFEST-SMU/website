# Cosmic Compass Quiz Integration

This directory contains the complete implementation of the Cosmic Compass mental health screening quiz, converted from the original HTML to a fully integrated React component.

## Files Overview

- **`quiz-config.ts`** - Quiz questions, options, planet mappings, and type definitions
- **`quiz-logic.ts`** - Core logic for scoring, validation, and result processing
- **`lead-capture.ts`** - Supabase integration for storing quiz results and contact info

## Database Setup

To use the lead capture functionality, create this table in your Supabase dashboard:

```sql
CREATE TABLE cosmic_compass_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  phone text,
  quiz_answers jsonb NOT NULL,
  phq_total integer NOT NULL,
  phq_band text NOT NULL,
  dominant_flavor text NOT NULL,
  planet_id text NOT NULL,
  planet_name text NOT NULL,
  age integer,
  nationality text,
  referral text NOT NULL,
  user_agent text,
  source text DEFAULT 'cosmic-compass-react',
  q1 integer,
  q2 integer,
  q3 integer,
  q4 integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cosmic_compass_leads ENABLE ROW LEVEL SECURITY;

-- Allow public submissions (for the quiz)
CREATE POLICY "Allow public lead submissions" ON cosmic_compass_leads
  FOR INSERT TO anon WITH CHECK (true);

-- Admin access (adjust role as needed)
CREATE POLICY "Admin access to leads" ON cosmic_compass_leads
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');
```

## Quiz Flow

1. **Questions**: 14 questions total (8 personality + 4 PHQ-4 + 2 demographic)
2. **Scoring**: PHQ-4 mental health screening + personality flavor calculation
3. **Planet Assignment**: Based on dominant personality (fire/ice/water/air) + PHQ band
4. **Lead Capture**: Email/phone collection before revealing results
5. **Referral Routing**: Age + nationality determine SAMH/COMIT/Limitless referral

## Integration Features

- ✅ Preserves original quiz logic and styling
- ✅ React best practices with TypeScript
- ✅ Supabase integration for data storage
- ✅ Mobile-responsive design
- ✅ Accessibility considerations
- ✅ Error handling and validation
- ✅ Navigation integration with main app

## Usage

The quiz is accessible at `/cosmic-compass` and includes a navigation button in the main Solar System view.

## PHQ-4 Compliance

The PHQ-4 questions are rendered verbatim to maintain clinical screening integrity. The scoring follows standard PHQ-4 guidelines:

- **Normal**: 0-2
- **Mild**: 3-5
- **Moderate**: 6-8
- **Severe**: 9-12

**Anxiety and Depression Scoring:**

- **Anxiety Score**: Q1 + Q2 (≥3 indicates anxiety risk)
- **Depression Score**: Q3 + Q4 (≥3 indicates depression risk)
- Individual question scores (q1, q2, q3, q4) are stored separately in the database for detailed analytics
