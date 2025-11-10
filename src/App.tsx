import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Home,
  Star,
  Clock,
  Zap,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Bot,
  X,
  AlertTriangle,
  Trophy,
  Plus,
  Building2,
  Hammer,
  DollarSign,
  Wrench,
  BarChart3,
  Building,
  FileQuestion
} from 'lucide-react';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { CategoryButton } from './components/CategoryButton';
import { KeywordTag } from './components/KeywordTag';
import { CityRankingItem } from './components/CityRankingItem';
import { RegionHeatmapCell } from './components/RegionHeatmapCell';
import { InterestOverTimeChart } from './components/InterestOverTimeChart';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { EmptyState } from './components/EmptyState';
import { SkeletonChart } from './components/SkeletonCard';
import { useDebounce } from './hooks/useDebounce';
import { supabase } from './lib/supabase';
import type {
  Keyword,
  KeywordDailyTrend,
  CityKeywordInterest,
  RegionKeywordInterest,
  RelatedTopic,
  RisingQuery,
  AISummary,
  MarketArticle,
  MonthlySummary,
  ChartDataPoint
} from './types';

const categories = [
  { label: 'Residential Buying', icon: Home },
  { label: 'Commercial Real Estate', icon: Building2 },
  { label: 'Property Features', icon: Hammer },
  { label: 'Financing & Investment', icon: DollarSign },
  { label: 'Property Services', icon: Wrench },
  { label: 'Market Research', icon: BarChart3 },
  { label: 'Selling & Listing', icon: Building }
];

function App() {
  const [showBanner, setShowBanner] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Residential Buying']);
  const [selectedState, setSelectedState] = useState<string>('TX');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30 Days');
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [keywordData, setKeywordData] = useState<Record<string, {
    cityInterest: CityKeywordInterest[];
    regionInterest: RegionKeywordInterest[];
    relatedTopics: RelatedTopic[];
    risingQueries: RisingQuery[];
    aiSummary: AISummary | null;
    articles: MarketArticle[];
  }>>({});

  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const [errorKeywords, setErrorKeywords] = useState<string | null>(null);
  const [errorChart, setErrorChart] = useState<string | null>(null);
  const [errorSummaries, setErrorSummaries] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Record<string, string>>({});

  const debouncedCategories = useDebounce(selectedCategories, 300);
  const debouncedState = useDebounce(selectedState, 300);

  const fetchKeywords = useCallback(async () => {
    setLoadingKeywords(true);
    setErrorKeywords(null);

    console.log('🔍 Fetching keywords with categories:', debouncedCategories);

    try {
      let query = supabase
        .from('keywords')
        .select('*')
        .eq('is_active', true);

      if (debouncedCategories.length > 0) {
        query = query.in('category', debouncedCategories);
      }

      const { data, error } = await query.order('interest_score', { ascending: false });

      console.log('📊 Keywords response:', { data: data?.length, error });

      if (error) throw error;

      if (data) {
        console.log('✅ Keywords loaded:', data.length, 'keywords');
        setKeywords(data);
        const keywordNames = data.slice(0, 4).map(k => k.name);
        console.log('🎯 Active keywords set:', keywordNames);
        setActiveKeywords(keywordNames);
        const initialExpanded = keywordNames.reduce((acc, name) => {
          acc[name] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedSections(initialExpanded);
      }
    } catch (error) {
      console.error('❌ Error fetching keywords:', error);
      setErrorKeywords('Failed to load keywords. Please try again.');
      setKeywords([]);
    } finally {
      setLoadingKeywords(false);
    }
  }, [debouncedCategories]);

  const fetchChartData = useCallback(async (keywordsToFetch: Keyword[], activeKws: string[]) => {
    const keywordIds = keywordsToFetch
      .filter(k => activeKws.includes(k.name))
      .map(k => k.id);

    if (keywordIds.length === 0) {
      setChartData([]);
      return;
    }

    setLoadingChart(true);
    setErrorChart(null);

    try {
      const { data, error } = await supabase
        .from('keyword_daily_trends')
        .select('*')
        .in('keyword_id', keywordIds)
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        const grouped = data.reduce((acc: Record<string, Record<string, number>>, trend: KeywordDailyTrend) => {
          const keyword = keywordsToFetch.find(k => k.id === trend.keyword_id);
          if (!keyword) return acc;

          if (!acc[trend.date]) {
            acc[trend.date] = {};
          }
          acc[trend.date][keyword.name] = trend.interest_score;
          return acc;
        }, {});

        const chartPoints: ChartDataPoint[] = Object.entries(grouped).map(([date, scores]) => ({
          date,
          ...(scores as Record<string, number>)
        }));

        setChartData(chartPoints);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setErrorChart('Failed to load chart data. Please try again.');
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  const fetchKeywordDetails = useCallback(async (keywordName: string, keywordsToSearch: Keyword[]) => {
    const keyword = keywordsToSearch.find(k => k.name === keywordName);
    if (!keyword) {
      console.log(`⚠️ Keyword not found in list: ${keywordName}`);
      return;
    }

    console.log(`🔍 Fetching details for: ${keywordName}, ID: ${keyword.id}, State: ${debouncedState}`);

    setLoadingDetails(prev => ({ ...prev, [keywordName]: true }));
    setErrorDetails(prev => {
      const newErrors = { ...prev };
      delete newErrors[keywordName];
      return newErrors;
    });

    try {
      const [cityRes, regionRes, topicsRes, queriesRes, summaryRes, articlesRes] = await Promise.all([
        supabase
          .from('city_keyword_interest')
          .select('*, city:cities!inner(*)')
          .eq('keyword_id', keyword.id)
          .eq('city.state', debouncedState)
          .order('rank', { ascending: true })
          .limit(10),
        supabase
          .from('region_keyword_interest')
          .select('*, region:regions(*)')
          .eq('keyword_id', keyword.id),
        supabase
          .from('related_topics')
          .select('*')
          .eq('keyword_id', keyword.id)
          .order('growth_percentage', { ascending: false })
          .limit(5),
        supabase
          .from('rising_queries')
          .select('*')
          .eq('keyword_id', keyword.id)
          .order('growth_percentage', { ascending: false })
          .limit(5),
        supabase
          .from('ai_summaries')
          .select('*')
          .eq('keyword_id', keyword.id)
          .maybeSingle(),
        supabase
          .from('market_articles')
          .select('*')
          .eq('keyword_id', keyword.id)
          .order('published_at', { ascending: false })
          .limit(3)
      ]);

      console.log(`📊 ${keywordName} - Results:`, {
        cities: cityRes.data?.length,
        regions: regionRes.data?.length,
        topics: topicsRes.data?.length,
        queries: queriesRes.data?.length,
        summary: !!summaryRes.data,
        articles: articlesRes.data?.length,
        errors: {
          city: cityRes.error?.message,
          region: regionRes.error?.message,
          topics: topicsRes.error?.message,
          queries: queriesRes.error?.message,
          summary: summaryRes.error?.message,
          articles: articlesRes.error?.message
        }
      });

      if (cityRes.error || regionRes.error || topicsRes.error || queriesRes.error || summaryRes.error || articlesRes.error) {
        throw new Error('Failed to fetch keyword details');
      }

      console.log(`✅ ${keywordName} - Data loaded successfully`);

      setKeywordData(prev => ({
        ...prev,
        [keywordName]: {
          cityInterest: cityRes.data || [],
          regionInterest: regionRes.data || [],
          relatedTopics: topicsRes.data || [],
          risingQueries: queriesRes.data || [],
          aiSummary: summaryRes.data,
          articles: articlesRes.data || []
        }
      }));
    } catch (error) {
      console.error(`❌ Error fetching details for ${keywordName}:`, error);
      setErrorDetails(prev => ({
        ...prev,
        [keywordName]: 'Failed to load details for this keyword.'
      }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [keywordName]: false }));
    }
  }, [debouncedState]);

  const fetchMonthlySummaries = useCallback(async () => {
    setLoadingSummaries(true);
    setErrorSummaries(null);

    try {
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .order('month', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data) {
        setMonthlySummaries(data);
      }
    } catch (error) {
      console.error('Error fetching monthly summaries:', error);
      setErrorSummaries('Failed to load monthly summaries.');
      setMonthlySummaries([]);
    } finally {
      setLoadingSummaries(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywords();
    fetchMonthlySummaries();
  }, [fetchKeywords, fetchMonthlySummaries]);

  useEffect(() => {
    setKeywordData({});
  }, [debouncedState]);

  useEffect(() => {
    if (keywords.length > 0 && activeKeywords.length > 0) {
      fetchChartData(keywords, activeKeywords);

      activeKeywords.forEach(keyword => {
        fetchKeywordDetails(keyword, keywords);
      });
    } else {
      setChartData([]);
    }
  }, [keywords, activeKeywords, debouncedState, fetchChartData, fetchKeywordDetails]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.length > 1 ? prev.filter(c => c !== category) : prev
        : [...prev, category]
    );
  }, []);

  const removeKeyword = useCallback((keyword: string) => {
    setActiveKeywords(prev => prev.filter(k => k !== keyword));
    setExpandedSections(prev => {
      const newSections = { ...prev };
      delete newSections[keyword];
      return newSections;
    });
  }, []);

  const toggleSection = useCallback((keyword: string) => {
    const isCurrentlyExpanded = expandedSections[keyword];

    setExpandedSections(prev => ({
      ...prev,
      [keyword]: !prev[keyword]
    }));

    if (!isCurrentlyExpanded && !keywordData[keyword] && !loadingDetails[keyword]) {
      console.log(`Expanding ${keyword} - fetching data`);
      fetchKeywordDetails(keyword, keywords);
    }
  }, [expandedSections, keywordData, loadingDetails, keywords, fetchKeywordDetails]);

  const handleExport = useCallback(() => {
    alert('Report exported successfully!');
  }, []);

  const handleShare = useCallback(() => {
    alert('Link copied to clipboard!');
  }, []);

  const handleSaveSearch = useCallback(() => {
    alert('Search saved successfully!');
  }, []);

  const activeKeywordData = useMemo(() =>
    keywords.filter(k => activeKeywords.includes(k.name)),
    [keywords, activeKeywords]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {showBanner && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-600" />
              <p className="text-xs text-slate-700">
                This dashboard displays historical sample data. Real-time integration launching Q4 2025.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-slate-500 hover:text-slate-700"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Header
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
        onExport={handleExport}
        onShare={handleShare}
        onSaveSearch={handleSaveSearch}
      />

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricCard icon={MapPin} title="Top Market" value="Austin, TX" subtitle="Luxury Condos +45%" />
          <MetricCard icon={Star} title="Saved Searches" value="12" subtitle="Active Saved Searches" />
          <MetricCard icon={Clock} title="Last Updated" value="2 hours ago" subtitle="Data Refresh Status" />
          <MetricCard icon={Zap} title="Hot Alerts" value="3" subtitle="Breakout Trends" />
        </div>

        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {categories.map(category => (
              <CategoryButton
                key={category.label}
                label={category.label}
                icon={category.icon}
                isActive={selectedCategories.includes(category.label)}
                onClick={() => toggleCategory(category.label)}
              />
            ))}
          </div>
        </div>

        {errorKeywords && (
          <div className="mb-6">
            <ErrorMessage message={errorKeywords} onRetry={fetchKeywords} />
          </div>
        )}

        {loadingKeywords ? (
          <div className="mb-6">
            <LoadingSpinner size="lg" className="py-8" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="mb-6">
            <EmptyState
              icon={FileQuestion}
              title="No Keywords Found"
              description="No keywords match the selected categories. Try selecting different categories or check back later for new data."
              action={{
                label: 'Reset Filters',
                onClick: () => setSelectedCategories(['Residential Buying'])
              }}
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                {activeKeywords.map(keyword => (
                  <KeywordTag
                    key={keyword}
                    keyword={keyword}
                    onRemove={() => removeKeyword(keyword)}
                  />
                ))}
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-medium hover:border-blue-900 hover:text-blue-900 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add Keyword
                </button>
              </div>
            </div>

            {loadingSummaries ? (
              <div className="mb-6 flex gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 min-w-72 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-32 mb-3"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-4 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : errorSummaries ? (
              <div className="mb-6">
                <ErrorMessage message={errorSummaries} onRetry={fetchMonthlySummaries} />
              </div>
            ) : monthlySummaries.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-3 overflow-x-auto pb-3">
                  {monthlySummaries.map(summary => (
                    <div key={summary.id} className="bg-white border border-slate-200 rounded-lg p-4 min-w-72">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">
                        {new Date(summary.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="space-y-2">
                        {summary.top_keywords.map((kw, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {index === 0 && <Trophy className="w-3.5 h-3.5 text-slate-600" />}
                              <span className="text-xs font-medium text-slate-700">{kw.keyword}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-900">{kw.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeKeywordData.map(keyword => {
              const details = keywordData[keyword.name];
              const isExpanded = expandedSections[keyword.name];
              const isLoading = loadingDetails[keyword.name];
              const error = errorDetails[keyword.name];

              return (
                <div key={keyword.id} className="bg-white border border-slate-200 rounded-lg mb-4 overflow-hidden">
                  <button
                    onClick={() => toggleSection(keyword.name)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">{keyword.name}</h2>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                        {keyword.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-slate-50 rounded">
                        <span className="text-sm font-bold text-slate-900">{keyword.interest_score}/100</span>
                      </div>
                      <div className={`flex items-center gap-1 font-semibold text-xs ${keyword.trend_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {keyword.trend_percentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                        <span>{keyword.trend_percentage > 0 ? '+' : ''}{keyword.trend_percentage.toFixed(0)}%</span>
                      </div>
                      {isLoading && isExpanded ? (
                        <LoadingSpinner size="sm" />
                      ) : isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-6">
                      {isLoading ? (
                        <div className="py-8">
                          <LoadingSpinner size="md" />
                        </div>
                      ) : error ? (
                        <ErrorMessage
                          message={error}
                          onRetry={() => fetchKeywordDetails(keyword.name, keywords)}
                        />
                      ) : details ? (
                        <>
                          {details.cityInterest.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900 mb-3">Interest by City - Top 10 Markets</h3>
                              <div className="bg-slate-50 rounded p-3">
                                {details.cityInterest.map((city, index) => (
                                  <CityRankingItem
                                    key={city.id}
                                    rank={index + 1}
                                    cityName={city.city?.full_name || 'Unknown City'}
                                    score={city.interest_score}
                                    trendPercentage={city.trend_percentage}
                                    maxScore={100}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {details.regionInterest.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900 mb-3">Regional Distribution</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {details.regionInterest.map(region => (
                                  <RegionHeatmapCell
                                    key={region.id}
                                    regionName={region.region?.name || 'Unknown Region'}
                                    score={region.interest_score}
                                    intensityLevel={region.intensity_level}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-4">
                            {details.relatedTopics.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">Breakout Topics</h3>
                                <div className="space-y-2">
                                  {details.relatedTopics.map(topic => (
                                    <div key={topic.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                      <span className="text-xs font-medium text-slate-700">{topic.topic_name}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-xs font-bold ${topic.is_breakout ? 'text-green-600' : 'text-slate-600'}`}>
                                          +{topic.growth_percentage.toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {details.risingQueries.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">Rising Queries</h3>
                                <div className="space-y-2">
                                  {details.risingQueries.map(query => (
                                    <div key={query.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                                      <Search className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-700 break-words">{query.query_text}</p>
                                        <p className="text-xs text-green-600 font-bold mt-0.5">+{query.growth_percentage.toFixed(0)}%</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {details.aiSummary && (
                            <div className="bg-white border border-slate-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-900 rounded">
                                  <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-sm font-semibold text-slate-900 mb-1">AI Market Summary</h3>
                                  <p className="text-xs text-slate-600 mb-3">Analyzing current trends and market opportunities</p>
                                  <div className="text-slate-800 text-xs space-y-2 leading-relaxed">
                                    {details.aiSummary.summary_text.split('\n\n').map((paragraph, index) => (
                                      <p key={index}>{paragraph}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <EmptyState
                          icon={FileQuestion}
                          title="No Data Available"
                          description="Details for this keyword are not available at the moment."
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-500">
            © 2025 Real Estate Trends Explorer | Data updated every 2 hours
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
