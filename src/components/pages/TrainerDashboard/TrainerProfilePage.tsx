import { useState, useEffect, useRef } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Globe, Award, Briefcase, Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBackendEndpoint, BACKEND_FUNCTIONS, validateBackendResponse, isPreviewEnvironment } from '@/lib/backend-config';

// Trainer Profile Type
interface TrainerProfile {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  profilePhoto?: string;
  displayName?: string;
  bio?: string;
  specialisms?: string;
  certifications?: string;
  timeZone?: string;
  contactEmail?: string;
  memberId?: string;
}

// Upload states
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function TrainerProfilePage() {
  const { member } = useMember();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    specialisms: '',
    certifications: '',
    timeZone: '',
    contactEmail: '',
    profilePhoto: ''
  });
  
  // Photo upload states
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, [member]);

  const loadProfile = async () => {
    if (!member?._id) return;
    
    setIsLoading(true);
    try {
      console.log('[Profile Load] Loading profile for member:', member._id);
      const { items } = await BaseCrudService.getAll<TrainerProfile>('trainerprofiles');
      const existingProfile = items.find(p => p.memberId === member._id);
      
      if (existingProfile) {
        console.log('[Profile Load] Found existing profile:', existingProfile._id);
        console.log('[Profile Load] Profile photo URL:', existingProfile.profilePhoto);
        setProfile(existingProfile);
        setFormData({
          displayName: existingProfile.displayName || '',
          bio: existingProfile.bio || '',
          specialisms: existingProfile.specialisms || '',
          certifications: existingProfile.certifications || '',
          timeZone: existingProfile.timeZone || '',
          contactEmail: existingProfile.contactEmail || member.loginEmail || '',
          profilePhoto: existingProfile.profilePhoto || ''
        });
        setPhotoPreview(existingProfile.profilePhoto || '');
      } else {
        console.log('[Profile Load] No existing profile found, initializing with member data');
        // Initialize with member data
        const memberPhoto = member.profile?.photo?.url || '';
        console.log('[Profile Load] Member photo URL:', memberPhoto);
        setFormData(prev => ({
          ...prev,
          displayName: member.profile?.nickname || member.contact?.firstName || '',
          contactEmail: member.loginEmail || '',
          profilePhoto: memberPhoto
        }));
        setPhotoPreview(memberPhoto);
      }
    } catch (error) {
      console.error('[Profile Load] Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!member?._id) return;

    setIsSaving(true);
    try {
      console.log('[Profile Save] Starting save with data:', formData);
      
      if (profile?._id) {
        // Update existing profile
        console.log('[Profile Save] Updating existing profile:', profile._id);
        await BaseCrudService.update<TrainerProfile>('trainerprofiles', {
          _id: profile._id,
          ...formData
        });
        console.log('[Profile Save] Update successful');
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        });
      } else {
        // Create new profile
        console.log('[Profile Save] Creating new profile for member:', member._id);
        await BaseCrudService.create('trainerprofiles', {
          _id: crypto.randomUUID(),
          memberId: member._id,
          ...formData
        });
        console.log('[Profile Save] Create successful');
        toast({
          title: 'Success',
          description: 'Profile created successfully'
        });
      }
      
      // Reload profile to get latest data
      console.log('[Profile Save] Reloading profile data...');
      await loadProfile();
      
      // Trigger a custom event to notify other components (like sidebar) to refresh
      console.log('[Profile Save] Dispatching profile update event');
      window.dispatchEvent(new CustomEvent('trainerProfileUpdated'));
    } catch (error) {
      console.error('[Profile Save] Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Image compression and cropping utility
  const compressAndCropImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Target dimensions (square)
          const targetSize = 512;
          canvas.width = targetSize;
          canvas.height = targetSize;

          // Calculate crop dimensions (center square crop)
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;

          // Draw cropped and resized image
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, targetSize, targetSize
          );

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85 // Quality (85%)
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Upload image to Wix Media Manager
  const uploadImageToWix = async (blob: Blob, fileName: string): Promise<string> => {
    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Get the correct endpoint for the current environment using centralized config
    const uploadUrl = getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO);
    
    // Enhanced logging for debugging
    console.group('[Upload Debug] Profile Photo Upload');
    console.log('📤 Starting upload to:', uploadUrl);
    console.log('📁 File name:', fileName);
    console.log('📊 Blob size:', blob.size, 'bytes', `(${(blob.size / 1024).toFixed(2)} KB)`);
    console.log('🎨 Blob type:', blob.type);
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🔧 Environment:', isPreviewEnvironment() ? 'Preview/Dev' : 'Production');
    console.log('📍 Full URL:', window.location.origin + uploadUrl);
    console.groupEnd();

    let response: Response;
    let responseText: string = '';
    
    try {
      response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });

      // Capture response details BEFORE consuming the body
      const responseHeaders = Object.fromEntries(response.headers.entries());
      const contentType = response.headers.get('content-type') || 'unknown';
      
      console.group('[Upload Debug] Response Details');
      console.log('📡 Status:', response.status, response.statusText);
      console.log('🔗 Response URL:', response.url);
      console.log('📋 Content-Type:', contentType);
      console.log('📨 All Headers:', responseHeaders);
      console.groupEnd();

      // Try to get response text first (for debugging)
      responseText = await response.clone().text();
      
      console.group('[Upload Debug] Response Body');
      console.log('📄 Raw response (first 1000 chars):', responseText.substring(0, 1000));
      console.groupEnd();

      // Check if response is JSON
      if (!contentType.includes('application/json')) {
        console.error('❌ [Upload] ERROR: Expected JSON but got:', contentType);
        console.error('📄 [Upload] Response body:', responseText.substring(0, 500));
        
        // Provide specific error messages based on response
        if (response.status === 404) {
          throw new Error('Upload endpoint not found. The backend function may not be deployed correctly.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (contentType.includes('text/html')) {
          throw new Error('Received HTML instead of JSON. The backend function may have an error or routing issue.');
        } else {
          throw new Error(`Unexpected response type: ${contentType}. Expected JSON.`);
        }
      }

      // Parse JSON response
      const data = await response.json();
      console.log('✅ [Upload] Parsed JSON data:', data);

      if (!response.ok || !data.success) {
        // Throw specific error message from backend
        const errorMsg = data.error || `Upload failed with status ${response.status}`;
        console.error('❌ [Upload] Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // Validate URL is present
      if (!data.url) {
        console.error('❌ [Upload] No URL in response:', data);
        throw new Error('Upload succeeded but no URL was returned');
      }

      // Return the uploaded URL
      console.log('✅ [Upload] Upload successful! URL:', data.url);
      return data.url;
      
    } catch (error: any) {
      console.group('❌ [Upload Debug] Error Details');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (responseText) {
        console.error('Response text:', responseText.substring(0, 500));
      }
      console.groupEnd();
      
      // Re-throw with enhanced error message
      throw new Error(error.message || 'Failed to upload profile photo');
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[File Select] File selected:', file.name, file.size, file.type);

    // Reset states
    setUploadError('');
    setUploadStatus('idle');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const errorMsg = 'Please select a valid image file (JPG, PNG, or WebP)';
      console.error('[File Select] Invalid file type:', file.type);
      setUploadError(errorMsg);
      setUploadStatus('error');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const errorMsg = 'Image size must be less than 5MB';
      console.error('[File Select] File too large:', file.size);
      setUploadError(errorMsg);
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    console.log('[File Select] Starting upload process...');

    try {
      // Compress and crop image
      console.log('[File Select] Compressing and cropping image...');
      const compressedBlob = await compressAndCropImage(file);
      console.log('[File Select] Compressed blob size:', compressedBlob.size);

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedBlob);
      setPhotoPreview(previewUrl);
      console.log('[File Select] Preview URL created');

      // Upload to Wix
      console.log('[File Select] Uploading to Wix Media Manager...');
      const uploadedUrl = await uploadImageToWix(compressedBlob, file.name);
      console.log('[File Select] Upload successful! URL:', uploadedUrl);

      // Update form data with the uploaded URL
      setFormData(prev => {
        const updated = { ...prev, profilePhoto: uploadedUrl };
        console.log('[File Select] Updated form data:', updated);
        return updated;
      });
      
      // Update preview to use the actual uploaded URL
      setPhotoPreview(uploadedUrl);
      setUploadStatus('success');

      toast({
        title: 'Success',
        description: 'Photo uploaded successfully. Remember to save your profile.',
      });

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      console.error('[File Select] Upload error:', error);
      const errorMessage = error.message || 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      setUploadStatus('error');
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Handle remove photo
  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
    setPhotoPreview('');
    setUploadStatus('idle');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-white">
      <div className="max-w-[100rem] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-4">
            Trainer Profile
          </h1>
          <p className="font-paragraph text-lg text-warm-grey">
            Manage your professional profile and public information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Preview Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Profile Preview</CardTitle>
              <CardDescription>How others see you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={photoPreview || formData.profilePhoto} alt={formData.displayName} />
                    <AvatarFallback className="bg-soft-bronze text-soft-white text-3xl font-heading">
                      {formData.displayName?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  {uploadStatus === 'uploading' && (
                    <div className="absolute inset-0 bg-charcoal-black/50 rounded-full flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {uploadStatus === 'success' && (
                    <div className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full">
                      <CheckCircle size={16} />
                    </div>
                  )}
                  {uploadStatus === 'error' && (
                    <div className="absolute bottom-0 right-0 bg-destructive text-white p-2 rounded-full">
                      <AlertCircle size={16} />
                    </div>
                  )}
                  {uploadStatus === 'idle' && (
                    <div className="absolute bottom-0 right-0 bg-soft-bronze text-soft-white p-2 rounded-full">
                      <Camera size={16} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black">
                    {formData.displayName || 'Your Name'}
                  </h3>
                  {formData.specialisms && (
                    <p className="text-sm text-warm-grey mt-1">{formData.specialisms}</p>
                  )}
                </div>
              </div>

              {formData.bio && (
                <div className="pt-4 border-t border-warm-sand-beige">
                  <p className="text-sm text-charcoal-black line-clamp-4">{formData.bio}</p>
                </div>
              )}

              {formData.certifications && (
                <div className="pt-4 border-t border-warm-sand-beige">
                  <div className="flex items-start gap-2">
                    <Award size={16} className="text-soft-bronze mt-1 flex-shrink-0" />
                    <p className="text-sm text-charcoal-black">{formData.certifications}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Profile Information</CardTitle>
              <CardDescription>Update your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Camera size={16} className="text-soft-bronze" />
                  Profile Photo
                </Label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload controls */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={uploadStatus === 'uploading'}
                    variant="outline"
                    className="font-paragraph"
                  >
                    <Upload size={16} className="mr-2" />
                    {photoPreview || formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  
                  {(photoPreview || formData.profilePhoto) && (
                    <Button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadStatus === 'uploading'}
                      variant="outline"
                      className="font-paragraph text-destructive hover:text-destructive"
                    >
                      <X size={16} className="mr-2" />
                      Remove Photo
                    </Button>
                  )}
                </div>

                {/* Upload status messages */}
                {uploadStatus === 'uploading' && (
                  <Alert className="bg-soft-white border-soft-bronze">
                    <LoadingSpinner />
                    <AlertDescription className="ml-2">
                      Uploading and processing image...
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <AlertDescription className="ml-2 text-green-800">
                      Photo uploaded successfully! Don't forget to save your profile.
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === 'error' && uploadError && (
                  <Alert className="bg-red-50 border-destructive">
                    <AlertCircle size={16} className="text-destructive" />
                    <AlertDescription className="ml-2 text-destructive">
                      {uploadError}
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-xs text-warm-grey">
                  Upload a square photo (recommended 512x512px). Max file size: 5MB. 
                  Accepted formats: JPG, PNG, WebP. Images will be automatically cropped to a square and compressed.
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User size={16} className="text-soft-bronze" />
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="Your professional name"
                  className="font-paragraph"
                />
              </div>

              {/* Bio / Coaching Philosophy */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <Briefcase size={16} className="text-soft-bronze" />
                  Bio / Coaching Philosophy
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Share your coaching approach and philosophy..."
                  rows={5}
                  className="font-paragraph resize-none"
                />
                <p className="text-xs text-warm-grey">
                  This will be visible to clients and on your public profile
                </p>
              </div>

              {/* Specialisms */}
              <div className="space-y-2">
                <Label htmlFor="specialisms" className="flex items-center gap-2">
                  <Award size={16} className="text-soft-bronze" />
                  Specialisms
                </Label>
                <Input
                  id="specialisms"
                  value={formData.specialisms}
                  onChange={(e) => handleChange('specialisms', e.target.value)}
                  placeholder="e.g., Strength Training, Weight Loss, Sports Performance"
                  className="font-paragraph"
                />
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label htmlFor="certifications" className="flex items-center gap-2">
                  <Award size={16} className="text-soft-bronze" />
                  Certifications
                </Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  placeholder="List your certifications (one per line)"
                  rows={4}
                  className="font-paragraph resize-none"
                />
              </div>

              {/* Time Zone */}
              <div className="space-y-2">
                <Label htmlFor="timeZone" className="flex items-center gap-2">
                  <Globe size={16} className="text-soft-bronze" />
                  Time Zone
                </Label>
                <Input
                  id="timeZone"
                  value={formData.timeZone}
                  onChange={(e) => handleChange('timeZone', e.target.value)}
                  placeholder="e.g., GMT, EST, PST"
                  className="font-paragraph"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Mail size={16} className="text-soft-bronze" />
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  className="font-paragraph"
                />
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-warm-sand-beige">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-soft-bronze hover:bg-soft-bronze/90 text-soft-white font-paragraph"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
