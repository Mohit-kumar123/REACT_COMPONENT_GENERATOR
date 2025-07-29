'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Component Generator
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          Generate beautiful, functional React components with AI assistance.
          Build faster, iterate quicker, and bring your ideas to life.
        </p>
        
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/register">
              Get Started
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">AI-Powered Generation</h3>
            <p className="text-slate-300">
              Describe your component in natural language and watch AI create clean, 
              functional React code with proper styling.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Live Preview</h3>
            <p className="text-slate-300">
              See your components come to life instantly with real-time preview 
              and interactive testing capabilities.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Export Ready</h3>
            <p className="text-slate-300">
              Download production-ready components with proper TypeScript types, 
              styling, and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
