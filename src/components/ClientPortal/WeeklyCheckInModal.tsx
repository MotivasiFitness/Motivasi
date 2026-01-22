import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [isFirstCheckIn, setIsFirstCheckIn] = useState(false);

  // Option card component for reusability
  const OptionCard = ({ 
    value, 
    label, 
    isSelected, 
    onClick, 
    icon 
  }: { 
    value: string; 
    label: string; 
    isSelected: boolean; 
    onClick: () => void;
    icon?: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-soft-bronze bg-soft-bronze/5'
          : 'border-warm-grey/20 bg-soft-white hover:border-warm-grey/40'
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <p className="font-paragraph text-base text-charcoal-black">{label}</p>
        </div>
      </div>
    </button>
  );

  // Check if this is the first check-in
  useEffect(() => {
    if (isOpen && clientId) {
      if (typeof window !== 'undefined') {
        const hasCompletedCheckIn = localStorage.getItem(`firstCheckInCompleted_${clientId}`);
        setIsFirstCheckIn(!hasCompletedCheckIn);
      }
    }
  }, [isOpen, clientId]);

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    
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

      // Mark first check-in as completed
      if (isFirstCheckIn) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`firstCheckInCompleted_${clientId}`, 'true');
        }
      }

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
            How was your week?
          </DialogTitle>
          <DialogDescription className="font-paragraph text-base text-warm-grey">
            Share your feedback to help your coach support you better. Your responses help us personalize your program and ensure you're progressing safely and effectively.
          </DialogDescription>
        </DialogHeader>

        {/* First-time education message */}
        {isFirstCheckIn && (
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 my-4">
            <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
              <strong>First check-in?</strong> There are no right or wrong answers here. This helps your coach understand how training <em>feels</em> for you, not just what you completed. Be honest—it's how we make your program work better for you.
            </p>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Difficulty Rating */}
          <div className="space-y-3">
            <Label className="font-paragraph text-lg font-medium text-charcoal-black flex items-center gap-2">
              <Activity className="w-5 h-5 text-soft-bronze" />
              How was this week overall? *
            </Label>
            <div className="space-y-2">
              <OptionCard
                value="Easy"
                label="Easy - Felt comfortable throughout"
                isSelected={difficultyRating === 'Easy'}
                onClick={() => setDifficultyRating('Easy')}
              />
              <OptionCard
                value="Moderate"
                label="Moderate - Challenging but manageable"
                isSelected={difficultyRating === 'Moderate'}
                onClick={() => setDifficultyRating('Moderate')}
              />
              <OptionCard
                value="Hard"
                label="Hard - Really pushed my limits"
                isSelected={difficultyRating === 'Hard'}
                onClick={() => setDifficultyRating('Hard')}
              />
            </div>
          </div>

          {/* Energy Rating */}
          <div className="space-y-3">
            <Label className="font-paragraph text-lg font-medium text-charcoal-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-soft-bronze" />
              Energy levels *
            </Label>
            <div className="space-y-2">
              <OptionCard
                value="Low"
                label="Low - Felt tired most of the week"
                isSelected={energyRating === 'Low'}
                onClick={() => setEnergyRating('Low')}
                icon={<Zap className="w-4 h-4 text-soft-bronze" />}
              />
              <OptionCard
                value="OK"
                label="OK - Normal energy levels"
                isSelected={energyRating === 'OK'}
                onClick={() => setEnergyRating('OK')}
                icon={
                  <div className="flex gap-0.5">
                    <Zap className="w-4 h-4 text-soft-bronze" />
                    <Zap className="w-4 h-4 text-soft-bronze" />
                  </div>
                }
              />
              <OptionCard
                value="High"
                label="High - Felt energized and strong"
                isSelected={energyRating === 'High'}
                onClick={() => setEnergyRating('High')}
                icon={
                  <div className="flex gap-0.5">
                    <Zap className="w-4 h-4 text-soft-bronze" />
                    <Zap className="w-4 h-4 text-soft-bronze" />
                    <Zap className="w-4 h-4 text-soft-bronze" />
                  </div>
                }
              />
            </div>
          </div>

          {/* Soreness Rating */}
          <div className="space-y-3">
            <Label className="font-paragraph text-lg font-medium text-charcoal-black flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-soft-bronze" />
              Soreness / aches *
            </Label>
            <div className="space-y-2">
              <OptionCard
                value="None"
                label="None - No soreness"
                isSelected={sorenessRating === 'None'}
                onClick={() => setSorenessRating('None')}
              />
              <OptionCard
                value="Mild"
                label="Mild - Some soreness, nothing concerning"
                isSelected={sorenessRating === 'Mild'}
                onClick={() => setSorenessRating('Mild')}
              />
              <OptionCard
                value="Moderate"
                label="Moderate - Noticeable soreness"
                isSelected={sorenessRating === 'Moderate'}
                onClick={() => setSorenessRating('Moderate')}
              />
              <OptionCard
                value="High"
                label="High - Significant soreness or pain"
                isSelected={sorenessRating === 'High'}
                onClick={() => setSorenessRating('High')}
              />
            </div>
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
