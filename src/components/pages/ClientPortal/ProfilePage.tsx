import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import type { ClientProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, User, AlertCircle } from 'lucide-react';
import { upsertClientProfile, getClientProfile } from '@/lib/client-profile-service';

export default function ProfilePage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ClientProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [trainingExperience, setTrainingExperience] = useState('');
  const [fitnessGoalsCategory, setFitnessGoalsCategory] = useState('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [member]);

  const loadProfile = async () => {
    if (!member?.loginEmail) return;

    try {
      setIsLoading(true);
      // Use centralized service for data fetching
      const existingProfile = await getClientProfile(member.loginEmail, true); // Force refresh
      
      if (existingProfile) {
        setProfile(existingProfile);
        setFirstName(existingProfile.firstName || '');
        setLastName(existingProfile.lastName || '');
        setPhoneNumber(existingProfile.phoneNumber || '');
        setEmergencyContact(existingProfile.emergencyContact || '');
        setFitnessGoals(existingProfile.fitnessGoals || '');
        setDateOfBirth(existingProfile.dateOfBirth ? new Date(existingProfile.dateOfBirth).toISOString().split('T')[0] : '');
        setTrainingExperience(existingProfile.trainingExperience || '');
        setFitnessGoalsCategory(existingProfile.fitnessGoalsCategory || '');
        
        // Check if this is first-time setup (no firstName or lastName)
        if (!existingProfile.firstName || !existingProfile.lastName) {
          setIsFirstTimeSetup(true);
        }
      } else {
        // No profile exists - this is first-time setup
        setIsFirstTimeSetup(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!member?.loginEmail) return;

    // Validation
    setValidationError('');
    
    if (!firstName.trim()) {
      setValidationError('First name is required');
      return;
    }
    
    if (!lastName.trim()) {
      setValidationError('Last name is required');
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccess(false);

      const profileData: Partial<ClientProfiles> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        emergencyContact,
        fitnessGoals,
        dateOfBirth: dateOfBirth || undefined,
        trainingExperience: trainingExperience || undefined,
        fitnessGoalsCategory: fitnessGoalsCategory || undefined,
      };

      // Use centralized service - automatically handles cache invalidation
      const updatedProfile = await upsertClientProfile(member.loginEmail, profileData);
      
      // Update local state
      setProfile(updatedProfile);
      setSaveSuccess(true);
      
      // If this was first-time setup, navigate to dashboard after short delay
      if (isFirstTimeSetup) {
        setTimeout(() => {
          navigate('/portal', { replace: true });
        }, 1500);
      } else {
        // Hide success message after 3 seconds for regular updates
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setValidationError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-soft-bronze/10 flex items-center justify-center">
          <User className="w-6 h-6 text-soft-bronze" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-black">
            {isFirstTimeSetup ? 'Complete Your Profile' : 'My Profile'}
          </h1>
          <p className="text-warm-grey">
            {isFirstTimeSetup 
              ? 'Please provide your name to get started' 
              : 'Manage your personal information'}
          </p>
        </div>
      </div>

      {isFirstTimeSetup && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            👋 Welcome! Let's personalise your experience. Please tell us your name so we can greet you properly. This information is private and only shared with your assigned coach.
          </AlertDescription>
        </Alert>
      )}

      {validationError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {isFirstTimeSetup 
              ? 'Profile completed! Redirecting to your dashboard...' 
              : 'Profile updated successfully!'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {isFirstTimeSetup 
              ? 'We need your name to personalise your experience' 
              : 'Help us personalise your experience by providing your name and contact details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          {!isFirstTimeSetup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainingExperience">Training Experience</Label>
                <Select value={trainingExperience} onValueChange={setTrainingExperience}>
                  <SelectTrigger id="trainingExperience">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Returning after a break">Returning after a break</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Name and phone number"
                />
                <p className="text-sm text-warm-grey">Only used in case of emergency.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessGoalsCategory">Fitness Goals Category</Label>
                <Select value={fitnessGoalsCategory} onValueChange={setFitnessGoalsCategory}>
                  <SelectTrigger id="fitnessGoalsCategory">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                    <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                    <SelectItem value="General Fitness">General Fitness</SelectItem>
                    <SelectItem value="Athletic Performance">Athletic Performance</SelectItem>
                    <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessGoals">Fitness Goals (Details)</Label>
                <Textarea
                  id="fitnessGoals"
                  value={fitnessGoals}
                  onChange={(e) => setFitnessGoals(e.target.value)}
                  placeholder="Tell us more about your specific fitness goals..."
                  rows={4}
                />
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !firstName.trim() || !lastName.trim()}
              className="bg-soft-bronze hover:bg-soft-bronze/90"
            >
              {isSaving ? 'Saving...' : isFirstTimeSetup ? 'Complete Profile' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isFirstTimeSetup && (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-warm-grey">Email Address</Label>
              <p className="text-charcoal-black font-medium">{member?.loginEmail}</p>
            </div>
            <div>
              <Label className="text-warm-grey">Member Since</Label>
              <p className="text-charcoal-black font-medium">
                {member?._createdDate ? new Date(member._createdDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
