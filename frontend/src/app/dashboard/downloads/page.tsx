'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store';
import { ArrowLeft, Download, FileText, Code, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadsPage() {
  const router = useRouter();
  const { sessions } = useSessionStore();
  const [loading, setLoading] = useState(false);

  const handleDownloadComponent = async (session: any, component: any) => {
    try {
      setLoading(true);
      
      // Create download content
      const content = {
        sessionTitle: session.title || 'Untitled Session',
        componentVersion: component.version,
        jsx: component.jsx,
        css: component.css,
        props: component.props || {},
        generatedAt: new Date().toISOString(),
        prompt: component.generationPrompt,
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title || 'component'}-v${component.version}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Component downloaded successfully!');
    } catch (error) {
      console.error('Failed to download component:', error);
      toast.error('Failed to download component');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCode = async (component: any, type: 'jsx' | 'css') => {
    try {
      const content = type === 'jsx' ? component.jsx : component.css;
      const extension = type === 'jsx' ? 'jsx' : 'css';
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `component-v${component.version}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} code downloaded successfully!`);
    } catch (error) {
      console.error('Failed to download code:', error);
      toast.error('Failed to download code');
    }
  };

  const getDownloadableComponents = () => {
    if (!sessions) return [];
    
    return sessions.flatMap(session => 
      (session.components || []).map(component => ({
        session,
        component,
        id: `${session._id}-${component.version}`,
      }))
    );
  };

  const downloadableComponents = getDownloadableComponents();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          <p className="text-slate-400">
            Download and export your generated components
          </p>
        </div>
      </div>

      {/* Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloadableComponents.length > 0 ? (
          downloadableComponents.map(({ session, component, id }) => (
            <Card key={id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {session.title || 'Untitled Session'}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={12} />
                  {new Date(component.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      Component v{component.version}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/session/${session._id}`)}
                    >
                      <Eye size={14} />
                    </Button>
                  </div>

                  {component.generationPrompt && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      "{component.generationPrompt}"
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownloadComponent(session, component)}
                      disabled={loading}
                    >
                      <Download size={14} className="mr-2" />
                      Download Full Component
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                        onClick={() => handleDownloadCode(component, 'jsx')}
                        disabled={loading}
                      >
                        <Code size={14} className="mr-1" />
                        JSX
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                        onClick={() => handleDownloadCode(component, 'css')}
                        disabled={loading}
                      >
                        <FileText size={14} className="mr-1" />
                        CSS
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 mb-4">
              No components available for download
            </div>
            <Button
              onClick={() => router.push('/dashboard/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Component
            </Button>
          </div>
        )}
      </div>

      {downloadableComponents.length > 0 && (
        <div className="mt-8 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-white font-medium mb-2">Download Formats</h3>
          <div className="text-sm text-slate-400 space-y-1">
            <p><strong>Full Component:</strong> JSON file with complete component data, metadata, and generation prompt</p>
            <p><strong>JSX:</strong> React component code file</p>
            <p><strong>CSS:</strong> Stylesheet file for the component</p>
          </div>
        </div>
      )}
    </div>
  );
}
