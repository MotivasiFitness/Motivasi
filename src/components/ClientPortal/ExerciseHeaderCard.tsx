import { Dumbbell } from 'lucide-react';

interface ExerciseHeaderCardProps {
  exerciseNumber: number;
  exerciseName: string;
  focusArea?: string;
}

export default function ExerciseHeaderCard({ 
  exerciseNumber, 
  exerciseName, 
  focusArea 
}: ExerciseHeaderCardProps) {
  return (
    <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-soft-bronze/15 to-soft-bronze/5 border-2 border-soft-bronze/40 rounded-2xl p-6 lg:p-8">
        {/* Exercise Number Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-bronze/20 border border-soft-bronze/40 rounded-full mb-4">
          <Dumbbell size={14} className="text-soft-bronze" />
          <span className="text-xs font-bold text-soft-bronze uppercase tracking-wide">
            Exercise {exerciseNumber}
          </span>
        </div>

        {/* Exercise Name - Main Heading */}
        <h3 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-black mb-3">
          {exerciseName}
        </h3>

        {/* Focus Area - Supporting Copy */}
        {focusArea && (
          <p className="text-base lg:text-lg text-soft-bronze font-paragraph font-medium">
            Focus: {focusArea}
          </p>
        )}
      </div>
    </div>
  );
}
