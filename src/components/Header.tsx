import { Download, Share2, Star, ChevronDown, BarChart3, User } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

interface HeaderProps {
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  onExport: () => void;
  onShare: () => void;
  onSaveSearch: () => void;
}

const usStates = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

const timeRanges = ['24 Hours', '7 Days', '30 Days', '90 Days', '12 Months'];

export function Header({
  selectedState,
  setSelectedState,
  selectedTimeRange,
  setSelectedTimeRange,
  onExport,
  onShare,
  onSaveSearch
}: HeaderProps) {
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);

  const stateMenuRef = useRef<HTMLDivElement>(null);
  const timeMenuRef = useRef<HTMLDivElement>(null);

  const closeStateMenu = useCallback(() => setShowStateMenu(false), []);
  const closeTimeMenu = useCallback(() => setShowTimeMenu(false), []);

  useClickOutside(stateMenuRef, closeStateMenu);
  useClickOutside(timeMenuRef, closeTimeMenu);

  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const selectedStateName = usStates.find(s => s.code === selectedState)?.name || selectedState;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-blue-900" />
              <h1 className="text-xl font-semibold text-slate-900">Real Estate Trends Explorer</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 mr-2">Last updated: {lastUpdated}</div>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded text-xs font-medium hover:bg-blue-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:border-slate-400 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>

            <button
              onClick={onSaveSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:border-slate-400 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              Save
            </button>

            <div className="relative" ref={stateMenuRef}>
              <button
                onClick={() => setShowStateMenu(!showStateMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:border-slate-400 transition-colors"
              >
                {selectedStateName}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showStateMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow py-1 max-h-80 overflow-y-auto">
                  {usStates.map((state) => (
                    <button
                      key={state.code}
                      onClick={() => {
                        setSelectedState(state.code);
                        setShowStateMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      {state.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={timeMenuRef}>
              <button
                onClick={() => setShowTimeMenu(!showTimeMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:border-slate-400 transition-colors"
              >
                {selectedTimeRange}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showTimeMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded shadow py-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedTimeRange(range);
                        setShowTimeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ml-2 pl-2 border-l border-slate-300">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
