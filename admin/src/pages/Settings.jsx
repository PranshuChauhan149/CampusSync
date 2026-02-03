import React, { useState } from 'react'
import { Save, Bell, Lock, Eye } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    maintenanceMode: false,
    apiRateLimit: 1000,
    sessionTimeout: 30,
  })

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage platform configuration and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Settings */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600">Receive email for important updates</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-900">Push Notifications</p>
                <p className="text-sm text-slate-600">Get real-time alerts on platform</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <Lock className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Security</h2>
          </div>

          <button className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors mb-3">
            Change Password
          </button>
          <button className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">
            Two-Factor Auth
          </button>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Advanced Settings</h2>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-slate-900">Maintenance Mode</p>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>
            <p className="text-sm text-slate-600">Put platform in maintenance mode for updates</p>
          </div>

          {/* API Rate Limit */}
          <div className="pb-6 border-b border-slate-200">
            <label className="block text-sm font-medium text-slate-900 mb-2">API Rate Limit (requests/hour)</label>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-slate-600 mt-2">Maximum API requests per hour per user</p>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-slate-600 mt-2">Auto-logout after idle time</p>
          </div>
        </div>
      </div>

      {/* Database Backup */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Database</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Last Backup</p>
            <p className="text-sm text-slate-600">2024-01-29 at 02:30 AM</p>
          </div>
          <button className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors">
            Backup Now
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  )
}
