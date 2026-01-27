'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual registration with proper validation
    // - Email verification
    // - Password strength checking
    // - CAPTCHA for bot prevention
    // - Rate limiting
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to login or onboarding
      router.push('/auth/login?registered=true');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
          <p className="text-[#5d4e37] font-inter">Create your account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white border-2 border-[#d4c4b0] p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-[#f5e5d3] border-2 border-[#d4c4b0] p-3">
                <p className="text-[#8b6834] text-sm font-inter font-medium">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium font-inter text-[#2c2419] mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                placeholder="John Doe"
              />
            </div>

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
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs font-inter text-[#5d4e37]">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium font-inter text-[#2c2419] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                placeholder="••••••••"
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="w-4 h-4 mt-1 border-2 border-[#d4c4b0] text-[#8b6834] focus:ring-[#8b6834]"
              />
              <label className="ml-2 text-sm font-inter text-[#5d4e37]">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-[#8b6834] hover:text-[#6b4e25]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-[#8b6834] hover:text-[#6b4e25]">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8b6834] text-[#faf8f5] py-3 px-4 font-inter font-semibold hover:bg-[#6b4e25] focus:outline-none focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-inter text-[#5d4e37]">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-[#8b6834] hover:text-[#6b4e25]">
                Sign in
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
