/*
  # Real Estate Trends Explorer Database Schema

  ## Overview
  Creates comprehensive database structure for storing real estate market trends data,
  keyword analytics, regional statistics, and market intelligence.

  ## New Tables

  ### 1. `keywords`
  Stores all tracked search keywords/phrases with metadata
  - `id` (uuid, primary key)
  - `name` (text, unique) - The keyword phrase (e.g., "First Time Home Buyer")
  - `category` (text) - Category classification (e.g., "Residential Buying")
  - `interest_score` (integer) - Current interest score (0-100)
  - `trend_percentage` (numeric) - Percentage change vs previous period
  - `is_active` (boolean) - Whether keyword is currently tracked
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `keyword_daily_trends`
  Time-series data for keyword interest over time
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords)
  - `date` (date) - The date of measurement
  - `interest_score` (integer) - Interest score for that day (0-100)
  - `created_at` (timestamptz)

  ### 3. `cities`
  Geographic locations for market analysis
  - `id` (uuid, primary key)
  - `name` (text) - City name (e.g., "Austin")
  - `state` (text) - State abbreviation (e.g., "TX")
  - `full_name` (text) - Full display name (e.g., "Austin, TX")
  - `created_at` (timestamptz)

  ### 4. `city_keyword_interest`
  Interest scores by city for each keyword
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords)
  - `city_id` (uuid, foreign key -> cities)
  - `interest_score` (integer) - Interest score (0-100)
  - `trend_percentage` (numeric) - Trend vs previous period
  - `rank` (integer) - Ranking position for this keyword
  - `updated_at` (timestamptz)

  ### 5. `regions`
  Regional/county-level geographic areas
  - `id` (uuid, primary key)
  - `name` (text) - Region name (e.g., "Travis County")
  - `parent_region` (text) - Parent geographic area
  - `region_type` (text) - Type (county, metro, etc.)
  - `created_at` (timestamptz)

  ### 6. `region_keyword_interest`
  Regional heatmap data for keywords
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords)
  - `region_id` (uuid, foreign key -> regions)
  - `interest_score` (integer) - Interest score (0-100)
  - `intensity_level` (text) - Very High, High, Moderate, Low
  - `updated_at` (timestamptz)

  ### 7. `related_topics`
  Breakout topics associated with keywords
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords)
  - `topic_name` (text) - Related topic phrase
  - `growth_percentage` (numeric) - Growth rate
  - `is_breakout` (boolean) - Explosive growth indicator
  - `created_at` (timestamptz)

  ### 8. `rising_queries`
  Specific search queries related to keywords
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords)
  - `query_text` (text) - Full search query
  - `growth_percentage` (numeric) - Growth rate
  - `created_at` (timestamptz)

  ### 9. `ai_summaries`
  AI-generated market intelligence summaries
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords)
  - `summary_text` (text) - Full AI analysis
  - `generated_at` (timestamptz)

  ### 10. `market_articles`
  News articles and market coverage
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, foreign key -> keywords, nullable)
  - `title` (text) - Article headline
  - `source` (text) - Publication source
  - `excerpt` (text) - Brief description
  - `url` (text) - External link
  - `published_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 11. `monthly_summaries`
  Top performing keywords by month
  - `id` (uuid, primary key)
  - `month` (date) - First day of month
  - `top_keywords` (jsonb) - Array of top 3 keywords with scores
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for all trend data (no auth required for dashboard viewing)
  - Future: Add policies for authenticated users to save searches
*/

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  interest_score integer NOT NULL DEFAULT 0,
  trend_percentage numeric(5,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create keyword_daily_trends table
CREATE TABLE IF NOT EXISTS keyword_daily_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  date date NOT NULL,
  interest_score integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(keyword_id, date)
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, state)
);

-- Create city_keyword_interest table
CREATE TABLE IF NOT EXISTS city_keyword_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  interest_score integer NOT NULL,
  trend_percentage numeric(5,2) DEFAULT 0,
  rank integer,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(keyword_id, city_id)
);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_region text,
  region_type text DEFAULT 'county',
  created_at timestamptz DEFAULT now()
);

-- Create region_keyword_interest table
CREATE TABLE IF NOT EXISTS region_keyword_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  interest_score integer NOT NULL,
  intensity_level text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(keyword_id, region_id)
);

-- Create related_topics table
CREATE TABLE IF NOT EXISTS related_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  topic_name text NOT NULL,
  growth_percentage numeric(7,2) NOT NULL,
  is_breakout boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create rising_queries table
CREATE TABLE IF NOT EXISTS rising_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  growth_percentage numeric(7,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ai_summaries table
CREATE TABLE IF NOT EXISTS ai_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  summary_text text NOT NULL,
  generated_at timestamptz DEFAULT now()
);

-- Create market_articles table
CREATE TABLE IF NOT EXISTS market_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid REFERENCES keywords(id) ON DELETE SET NULL,
  title text NOT NULL,
  source text NOT NULL,
  excerpt text,
  url text,
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create monthly_summaries table
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE,
  top_keywords jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_keyword_daily_trends_keyword_date ON keyword_daily_trends(keyword_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_city_keyword_interest_keyword ON city_keyword_interest(keyword_id, rank);
CREATE INDEX IF NOT EXISTS idx_region_keyword_interest_keyword ON region_keyword_interest(keyword_id);
CREATE INDEX IF NOT EXISTS idx_related_topics_keyword ON related_topics(keyword_id);
CREATE INDEX IF NOT EXISTS idx_rising_queries_keyword ON rising_queries(keyword_id);
CREATE INDEX IF NOT EXISTS idx_market_articles_published ON market_articles(published_at DESC);

-- Enable Row Level Security
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_daily_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_keyword_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_keyword_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rising_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create public read policies for all tables (dashboard is publicly viewable)
CREATE POLICY "Public read access for keywords"
  ON keywords FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for keyword_daily_trends"
  ON keyword_daily_trends FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for cities"
  ON cities FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for city_keyword_interest"
  ON city_keyword_interest FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for regions"
  ON regions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for region_keyword_interest"
  ON region_keyword_interest FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for related_topics"
  ON related_topics FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for rising_queries"
  ON rising_queries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for ai_summaries"
  ON ai_summaries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for market_articles"
  ON market_articles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access for monthly_summaries"
  ON monthly_summaries FOR SELECT
  TO anon
  USING (true);