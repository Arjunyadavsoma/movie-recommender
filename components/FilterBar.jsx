import { useState, useRef, useEffect } from 'react';

export default function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    genre: 'All',
    sortBy: 'popularity'
  });

  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const genreRef = useRef(null);
  const sortRef = useRef(null);

  const genres = [
    'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War'
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'recent', label: 'Recently Released' },
    { value: 'title', label: 'Alphabetical' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreRef.current && !genreRef.current.contains(event.target)) {
        setIsGenreOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsGenreOpen(false);
        setIsSortOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Close dropdowns
    setIsGenreOpen(false);
    setIsSortOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Label */}
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <span className="mr-2">🎭</span>
          Filters
        </h3>

        {/* Dropdowns Container */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          
          {/* Genre Dropdown */}
          <div ref={genreRef} className="relative w-full sm:w-48">
            <button
              onClick={() => {
                setIsGenreOpen(!isGenreOpen);
                setIsSortOpen(false);
              }}
              className="w-full px-4 py-3 bg-card-bg border border-gray-700 rounded-lg text-white hover:border-netflix transition-colors duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Genre:</span>
                <span className="font-semibold">{filters.genre}</span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 group-hover:text-netflix transition-all duration-200 ${
                  isGenreOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Genre Dropdown Menu */}
            {isGenreOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-gray-700 rounded-lg shadow-2xl z-20 max-h-80 overflow-y-auto">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleFilterUpdate('genre', genre)}
                    className={`w-full text-left px-4 py-3 transition-colors duration-150 border-b border-gray-800 last:border-b-0 ${
                      filters.genre === genre
                        ? 'bg-netflix text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{genre}</span>
                      {filters.genre === genre && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div ref={sortRef} className="relative w-full sm:w-56">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsGenreOpen(false);
              }}
              className="w-full px-4 py-3 bg-card-bg border border-gray-700 rounded-lg text-white hover:border-netflix transition-colors duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort:</span>
                <span className="font-semibold">
                  {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 group-hover:text-netflix transition-all duration-200 ${
                  isSortOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sort Dropdown Menu */}
            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-gray-700 rounded-lg shadow-2xl z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterUpdate('sortBy', option.value)}
                    className={`w-full text-left px-4 py-3 transition-colors duration-150 border-b border-gray-800 last:border-b-0 ${
                      filters.sortBy === option.value
                        ? 'bg-netflix text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {filters.sortBy === option.value && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Button - Only show if filters are active */}
          {(filters.genre !== 'All' || filters.sortBy !== 'popularity') && (
            <button
              onClick={() => {
                const resetFilters = { genre: 'All', sortBy: 'popularity' };
                setFilters(resetFilters);
                onFilterChange(resetFilters);
              }}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
              title="Reset filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.genre !== 'All' || filters.sortBy !== 'popularity') && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400">Active filters:</span>
          
          {filters.genre !== 'All' && (
            <span className="px-3 py-1 bg-netflix/20 border border-netflix/50 rounded-full text-netflix text-sm flex items-center gap-2">
              {filters.genre}
              <button 
                onClick={() => handleFilterUpdate('genre', 'All')}
                className="hover:bg-netflix/30 rounded-full p-0.5 transition-colors"
                title="Clear genre filter"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.sortBy !== 'popularity' && (
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-sm">
              {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
