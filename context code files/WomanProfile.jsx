
// const WomanProfile = () => {
//   return (
//     <div>
//       hi
//     </div>
//   )
// }

// export default WomanProfile


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { alertService } from '../../services/api';
import { WomanNav } from '../../components/BottomNav';
import toast from 'react-hot-toast';

export default function WomanProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Using user from context as fallback, could fetch full profile from API
        setProfile(user);
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          emergencyContact: user?.emergencyContact || '',
          emergencyPhone: user?.emergencyPhone || '',
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Replace with actual API call when available
      // await alertService.updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      setProfile({ ...profile, ...formData });
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 px-5 pt-12">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-gray-100" />
          ))}
        </div>
        <WomanNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="text-primary text-sm font-semibold hover:bg-primary/5 px-3 py-1.5 rounded-lg transition"
          >
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-4">
        {/* Profile avatar and basic info */}
        <div className="card flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center text-3xl border-2 border-primary/20 flex-shrink-0">
            👩
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{profile?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Personal Information</p>

          {/* Name */}
          <div className="card">
            <label className="text-xs font-semibold text-gray-600 uppercase">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium mt-1">{profile?.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="card">
            <label className="text-xs font-semibold text-gray-600 uppercase">Email Address</label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium mt-1">{profile?.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="card">
            <label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium mt-1">{profile?.phone || 'Not set'}</p>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">🚨 Emergency Contacts</p>

          {/* Emergency Contact Name */}
          <div className="card">
            <label className="text-xs font-semibold text-gray-600 uppercase">Contact Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="e.g., Mom, Sister"
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium mt-1">
                {profile?.emergencyContact || '—'}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div className="card">
            <label className="text-xs font-semibold text-gray-600 uppercase">Contact Phone</label>
            {editing ? (
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium mt-1">
                {profile?.emergencyPhone || '—'}
              </p>
            )}
          </div>
        </div>

        {/* Safety Preferences */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Safety Preferences</p>

          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Share location with trusted contacts</p>
              <p className="text-xs text-gray-500 mt-0.5">Allow emergency contacts to see your location</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked className="toggle-input" />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Allow notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">Get alerts about volunteer updates</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked className="toggle-input" />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Account Actions */}
        {editing && (
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-safe w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              '💾 Save Changes'
            )}
          </button>
        )}

        <div className="space-y-2 pt-4">
          <button
            onClick={handleLogout}
            className="btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>

        {/* Info footer */}
        <div className="card bg-blue-50 border-blue-100 text-center">
          <p className="text-xs text-blue-700 font-medium">
            Need help? <a href="mailto:support@example.com" className="underline">Contact Support</a>
          </p>
        </div>
      </div>

      <WomanNav />
    </div>
  );
}