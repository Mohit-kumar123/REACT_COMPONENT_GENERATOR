'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSessionStore } from '@/store';
import { sessionService } from '@/services/sessions';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewSessionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentSession } = useSessionStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await sessionService.createSession({
        title: formData.title || 'Untitled Session',
        description: formData.description,
      });

      if (response.success && response.data) {
        setCurrentSession(response.data.session);
        toast.success('Session created successfully!');
        router.push(`/dashboard/session/${response.data.session._id}`);
      } else {
        toast.error(response.message || 'Failed to create session');
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      toast.error('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Session</h1>
          <p className="text-slate-400">Start a new AI component generation session</p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plus size={20} />
            Session Details
          </CardTitle>
          <CardDescription>
            Provide details for your new component generation session
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Session Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter a title for your session"
                value={formData.title}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what you want to build..."
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Session
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Quick Start Options */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Start Templates</CardTitle>
          <CardDescription>
            Or start with a predefined template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start text-left"
              onClick={() => {
                setFormData({
                  title: 'UI Components',
                  description: 'Create reusable UI components like buttons, cards, and forms'
                });
              }}
            >
              <div className="font-medium text-white">UI Components</div>
              <div className="text-xs text-slate-400 mt-1">
                Buttons, cards, forms, and more
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start text-left"
              onClick={() => {
                setFormData({
                  title: 'Data Visualization',
                  description: 'Build charts, graphs, and interactive data displays'
                });
              }}
            >
              <div className="font-medium text-white">Data Visualization</div>
              <div className="text-xs text-slate-400 mt-1">
                Charts, graphs, and displays
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start text-left"
              onClick={() => {
                setFormData({
                  title: 'Layout Components',
                  description: 'Create responsive layouts, grids, and navigation components'
                });
              }}
            >
              <div className="font-medium text-white">Layout Components</div>
              <div className="text-xs text-slate-400 mt-1">
                Grids, navigation, and layouts
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto flex-col items-start text-left"
              onClick={() => {
                setFormData({
                  title: 'Interactive Elements',
                  description: 'Build interactive components with animations and state'
                });
              }}
            >
              <div className="font-medium text-white">Interactive Elements</div>
              <div className="text-xs text-slate-400 mt-1">
                Animations, state, and interactions
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
