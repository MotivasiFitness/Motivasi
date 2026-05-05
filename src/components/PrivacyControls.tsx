import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

type PrivacySettings = {
  profileVisibility: 'public' | 'private' | 'coaches-only';
  dataCollection: boolean;
  marketingEmails: boolean;
  analyticsTracking: boolean;
  showProgressPhotos: boolean;
};

export default function PrivacyControls() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'coaches-only',
    dataCollection: true,
    marketingEmails: false,
    analyticsTracking: true,
    showProgressPhotos: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus('saving');
    
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleDownloadData = async () => {
    // In a real app, this would call an API to generate a data export
    alert('Your data export will be prepared and sent to your email within 24 hours.');
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would call an API to delete the account
    alert('Account deletion request submitted. We will process this within 30 days.');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Shield className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-text mb-2">
            Privacy & Data Controls
          </h1>
          <p className="font-paragraph text-base text-secondary-text">
            Manage how your data is collected, used, and shared. You have full control over your privacy settings.
          </p>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          saveStatus === 'saved' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="font-paragraph text-sm text-green-800">Settings saved successfully</p>
            </>
          ) : (
            <>
              <div className="animate-spin">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-paragraph text-sm text-blue-800">Saving your preferences...</p>
            </>
          )}
        </div>
      )}

      {/* Profile Visibility */}
      <div className="bg-light-contrast border border-secondary-bg rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <Eye className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary-text mb-2">
              Profile Visibility
            </h2>
            <p className="font-paragraph text-base text-secondary-text">
              Control who can see your profile and fitness information.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              value: 'private',
              label: 'Private',
              description: 'Only you can see your profile and data',
            },
            {
              value: 'coaches-only',
              label: 'Coaches Only',
              description: 'Your assigned coaches can see your profile and progress',
            },
            {
              value: 'public',
              label: 'Public',
              description: 'Your profile and testimonials may be featured on our website',
            },
          ].map((option) => (
            <label key={option.value} className="flex items-start gap-4 p-4 border border-secondary-bg rounded-lg hover:bg-secondary-bg/20 cursor-pointer transition-colors">
              <input
                type="radio"
                name="profileVisibility"
                value={option.value}
                checked={settings.profileVisibility === option.value}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                className="w-5 h-5 accent-accent mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-heading text-lg font-bold text-primary-text">
                  {option.label}
                </p>
                <p className="font-paragraph text-sm text-secondary-text">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Data Collection & Tracking */}
      <div className="bg-light-contrast border border-secondary-bg rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <Lock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary-text mb-2">
              Data Collection & Communications
            </h2>
            <p className="font-paragraph text-base text-secondary-text">
              Choose how we collect and use your data.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'dataCollection',
              label: 'Essential Data Collection',
              description: 'Allow us to collect data necessary to provide your coaching services',
              required: true,
            },
            {
              key: 'analyticsTracking',
              label: 'Analytics & Performance Tracking',
              description: 'Help us improve our website and services by tracking how you use them',
              required: false,
            },
            {
              key: 'marketingEmails',
              label: 'Marketing Communications',
              description: 'Receive emails about new programs, tips, and special offers',
              required: false,
            },
          ].map((item) => (
            <div key={item.key} className="flex items-start gap-4 p-4 border border-secondary-bg rounded-lg">
              <div className="flex-1">
                <p className="font-heading text-lg font-bold text-primary-text mb-1">
                  {item.label}
                  {item.required && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded ml-2">
                      Required
                    </span>
                  )}
                </p>
                <p className="font-paragraph text-sm text-secondary-text">
                  {item.description}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key as keyof PrivacySettings] as boolean}
                onChange={(e) => handleSettingChange(item.key as keyof PrivacySettings, e.target.checked)}
                disabled={item.required}
                className="w-5 h-5 accent-accent mt-1 flex-shrink-0 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Photos */}
      <div className="bg-light-contrast border border-secondary-bg rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <EyeOff className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary-text mb-2">
              Progress Photos
            </h2>
            <p className="font-paragraph text-base text-secondary-text">
              Control how your progress photos are used.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 border border-secondary-bg rounded-lg">
            <div className="flex-1">
              <p className="font-heading text-lg font-bold text-primary-text mb-1">
                Allow Use in Testimonials
              </p>
              <p className="font-paragraph text-sm text-secondary-text mb-3">
                Your progress photos may be featured as a testimonial on our website (with your explicit consent for each use).
              </p>
              <p className="font-paragraph text-xs text-secondary-text italic">
                You retain full ownership of your photos and can revoke this permission at any time.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showProgressPhotos}
              onChange={(e) => handleSettingChange('showProgressPhotos', e.target.checked)}
              className="w-5 h-5 accent-accent mt-1 flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-light-contrast border border-secondary-bg rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <Download className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary-text mb-2">
              Data Management
            </h2>
            <p className="font-paragraph text-base text-secondary-text">
              Download or delete your personal data.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDownloadData}
            className="w-full flex items-center justify-between gap-4 p-4 border border-soft-bronze rounded-lg hover:bg-soft-bronze/5 transition-colors"
          >
            <div className="text-left">
              <p className="font-heading text-lg font-bold text-charcoal-black">
                Download Your Data
              </p>
              <p className="font-paragraph text-sm text-warm-grey">
                Get a copy of all your personal data in a portable format (GDPR Right to Data Portability)
              </p>
            </div>
            <Download className="w-5 h-5 text-soft-bronze flex-shrink-0" />
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between gap-4 p-4 border border-destructive rounded-lg hover:bg-destructive/5 transition-colors"
          >
            <div className="text-left">
              <p className="font-heading text-lg font-bold text-destructive">
                Delete Account & Data
              </p>
              <p className="font-paragraph text-sm text-warm-grey">
                Permanently delete your account and all associated data (this action cannot be undone)
              </p>
            </div>
            <Trash2 className="w-5 h-5 text-destructive flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-soft-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
                  Delete Account?
                </h3>
                <p className="font-paragraph text-base text-warm-grey">
                  This action cannot be undone. All your data, programs, and progress will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-warm-grey/30 text-charcoal-black font-medium hover:bg-warm-grey/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-6 py-3 rounded-lg bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
        <h3 className="font-heading text-lg font-bold text-charcoal-black mb-4">
          Your Privacy Rights
        </h3>
        <ul className="space-y-3 font-paragraph text-base text-warm-grey">
          <li className="flex gap-3">
            <span className="text-soft-bronze font-bold">•</span>
            <span><span className="font-bold text-charcoal-black">Right to Access:</span> Request a copy of your data</span>
          </li>
          <li className="flex gap-3">
            <span className="text-soft-bronze font-bold">•</span>
            <span><span className="font-bold text-charcoal-black">Right to Rectification:</span> Correct inaccurate data</span>
          </li>
          <li className="flex gap-3">
            <span className="text-soft-bronze font-bold">•</span>
            <span><span className="font-bold text-charcoal-black">Right to Erasure:</span> Request deletion of your data</span>
          </li>
          <li className="flex gap-3">
            <span className="text-soft-bronze font-bold">•</span>
            <span><span className="font-bold text-charcoal-black">Right to Data Portability:</span> Download your data</span>
          </li>
          <li className="flex gap-3">
            <span className="text-soft-bronze font-bold">•</span>
            <span><span className="font-bold text-charcoal-black">Right to Object:</span> Opt out of certain processing</span>
          </li>
        </ul>
        <p className="font-paragraph text-sm text-warm-grey mt-6">
          For more information, see our <a href="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</a> or contact us at hello@motivasi.co.uk
        </p>
      </div>
    </div>
  );
}
