'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface DebouncedSearchProps {
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

export const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  value = '',
  onSearch,
  placeholder = 'Search by name, ID, or keywords...',
  delay = 350,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, delay, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
      />
    </div>
  );
};
