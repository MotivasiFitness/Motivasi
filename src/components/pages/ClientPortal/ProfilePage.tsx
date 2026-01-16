import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import type { ClientProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, User } from 'lucide-react';

export default function ProfilePage() {
  const { member } = useMember();
  const [profile, setProfile] = useState<ClientProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');

  useEffect(() => {
    loadProfile();
  }, [member]);

  const loadProfile = async () => {
    if (!member?.loginEmail) return;

    try {
      setIsLoading(true);
      const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
      const existingProfile = items.find(p => p.memberId === member.loginEmail);
      
      if (existingProfile) {
        setProfile(existingProfile);
        setFirstName(existingProfile.firstName || '');
        setLastName(existingProfile.lastName || '');
        setPhoneNumber(existingProfile.phoneNumber || '');
        setEmergencyContact(existingProfile.emergencyContact || '');
        setFitnessGoals(existingProfile.fitnessGoals || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!member?.loginEmail) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);

      const profileData: ClientProfiles = {
        _id: profile?._id || crypto.randomUUID(),
        memberId: member.loginEmail,
        firstName,
        lastName,
        phoneNumber,
        emergencyContact,
        fitnessGoals,
      };

      if (profile?._id) {
        // Update existing profile
        await BaseCrudService.update('clientprofiles', profileData);
      } else {
        // Create new profile
        await BaseCrudService.create('clientprofiles', profileData);
      }

      // Reload to get updated data
      await loadProfile();
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
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
          <h1 className="font-heading text-3xl font-bold text-charcoal-black">My Profile</h1>
          <p className="text-warm-grey">Manage your personal information</p>
        </div>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Help us personalize your experience by providing your name and contact details
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="fitnessGoals">Fitness Goals</Label>
            <Input
              id="fitnessGoals"
              value={fitnessGoals}
              onChange={(e) => setFitnessGoals(e.target.value)}
              placeholder="What are your fitness goals?"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !firstName || !lastName}
              className="bg-soft-bronze hover:bg-soft-bronze/90"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
