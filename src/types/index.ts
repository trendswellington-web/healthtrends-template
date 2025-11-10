export interface Keyword {
  id: string;
  name: string;
  category: string;
  interest_score: number;
  trend_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeywordDailyTrend {
  id: string;
  keyword_id: string;
  date: string;
  interest_score: number;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  full_name: string;
  created_at: string;
}

export interface CityKeywordInterest {
  id: string;
  keyword_id: string;
  city_id: string;
  interest_score: number;
  trend_percentage: number;
  rank: number;
  updated_at: string;
  city?: City;
}

export interface Region {
  id: string;
  name: string;
  parent_region: string | null;
  region_type: string;
  created_at: string;
}

export interface RegionKeywordInterest {
  id: string;
  keyword_id: string;
  region_id: string;
  interest_score: number;
  intensity_level: string;
  updated_at: string;
  region?: Region;
}

export interface RelatedTopic {
  id: string;
  keyword_id: string;
  topic_name: string;
  growth_percentage: number;
  is_breakout: boolean;
  created_at: string;
}

export interface RisingQuery {
  id: string;
  keyword_id: string;
  query_text: string;
  growth_percentage: number;
  created_at: string;
}

export interface AISummary {
  id: string;
  keyword_id: string;
  summary_text: string;
  generated_at: string;
}

export interface MarketArticle {
  id: string;
  keyword_id: string | null;
  title: string;
  source: string;
  excerpt: string | null;
  url: string | null;
  published_at: string;
  created_at: string;
}

export interface MonthlySummary {
  id: string;
  month: string;
  top_keywords: {
    keyword: string;
    score: number;
    rank: number;
  }[];
  created_at: string;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}
