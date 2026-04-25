'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Truck,
  CreditCard,
  User,
  Bell,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  freeShippingThreshold: number;
  defaultShippingCharge: number;
  currency: string;
  razorpayKeyDisplay: string;
  enableCOD: boolean;
  enableOnlinePayment: boolean;
  orderNotifications: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'FOR',
  storeDescription: 'Premium Custom T-Shirts & Apparel',
  contactEmail: 'support@for.com',
  contactPhone: '+91 9876543210',
  freeShippingThreshold: 999,
  defaultShippingCharge: 79,
  currency: 'INR',
  razorpayKeyDisplay: '',
  enableCOD: false,
  enableOnlinePayment: true,
  orderNotifications: true,
  lowStockAlert: true,
  lowStockThreshold: 10,
};

type SectionKey = 'store' | 'shipping' | 'payment' | 'profile' | 'notifications';

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [savedMessage, setSavedMessage] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('store');

  // Admin profile
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('admin@for.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('forAdminSettings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch {
        // Use defaults
      }
    }
    const savedProfile = localStorage.getItem('forAdminProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setAdminName(profile.name || 'Admin');
        setAdminEmail(profile.email || 'admin@for.com');
      } catch {
        // Use defaults
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('forAdminSettings', JSON.stringify(settings));
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const saveProfile = () => {
    setPasswordError('');
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    localStorage.setItem('forAdminProfile', JSON.stringify({ name: adminName, email: adminEmail }));
    setSavedMessage('Profile updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const updateSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const sections: { key: SectionKey; label: string; icon: typeof Store }[] = [
    { key: 'store', label: 'Store Info', icon: Store },
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your store configuration</p>
      </div>

      {/* Success message */}
      {savedMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">{savedMessage}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Nav */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden lg:sticky lg:top-24">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
              {sections.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeSection === key
                      ? 'text-gray-900 border-black bg-gray-50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Store Info */}
          {activeSection === 'store' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Store Information</h2>
              <p className="text-sm text-gray-500 mb-6">Basic details about your store</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateSetting('storeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                  <textarea
                    value={settings.storeDescription}
                    onChange={(e) => updateSetting('storeDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => updateSetting('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Shipping */}
          {activeSection === 'shipping' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Shipping Settings</h2>
              <p className="text-sm text-gray-500 mb-6">Configure shipping charges and thresholds</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => updateSetting('freeShippingThreshold', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Charge (₹)</label>
                  <input
                    type="number"
                    value={settings.defaultShippingCharge}
                    onChange={(e) => updateSetting('defaultShippingCharge', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Applied to orders below the free shipping threshold</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Payment */}
          {activeSection === 'payment' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Settings</h2>
              <p className="text-sm text-gray-500 mb-6">Manage payment methods and gateway configuration</p>

              <div className="space-y-5">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Online Payment (Razorpay)</p>
                        <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableOnlinePayment}
                        onChange={(e) => updateSetting('enableOnlinePayment', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                    </label>
                  </div>

                  {settings.enableOnlinePayment && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-600">API keys are configured via environment variables</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Set <code className="px-1 py-0.5 bg-gray-100 rounded">RAZORPAY_KEY_ID</code> and{' '}
                        <code className="px-1 py-0.5 bg-gray-100 rounded">RAZORPAY_KEY_SECRET</code> in your .env file
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when the order is delivered</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableCOD}
                        onChange={(e) => updateSetting('enableCOD', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Profile</h2>
              <p className="text-sm text-gray-500 mb-6">Update your admin account details</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Min 6 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Re-enter password"
                        />
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {passwordError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={saveProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  <Save className="w-4 h-4" /> Update Profile
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-6">Configure how you receive alerts</p>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Order Notifications</p>
                    <p className="text-xs text-gray-500 mt-0.5">Get notified when new orders are placed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.orderNotifications}
                      onChange={(e) => updateSetting('orderNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Alerts</p>
                    <p className="text-xs text-gray-500 mt-0.5">Get alerted when products are running low</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.lowStockAlert}
                      onChange={(e) => updateSetting('lowStockAlert', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                  </label>
                </div>

                {settings.lowStockAlert && (
                  <div className="ml-4 p-4 bg-white border rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value) || 5)}
                      className="w-full max-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      min="1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Alert when stock falls below this number</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
