import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Save } from 'lucide-react';
import ProtectedDataService from '@/lib/protected-data-service';

interface NotificationPreferences {
  _id: string;
  trainerId: string;
  workoutCompletedEnabled: boolean;
  weekCompletedEnabled: boolean;
  reflectionSubmittedEnabled: boolean;
}

export default function TrainerNotificationSettings() {
  const { member } = useMember();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    _id: '',
    trainerId: '',
    workoutCompletedEnabled: true,
    weekCompletedEnabled: true,
    reflectionSubmittedEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member?._id) {
      loadPreferences();
    }
  }, [member]);

  const loadPreferences = async () => {
    if (!member?._id) return;

    setIsLoading(true);
    try {
      // Fetch preferences via protected gateway
      const result = await ProtectedDataService.getAll<NotificationPreferences>('trainernotificationpreferences');
      const existing = result.items.length > 0 ? result.items[0] : null;

      if (existing) {
        setPreferences(existing);
      } else {
        // Create default preferences
        const defaultPrefs: NotificationPreferences = {
          _id: crypto.randomUUID(),
          trainerId: member._id,
          workoutCompletedEnabled: true,
          weekCompletedEnabled: true,
          reflectionSubmittedEnabled: true,
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!member?._id) return;

    setIsSaving(true);
    try {
      // Check if preferences exist via protected gateway
      const result = await ProtectedDataService.getAll<NotificationPreferences>('trainernotificationpreferences');
      const existing = result.items.length > 0 ? result.items[0] : null;

      if (existing) {
        // Update existing via protected gateway
        await ProtectedDataService.update<NotificationPreferences>('trainernotificationpreferences', existing._id, {
          workoutCompletedEnabled: preferences.workoutCompletedEnabled,
          weekCompletedEnabled: preferences.weekCompletedEnabled,
          reflectionSubmittedEnabled: preferences.reflectionSubmittedEnabled,
        });
      } else {
        // Create new via protected gateway
        await ProtectedDataService.create('trainernotificationpreferences', preferences);
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
    setIsSaving(false);
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soft-bronze" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-soft-bronze" />
          <div>
            <CardTitle className="font-heading text-2xl">Notification Preferences</CardTitle>
            <CardDescription className="font-paragraph">
              Choose which client activities trigger notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workout Completed */}
        <div className="flex items-center justify-between p-4 bg-warm-sand-beige/20 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="workout-completed" className="font-paragraph font-medium text-charcoal-black">
              Workout Completed
            </Label>
            <p className="font-paragraph text-sm text-warm-grey">
              Get notified when a client completes a workout
            </p>
          </div>
          <Switch
            id="workout-completed"
            checked={preferences.workoutCompletedEnabled}
            onCheckedChange={(checked) => handleToggle('workoutCompletedEnabled', checked)}
          />
        </div>

        {/* Week Completed */}
        <div className="flex items-center justify-between p-4 bg-warm-sand-beige/20 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="week-completed" className="font-paragraph font-medium text-charcoal-black">
              Week Completed
            </Label>
            <p className="font-paragraph text-sm text-warm-grey">
              Get notified when a client completes all workouts in a week
            </p>
          </div>
          <Switch
            id="week-completed"
            checked={preferences.weekCompletedEnabled}
            onCheckedChange={(checked) => handleToggle('weekCompletedEnabled', checked)}
          />
        </div>

        {/* Reflection Submitted */}
        <div className="flex items-center justify-between p-4 bg-warm-sand-beige/20 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="reflection-submitted" className="font-paragraph font-medium text-charcoal-black">
              Post-Workout Reflection
            </Label>
            <p className="font-paragraph text-sm text-warm-grey">
              Get notified when a client submits a post-workout reflection
            </p>
          </div>
          <Switch
            id="reflection-submitted"
            checked={preferences.reflectionSubmittedEnabled}
            onCheckedChange={(checked) => handleToggle('reflectionSubmittedEnabled', checked)}
          />
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-soft-bronze hover:bg-soft-bronze/90 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
