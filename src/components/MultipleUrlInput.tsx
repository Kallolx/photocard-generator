"use client";

import { useState } from "react";
import { Plus, X, Link2, Loader2, Download } from "lucide-react";

interface MultipleUrlInputProps {
  onUrlsSubmit: (urls: string[]) => void;
  isLoading: boolean;
  onDownloadAll: () => void;
  canDownloadAll: boolean;
}

export default function MultipleUrlInput({
  onUrlsSubmit,
  isLoading,
  onDownloadAll,
  canDownloadAll
}: MultipleUrlInputProps) {
  const [urls, setUrls] = useState<string[]>(['']);

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length > 0) {
      onUrlsSubmit(validUrls);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {urls.map((url, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              News Article URL {index + 1}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder="https://example.com/news-article"
                  className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
              
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlField(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-300"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addUrlField}
            className="flex items-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-200"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5" />
            Add URL
          </button>

          <button
            type="submit"
            disabled={isLoading || urls.filter(u => u.trim()).length === 0}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Photocards...
              </>
            ) : (
              `Generate ${urls.filter(u => u.trim()).length} Cards`
            )}
          </button>
        </div>
      </form>

      {canDownloadAll && (
        <button
          onClick={onDownloadAll}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download All as ZIP
        </button>
      )}
    </div>
  );
}