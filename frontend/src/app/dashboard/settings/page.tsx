'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth';
import { ArrowLeft, User, Mail, Key, Palette, Cpu, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    theme: 'dark' as 'light' | 'dark',
    defaultModel: 'gemini-pro',
    autoSave: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        theme: user.preferences?.theme || 'dark',
        defaultModel: user.preferences?.defaultModel || 'gemini-pro',
        autoSave: user.preferences?.autoSave ?? true,
      });
    }
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Update user profile via API
      const profileData = {
        name: formData.name,
        email: formData.email,
        preferences: {
          theme: formData.theme,
          defaultModel: formData.defaultModel,
          autoSave: formData.autoSave,
        },
      };

      const response = await authService.updateProfile(profileData);
      
      if (response.success && response.data) {
        // Update local state with the response from server
        updateUser(response.data);
        toast.success('Settings saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User size={20} />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="your.email@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Application Preferences */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette size={20} />
              Application Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme" className="text-slate-300">Theme</Label>
              <select
                id="theme"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="defaultModel" className="text-slate-300">Default AI Model</Label>
              <select
                id="defaultModel"
                value={formData.defaultModel}
                onChange={(e) => handleInputChange('defaultModel', e.target.value)}
                className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={formData.autoSave}
                onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                className="rounded border-slate-600 bg-slate-700"
              />
              <Label htmlFor="autoSave" className="text-slate-300">
                Enable auto-save for sessions
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cpu size={20} />
              Account Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {user?.usage?.componentsGenerated || 0}
                </div>
                <div className="text-xs text-slate-400">Components Generated</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {user?.usage?.sessionsCreated || 0}
                </div>
                <div className="text-xs text-slate-400">Sessions Created</div>
              </div>
            </div>
            
            <div className="text-center p-3 bg-slate-700 rounded-lg">
              <div className="text-sm text-slate-300">Member since</div>
              <div className="text-sm text-slate-400">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Key size={20} />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.info('Password change functionality coming soon!')}
            >
              Change Password
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                localStorage.removeItem('auth_token');
                router.push('/auth/login');
              }}
            >
              Sign Out
            </Button>
            
            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Last login: {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save size={16} className="mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
