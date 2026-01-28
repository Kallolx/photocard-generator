'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      
      // The AuthContext will have the user with role, we need to get it
      // For now, we'll use a callback approach or refresh the page
      // Redirect will happen after state update
      
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-lora font-bold text-[#2c2419] mb-2">Newscard</h1>
          <p className="text-[#5d4e37] font-inter">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-[#d4c4b0] p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-[#f5e5d3] border-2 border-[#d4c4b0] p-3">
                <p className="text-[#8b6834] text-sm font-inter font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium font-inter text-[#2c2419] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium font-inter text-[#2c2419] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 border-2 border-[#d4c4b0] text-[#8b6834] focus:ring-[#8b6834]"
                />
                <span className="ml-2 text-sm font-inter text-[#5d4e37]">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm font-inter font-medium text-[#8b6834] hover:text-[#6b4e25]">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8b6834] text-[#faf8f5] py-3 px-4 font-inter font-semibold hover:bg-[#6b4e25] focus:outline-none focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-inter text-[#5d4e37]">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-[#8b6834] hover:text-[#6b4e25]">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-inter font-medium text-[#8b6834] hover:text-[#6b4e25]">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
