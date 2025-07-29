'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ComponentVersion } from '@/types';
import { Code, Eye, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ComponentViewerProps {
  component: ComponentVersion;
  sessionId: string;
}

export default function ComponentViewer({ component, sessionId }: ComponentViewerProps) {
  const [activeTab, setActiveTab] = useState<'jsx' | 'css'>('jsx');

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${type} code copied to clipboard!`);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded!`);
  };

  const createPreviewContent = () => {
    const jsxCode = component.jsx || '// No JSX code available';
    const cssCode = component.css || '';
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Component Preview</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .preview-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
          }
          .error {
            color: #dc2626;
            background: #fef2f2;
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #fecaca;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            max-width: 500px;
            text-align: left;
          }
          .error strong { display: block; margin-bottom: 8px; color: #991b1b; }
          ${cssCode}
        </style>
      </head>
      <body>
        <div id="root" class="preview-container"></div>
        <script type="text/babel">
          try {
            ${jsxCode}
            const rootElement = document.getElementById('root');
            if (typeof ButtonComponent !== 'undefined') {
              ReactDOM.render(React.createElement(ButtonComponent), rootElement);
            } else if (typeof Component !== 'undefined') {
              ReactDOM.render(React.createElement(Component), rootElement);
            } else {
              rootElement.innerHTML = '<div class="error"><strong>Preview Notice:</strong><br>No renderable component found.</div>';
            }
          } catch (error) {
            document.getElementById('root').innerHTML = '<div class="error"><strong>Preview Error:</strong><br>' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[96vw] w-full h-[90vh] bg-slate-900 border-slate-700 p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-700">
          <DialogTitle className="text-white text-lg">
            Component v{component.version}
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-1">
            {component.generationPrompt || 'Generated Component'}
          </p>
        </DialogHeader>

        <div className="flex h-[calc(100%-5rem)] p-4 gap-4 overflow-hidden">
          <div className="w-2/3 flex flex-col min-w-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'jsx' | 'css')} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <TabsList className="bg-slate-800 border border-slate-600">
                  <TabsTrigger value="jsx" className="text-white data-[state=active]:bg-slate-700 px-3 py-1.5">
                    <Code size={14} className="mr-1.5" /> JSX
                  </TabsTrigger>
                  <TabsTrigger value="css" className="text-white data-[state=active]:bg-slate-700 px-3 py-1.5">
                    <Code size={14} className="mr-1.5" /> CSS
                  </TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700 text-xs" onClick={() => handleCopyCode(activeTab === 'jsx' ? component.jsx : component.css || '', activeTab.toUpperCase())}>
                    <Copy size={12} className="mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700 text-xs" onClick={() => handleDownload(activeTab === 'jsx' ? component.jsx : component.css || '', `component-v${component.version}.${activeTab}`)}>
                    <Download size={12} className="mr-1" /> Download
                  </Button>
                </div>
              </div>
              <TabsContent value="jsx" className="flex-1 m-0 overflow-hidden">
                <div className="bg-slate-800 rounded-lg border border-slate-600 h-full flex flex-col">
                  <div className="bg-slate-700 px-3 py-1.5 rounded-t-lg border-b border-slate-600">
                    <span className="text-slate-300 text-xs font-medium">Component.jsx</span>
                  </div>
                  <div className="flex-1 overflow-x-auto overflow-y-auto max-h-full">
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre p-3">
                      <code>{component.jsx || '// No JSX code available'}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="css" className="flex-1 m-0 overflow-hidden">
                <div className="bg-slate-800 rounded-lg border border-slate-600 h-full flex flex-col">
                  <div className="bg-slate-700 px-3 py-1.5 rounded-t-lg border-b border-slate-600">
                    <span className="text-slate-300 text-xs font-medium">styles.css</span>
                  </div>
                  <div className="flex-1 overflow-x-auto overflow-y-auto max-h-full">
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre p-3">
                      <code>{component.css || '/* No CSS code available */'}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-1/3 flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Eye size={16} /> Live Preview
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 text-xs"
                onClick={() => toast.info('Full screen preview coming soon!')}
              >
                <Eye size={12} className="mr-1" /> Full Screen
              </Button>
            </div>
            <div className="flex-1 bg-white rounded-lg border-2 border-slate-600 shadow-lg overflow-hidden">
              <iframe
                srcDoc={createPreviewContent()}
                className="w-full h-full"
                sandbox="allow-scripts"
                title="Component Preview"
              />
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-600 p-3 mt-3">
              <h4 className="text-white font-medium mb-2 text-xs">Component Details</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">{new Date(component.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Model:</span>
                  <span className="text-white">{component.metadata?.model || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tokens Used:</span>
                  <span className="text-white">{component.metadata?.tokens || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
