import { useState, useEffect, useRef, useCallback } from 'react';
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
import { getBackendEndpoint, BACKEND_FUNCTIONS, isPreviewEnvironment } from '@/lib/backend-config';

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
  }, [member?._id]);

  const loadProfile = async () => {
    if (!member?._id) return;

    setIsLoading(true);
    try {
      const { items } = await BaseCrudService.getAll<TrainerProfile>('trainerprofiles');
      const existingProfile = items.find((p) => p.memberId === member._id);

      if (existingProfile) {
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
        const memberPhoto = member.profile?.photo?.url || '';
        setProfile(null);
        setFormData((prev) => ({
          ...prev,
          displayName: member.profile?.nickname || member.contact?.firstName || '',
          contactEmail: member.loginEmail || '',
          profilePhoto: memberPhoto
        }));
        setPhotoPreview(memberPhoto);
      }
    } catch (error) {
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
      if (profile?._id) {
        await BaseCrudService.update<TrainerProfile>('trainerprofiles', {
          _id: profile._id,
          ...formData
        });
        toast({ title: 'Success', description: 'Profile updated successfully' });
      } else {
        await BaseCrudService.create('trainerprofiles', {
          _id: crypto.randomUUID(),
          memberId: member._id,
          ...formData
        });
        toast({ title: 'Success', description: 'Profile created successfully' });
      }

      await loadProfile();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trainerProfileUpdated'));
      }
    } catch (error) {
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image compression & crop utility (center square, 512x512)
  const compressAndCropImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Failed to get canvas context'));

          const targetSize = 512;
          canvas.width = targetSize;
          canvas.height = targetSize;

          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;

          ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Failed to compress image'));
              resolve(blob);
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = String(e.target?.result || '');
      };
      reader.readAsDataURL(file);
    });
  };

  // Convert Blob -> Data URL base64 (for Wix JSON upload)
  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image data'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  };

  // Upload image to Wix Media Manager (Base64 JSON to /_functions(-dev)/uploadProfilePhoto)
  const uploadImageToWix = async (blob: Blob, fileName: string): Promise<string> => {
    const uploadUrl = getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO);
    const base64DataUrl = await blobToDataUrl(blob);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        fileName: fileName || 'profile-photo.jpg',
        mimeType: blob.type || 'image/jpeg',
        base64: base64DataUrl
      })
    });

    const contentType = response.headers.get('content-type') || 'unknown';

    if (!contentType.includes('application/json')) {
      if (contentType.includes('text/html')) {
        throw new Error('Received HTML instead of JSON. The Wix HTTP function is not deployed/routing correctly.');
      }
      throw new Error(`Unexpected response type: ${contentType}. Expected JSON.`);
    }

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || data?.message || `Upload failed (HTTP ${response.status})`);
    }

    if (!data?.url) {
      throw new Error('Upload succeeded but no URL was returned');
    }

    return data.url as string;
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError('');
      setUploadStatus('idle');

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        const msg = 'Please select a valid image file (JPG, PNG, or WebP)';
        setUploadError(msg);
        setUploadStatus('error');
        toast({ title: 'Upload Failed', description: msg, variant: 'destructive' });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const msg = 'Image size must be less than 5MB';
        setUploadError(msg);
        setUploadStatus('error');
        toast({ title: 'Upload Failed', description: msg, variant: 'destructive' });
        return;
      }

      setUploadStatus('uploading');

      let localPreviewUrl = '';
      try {
        const compressedBlob = await compressAndCropImage(file);

        // Show local preview immediately while uploading
        localPreviewUrl = URL.createObjectURL(compressedBlob);
        setPhotoPreview(localPreviewUrl);

        const uploadedUrl = await uploadImageToWix(compressedBlob, file.name);

        // Persist URL to form state
        setFormData((prev) => ({ ...prev, profilePhoto: uploadedUrl }));
        setPhotoPreview(uploadedUrl);

        setUploadStatus('success');
        toast({
          title: 'Success',
          description: 'Photo uploaded successfully. Remember to save your profile.'
        });
      } catch (error: any) {
        const msg = error?.message || 'Failed to upload image. Please try again.';
        setUploadError(msg);
        setUploadStatus('error');
        toast({ title: 'Upload Failed', description: msg, variant: 'destructive' });
      } finally {
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      }
    },
    [toast]
  );

  // Remove photo
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: '' }));
    setPhotoPreview('');
    setUploadStatus('idle');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-4">Trainer Profile</h1>
          <p className="font-paragraph text-lg text-warm-grey">Manage your professional profile and public information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview */}
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
                  {formData.specialisms && <p className="text-sm text-warm-grey mt-1">{formData.specialisms}</p>}
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

          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Profile Information</CardTitle>
              <CardDescription>Update your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo upload */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Camera size={16} className="text-soft-bronze" />
                  Profile Photo
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

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

                {uploadStatus === 'uploading' && (
                  <Alert className="bg-soft-white border-soft-bronze">
                    <LoadingSpinner />
                    <AlertDescription className="ml-2">Uploading and processing image...</AlertDescription>
                  </Alert>
                )}

                {uploadStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <AlertDescription className="ml-2 text-green-800">
                      Photo uploaded successfully! Don&apos;t forget to save your profile.
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === 'error' && uploadError && (
                  <Alert className="bg-red-50 border-destructive">
                    <AlertCircle size={16} className="text-destructive" />
                    <AlertDescription className="ml-2 text-destructive">{uploadError}</AlertDescription>
                  </Alert>
                )}

                <p className="text-xs text-warm-grey">
                  Upload a square photo (recommended 512x512px). Max file size: 5MB. Accepted formats: JPG, PNG, WebP.
                  Images will be automatically cropped to a square and compressed.
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

              {/* Bio */}
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
                <p className="text-xs text-warm-grey">This will be visible to clients and on your public profile</p>
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
                  placeholder="e.g., Europe/London"
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

              {/* Save */}
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
