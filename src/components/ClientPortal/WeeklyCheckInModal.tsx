import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BaseCrudService } from '@/integrations';
import { CheckCircle2, Activity, Zap, AlertCircle } from 'lucide-react';

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  weekStartDate: string;
  clientId: string;
  trainerId: string;
  programCycleId?: string;
  onSubmitSuccess?: () => void;
}

export default function WeeklyCheckInModal({
  isOpen,
  onClose,
  weekNumber,
  weekStartDate,
  clientId,
  trainerId,
  programCycleId,
  onSubmitSuccess
}: WeeklyCheckInModalProps) {
  const [difficultyRating, setDifficultyRating] = useState<string>('');
  const [energyRating, setEnergyRating] = useState<string>('');
  const [sorenessRating, setSorenessRating] = useState<string>('');
  const [sorenessNotes, setSorenessNotes] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!difficultyRating || !energyRating || !sorenessRating) {
      alert('Please answer all required questions');
      return;
    }

    setIsSubmitting(true);

    try {
      await BaseCrudService.create('weeklycheckins', {
        _id: crypto.randomUUID(),
        clientId,
        trainerId,
        programCycleId: programCycleId || '',
        weekNumber,
        weekStartDate,
        difficultyRating,
        energyRating,
        sorenessRating,
        sorenessNotes: sorenessNotes || '',
        clientNotes: clientNotes || '',
        createdAt: new Date().toISOString()
      });

      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting weekly check-in:', error);
      alert('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl text-charcoal-black flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-soft-bronze" />
            Week {weekNumber} Complete!
          </DialogTitle>
          <DialogDescription className="font-paragraph text-base text-warm-grey">
            Great work completing this week! Take a moment to share how it went. Your feedback helps your coach support you better.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Difficulty Rating */}
          <div className="space-y-3">
            <Label className="font-paragraph text-lg font-medium text-charcoal-black flex items-center gap-2">
              <Activity className="w-5 h-5 text-soft-bronze" />
              How was this week overall? *
            </Label>
            <RadioGroup value={difficultyRating} onValueChange={setDifficultyRating}>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="Easy" id="difficulty-easy" />
                <Label htmlFor="difficulty-easy" className="font-paragraph cursor-pointer flex-1">
                  Easy - Felt comfortable throughout
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="Moderate" id="difficulty-moderate" />
                <Label htmlFor="difficulty-moderate" className="font-paragraph cursor-pointer flex-1">
                  Moderate - Challenging but manageable
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="Hard" id="difficulty-hard" />
                <Label htmlFor="difficulty-hard" className="font-paragraph cursor-pointer flex-1">
                  Hard - Really pushed my limits
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Energy Rating */}
          <div className="space-y-3">
            <Label className="font-paragraph text-lg font-medium text-charcoal-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-soft-bronze" />
              Energy levels *
            </Label>
            <RadioGroup value={energyRating} onValueChange={setEnergyRating}>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="Low" id="energy-low" />
                <Label htmlFor="energy-low" className="font-paragraph cursor-pointer flex-1">
                  Low - Felt tired most of the week
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="OK" id="energy-ok" />
                <Label htmlFor="energy-ok" className="font-paragraph cursor-pointer flex-1">
                  OK - Normal energy levels
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="High" id="energy-high" />
                <Label htmlFor="energy-high" className="font-paragraph cursor-pointer flex-1">
                  High - Felt energized and strong
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Soreness Rating */}
          <div className="space-y-3">
            <Label className="font-paragraph text-lg font-medium text-charcoal-black flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-soft-bronze" />
              Soreness / aches *
            </Label>
            <RadioGroup value={sorenessRating} onValueChange={setSorenessRating}>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="None" id="soreness-none" />
                <Label htmlFor="soreness-none" className="font-paragraph cursor-pointer flex-1">
                  None - No soreness
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="Mild" id="soreness-mild" />
                <Label htmlFor="soreness-mild" className="font-paragraph cursor-pointer flex-1">
                  Mild - Some soreness, nothing concerning
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="Moderate" id="soreness-moderate" />
                <Label htmlFor="soreness-moderate" className="font-paragraph cursor-pointer flex-1">
                  Moderate - Noticeable soreness
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-warm-grey/30 rounded-lg hover:border-soft-bronze transition-colors">
                <RadioGroupItem value="High" id="soreness-high" />
                <Label htmlFor="soreness-high" className="font-paragraph cursor-pointer flex-1">
                  High - Significant soreness or pain
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Soreness Notes (Optional) */}
          {sorenessRating && sorenessRating !== 'None' && (
            <div className="space-y-2">
              <Label htmlFor="soreness-notes" className="font-paragraph text-base text-charcoal-black">
                Which body areas? (Optional)
              </Label>
              <Textarea
                id="soreness-notes"
                value={sorenessNotes}
                onChange={(e) => setSorenessNotes(e.target.value)}
                placeholder="e.g., Lower back, shoulders, quads..."
                className="font-paragraph min-h-[80px]"
              />
            </div>
          )}

          {/* Client Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="client-notes" className="font-paragraph text-base text-charcoal-black">
              Any notes for your coach? (Optional)
            </Label>
            <Textarea
              id="client-notes"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Share any thoughts, questions, or feedback about this week..."
              className="font-paragraph min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-warm-grey/20">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-paragraph"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !difficultyRating || !energyRating || !sorenessRating}
            className="font-paragraph bg-soft-bronze hover:bg-soft-bronze/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
