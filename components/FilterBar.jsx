import { useState } from 'react';

const GENRES = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War'
];

export default function FilterBar({ onFilterChange }) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    onFilterChange({ genre, sortBy });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    onFilterChange({ genre: selectedGenre, sortBy: sort });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Genre Pills */}
      <div>
        <label className="text-sm text-gray-400 mb-3 block font-semibold">Filter by Genre</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreChange(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedGenre === genre
                  ? 'bg-netflix text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400 font-semibold">Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-netflix cursor-pointer"
        >
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="recent">Most Recent</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
