import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    timezone: 'America/New_York',
    bio: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    sleepDiaryReminders: true,
    weeklyReports: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analyticsOptIn: true,
    marketingEmails: false
  });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        timezone: user.timezone || 'America/New_York',
        bio: user.profile?.bio || ''
      });
    }
  }, [user]);
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // In a real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings updated');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Privacy settings updated');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'billing', label: 'Billing', icon: 'CreditCard' },
    { id: 'support', label: 'Support', icon: 'HelpCircle' }
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-2xl">
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="success">
                      {user?.role === 'coach' ? 'Coach' : 'Client'}
                    </Badge>
                    <Badge variant="info">
                      {user?.role === 'coach' ? 'Active' : 'Enrolled'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Timezone</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="form-select"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="form-textarea"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={saving}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
          
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                <p className="text-gray-600">Choose how you want to be notified about updates and reminders.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via text message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-600">Get reminded about upcoming appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.appointmentReminders}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, appointmentReminders: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Sleep Diary Reminders</h4>
                    <p className="text-sm text-gray-600">Daily reminders to log your sleep</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sleepDiaryReminders}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, sleepDiaryReminders: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Receive weekly sleep progress reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSaveNotifications}
                  loading={saving}
                  disabled={saving}
                >
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Settings</h3>
                <p className="text-gray-600">Control how your data is used and shared.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Data Sharing</h4>
                    <p className="text-sm text-gray-600">Allow anonymized data sharing for research</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics</h4>
                    <p className="text-sm text-gray-600">Help improve our platform with usage analytics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.analyticsOptIn}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, analyticsOptIn: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.marketingEmails}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Data Download & Deletion</h4>
                <p className="text-sm text-gray-600 mb-4">You can download your data or request account deletion at any time.</p>
                
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" icon="Download">
                    Download My Data
                  </Button>
                  <Button variant="outline" size="sm" icon="Trash2">
                    Delete Account
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSavePrivacy}
                  loading={saving}
                  disabled={saving}
                >
                  Save Settings
                </Button>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing & Subscription</h3>
                <p className="text-gray-600">Manage your subscription and billing information.</p>
              </div>
              
              <div className="bg-gradient-to-br from-primary to-accent text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">Premium Plan</h4>
                    <p className="text-white opacity-90">Access to all features</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$49</p>
                    <p className="text-white opacity-90">per month</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <p className="text-sm text-white opacity-90">
                    Next billing date: February 15, 2024
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Payment Method</h4>
                    <p className="text-sm text-gray-600">**** **** **** 4242</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Billing Address</h4>
                    <p className="text-sm text-gray-600">123 Main St, City, State 12345</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Invoices</h4>
                    <p className="text-sm text-gray-600">View and download your invoices</p>
                  </div>
                  <Button variant="outline" size="sm" icon="Download">
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Cancel Subscription</h4>
                <p className="text-sm text-gray-600 mb-4">
                  You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
                
                <Button variant="outline" size="sm" icon="X">
                  Cancel Subscription
                </Button>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'support' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Support & Help</h3>
                <p className="text-gray-600">Get help and support for your account.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                      <ApperIcon name="MessageCircle" className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-gray-900">Contact Support</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Get help from our support team via email or chat.
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Us
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                      <ApperIcon name="BookOpen" className="w-4 h-4 text-info" />
                    </div>
                    <h4 className="font-medium text-gray-900">Help Center</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Browse our help articles and guides.
                  </p>
                  <Button variant="outline" size="sm">
                    View Articles
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Bug" className="w-4 h-4 text-warning" />
                    </div>
                    <h4 className="font-medium text-gray-900">Report Issue</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Report bugs or technical issues.
                  </p>
                  <Button variant="outline" size="sm">
                    Report Bug
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Lightbulb" className="w-4 h-4 text-success" />
                    </div>
                    <h4 className="font-medium text-gray-900">Feature Request</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Suggest new features or improvements.
                  </p>
                  <Button variant="outline" size="sm">
                    Suggest Feature
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Platform Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 text-gray-900">1.0.0</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 text-gray-900">January 2024</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;