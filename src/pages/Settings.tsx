import { useState } from 'react';
import {
  User,
  Building,
  Shield,
  Bell,
  Key,
  Globe,
  FileText,
  Save,
  CheckCircle,
  Upload,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type SettingsTab = 'profile' | 'organization' | 'security' | 'notifications' | 'api' | 'kyc';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [kycStep, setKycStep] = useState(1);
  const currentUser = {
    name: user?.name || 'User',
    email: user?.email || 'user@complipay.ai',
    institution: user?.institution || 'Institution',
  };

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: User },
    { id: 'organization' as const, name: 'Organization', icon: Building },
    { id: 'kyc' as const, name: 'KYC Verification', icon: FileText },
    { id: 'security' as const, name: 'Security', icon: Shield },
    { id: 'notifications' as const, name: 'Notifications', icon: Bell },
    { id: 'api' as const, name: 'API Keys', icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and organization settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {currentUser.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Change Avatar
                  </button>
                  <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF. Max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <input
                    type="text"
                    defaultValue="Administrator"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option>UTC (GMT+0)</option>
                    <option>America/New_York (GMT-5)</option>
                    <option>Europe/London (GMT+0)</option>
                    <option>Asia/Singapore (GMT+8)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Organization Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.institution}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Type
                  </label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option>Financial Institution</option>
                    <option>Crypto Bank</option>
                    <option>Corporate Treasury</option>
                    <option>Payment Provider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Registered Address
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="123 Finance Street, New York, NY 10001, USA"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      defaultValue="REG-2024-12345"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      defaultValue="TAX-987654321"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">KYC Verification</h2>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                        step <= kycStep
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {step < kycStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-full h-1 mx-2 ${
                          step < kycStep ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                        style={{ width: '60px' }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div
                  className={`p-4 rounded-lg border ${
                    kycStep >= 1
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User className={`w-5 h-5 ${kycStep >= 1 ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="font-medium text-white">Personal Information</span>
                  </div>
                  <p className="text-sm text-slate-400">Name, email, and contact details</p>
                  {kycStep >= 1 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    kycStep >= 2
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className={`w-5 h-5 ${kycStep >= 2 ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="font-medium text-white">Document Upload</span>
                  </div>
                  <p className="text-sm text-slate-400">ID, passport, or driver's license</p>
                  {kycStep >= 2 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    kycStep >= 3
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className={`w-5 h-5 ${kycStep >= 3 ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="font-medium text-white">Address Verification</span>
                  </div>
                  <p className="text-sm text-slate-400">Proof of address documentation</p>
                  {kycStep >= 3 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    kycStep >= 4
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className={`w-5 h-5 ${kycStep >= 4 ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="font-medium text-white">Final Review</span>
                  </div>
                  <p className="text-sm text-slate-400">Compliance team verification</p>
                  {kycStep >= 4 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {kycStep < 4 && (
                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="font-medium text-white mb-4">Upload Documents</h3>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-300 mb-2">Drag and drop files here</p>
                    <p className="text-sm text-slate-400 mb-4">or click to browse</p>
                    <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors">
                      Select Files
                    </button>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setKycStep(Math.min(kycStep + 1, 4))}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Authenticator App</p>
                      <p className="text-sm text-slate-400">Google Authenticator or similar</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { title: 'Transaction Alerts', desc: 'Get notified for all transactions' },
                  { title: 'Compliance Alerts', desc: 'Receive compliance-related notifications' },
                  { title: 'AI Agent Updates', desc: 'Updates from AI automation tasks' },
                  { title: 'Security Alerts', desc: 'Important security notifications' },
                  { title: 'Weekly Reports', desc: 'Receive weekly summary reports' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">API Keys</h2>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <Key className="w-4 h-4" />
                  Generate New Key
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-white">Production API Key</p>
                      <p className="text-xs text-slate-400 mt-1">Created on Jan 10, 2024</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-slate-900 rounded text-sm text-slate-300 font-mono">
                      sk_live_••••••••••••••••••••••••
                    </code>
                    <button className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-lg transition-colors">
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-white">Test API Key</p>
                      <p className="text-xs text-slate-400 mt-1">Created on Jan 5, 2024</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 rounded">
                      Test
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-slate-900 rounded text-sm text-slate-300 font-mono">
                      sk_test_••••••••••••••••••••••••
                    </code>
                    <button className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-lg transition-colors">
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-400">API Rate Limits</p>
                    <p className="text-sm text-slate-300 mt-1">
                      Your current plan allows 10,000 API requests per minute. Contact support to increase limits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
