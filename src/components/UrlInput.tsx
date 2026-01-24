'use client';

import { useState, useEffect } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
  clearUrl?: boolean;
  onUrlCleared?: () => void;
}

export default function UrlInput({ onUrlSubmit, isLoading, clearUrl, onUrlCleared }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Clear URL when clearUrl prop changes to true
  useEffect(() => {
    if (clearUrl) {
      setUrl('');
      setError('');
      onUrlCleared?.();
    }
  }, [clearUrl, onUrlCleared]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url.trim());
      onUrlSubmit(url.trim());
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium font-dm-sans text-gray-700 mb-2">
            News Article URL
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="url"
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder="https://example.com/news-article"
              className="w-full pl-10 pr-4 py-3 text-gray-900 font-dm-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm font-dm-sans text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium font-dm-sans hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Photocard...
            </>
          ) : (
            'Generate Photocard'
          )}
        </button>
      </form>
    </div>
  );
}