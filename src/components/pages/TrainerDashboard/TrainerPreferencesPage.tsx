import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle, Loader, Plus, X } from 'lucide-react';
import {
  getTrainerPreferences,
  updateTrainerPreferences,
  TrainerPreferences,
} from '@/lib/ai/ai-program-generator';

const EXERCISE_OPTIONS = [
  'Barbell Squat',
  'Barbell Bench Press',
  'Barbell Deadlift',
  'Barbell Row',
  'Dumbbell Squat',
  'Dumbbell Bench Press',
  'Dumbbell Row',
  'Leg Press',
  'Leg Curl',
  'Leg Extension',
  'Chest Fly',
  'Lat Pulldown',
  'Pull-ups',
  'Push-ups',
  'Planks',
  'Kettlebell Swing',
  'Medicine Ball Slam',
  'Burpees',
  'Mountain Climbers',
  'Jumping Jacks',
];

export default function TrainerPreferencesPage() {
  const { member } = useMember();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<TrainerPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newFavorite, setNewFavorite] = useState('');
  const [newAvoided, setNewAvoided] = useState('');

  useEffect(() => {
    const loadPreferences = async () => {
      if (!member?._id) return;
      try {
        const prefs = await getTrainerPreferences(member._id);
        setPreferences(prefs);
      } catch (err) {
        setError('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [member?._id]);

  const handleSave = async () => {
    if (!preferences || !member?._id) return;

    setIsSaving(true);
    setError('');

    try {
      await updateTrainerPreferences(member._id, preferences);
      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFavorite = () => {
    if (!newFavorite.trim() || !preferences) return;
    if (preferences.favoriteExercises.includes(newFavorite)) {
      setError('Exercise already in favorites');
      return;
    }
    setPreferences({
      ...preferences,
      favoriteExercises: [...preferences.favoriteExercises, newFavorite],
    });
    setNewFavorite('');
  };

  const handleRemoveFavorite = (exercise: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      favoriteExercises: preferences.favoriteExercises.filter(e => e !== exercise),
    });
  };

  const handleAddAvoided = () => {
    if (!newAvoided.trim() || !preferences) return;
    if (preferences.avoidedExercises.includes(newAvoided)) {
      setError('Exercise already in avoided list');
      return;
    }
    setPreferences({
      ...preferences,
      avoidedExercises: [...preferences.avoidedExercises, newAvoided],
    });
    setNewAvoided('');
  };

  const handleRemoveAvoided = (exercise: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      avoidedExercises: preferences.avoidedExercises.filter(e => e !== exercise),
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
            Failed to Load Preferences
          </h1>
          <button
            onClick={() => navigate('/trainer')}
            className="bg-charcoal-black text-soft-white px-8 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Your Preferences
          </h1>
          <p className="font-paragraph text-lg text-warm-grey">
            Customize your coaching style and exercise preferences for AI program generation
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="font-paragraph text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="font-paragraph text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Coaching Tone */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Coaching Tone
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-4">
            How do you prefer to communicate with clients?
          </p>
          <div className="space-y-3">
            {(['motivational', 'technical', 'balanced'] as const).map((tone) => (
              <label key={tone} className="flex items-center gap-3 p-4 border border-warm-sand-beige rounded-lg hover:bg-warm-sand-beige/20 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="coachingTone"
                  value={tone}
                  checked={preferences.coachingTone === tone}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      coachingTone: e.target.value as 'motivational' | 'technical' | 'balanced',
                    })
                  }
                  className="w-4 h-4 accent-soft-bronze"
                />
                <div>
                  <p className="font-paragraph font-medium text-charcoal-black capitalize">
                    {tone}
                  </p>
                  <p className="font-paragraph text-xs text-warm-grey">
                    {tone === 'motivational'
                      ? 'Encouraging and supportive communication'
                      : tone === 'technical'
                      ? 'Detailed, form-focused instruction'
                      : 'Mix of motivation and technical guidance'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Rep Ranges */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Preferred Rep Ranges
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-6">
            These will be used as defaults in AI-generated programs
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {(['strength', 'hypertrophy', 'endurance'] as const).map((type) => (
              <div key={type}>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2 capitalize">
                  {type}
                </label>
                <input
                  type="text"
                  value={preferences.repRanges[type]}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      repRanges: {
                        ...preferences.repRanges,
                        [type]: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., 3-5"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rest Times */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Preferred Rest Times (seconds)
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-6">
            Default rest periods between sets for different training styles
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {(['strength', 'hypertrophy', 'endurance'] as const).map((type) => (
              <div key={type}>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2 capitalize">
                  {type}
                </label>
                <input
                  type="number"
                  value={preferences.restTimes[type]}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      restTimes: {
                        ...preferences.restTimes,
                        [type]: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  min="30"
                  max="300"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Exercises */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Favorite Exercises
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-6">
            Exercises you prefer to include in programs
          </p>

          {preferences.favoriteExercises.length > 0 && (
            <div className="mb-6 space-y-2">
              {preferences.favoriteExercises.map((exercise) => (
                <div
                  key={exercise}
                  className="flex items-center justify-between p-3 bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg"
                >
                  <p className="font-paragraph text-charcoal-black">{exercise}</p>
                  <button
                    onClick={() => handleRemoveFavorite(exercise)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={newFavorite}
              onChange={(e) => setNewFavorite(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
            >
              <option value="">Select an exercise...</option>
              {EXERCISE_OPTIONS.filter(
                (ex) => !preferences.favoriteExercises.includes(ex)
              ).map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddFavorite}
              disabled={!newFavorite}
              className="px-4 py-3 rounded-lg bg-soft-bronze text-soft-white font-medium hover:bg-soft-bronze/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </div>

        {/* Avoided Exercises */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Exercises to Avoid
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-6">
            Exercises you prefer not to include in programs
          </p>

          {preferences.avoidedExercises.length > 0 && (
            <div className="mb-6 space-y-2">
              {preferences.avoidedExercises.map((exercise) => (
                <div
                  key={exercise}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="font-paragraph text-charcoal-black">{exercise}</p>
                  <button
                    onClick={() => handleRemoveAvoided(exercise)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={newAvoided}
              onChange={(e) => setNewAvoided(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
            >
              <option value="">Select an exercise...</option>
              {EXERCISE_OPTIONS.filter(
                (ex) => !preferences.avoidedExercises.includes(ex)
              ).map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddAvoided}
              disabled={!newAvoided}
              className="px-4 py-3 rounded-lg bg-red-600 text-soft-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </div>

        {/* Default Equipment */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Default Equipment
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-6">
            Equipment you typically have available for programs
          </p>
          <div className="space-y-2">
            {[
              'Dumbbells',
              'Barbell',
              'Machines',
              'Cables',
              'Resistance Bands',
              'Bodyweight',
              'Kettlebells',
              'Medicine Balls',
            ].map((equipment) => (
              <label
                key={equipment}
                className="flex items-center gap-3 p-3 border border-warm-sand-beige rounded-lg hover:bg-warm-sand-beige/20 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={preferences.defaultEquipment.includes(equipment)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences({
                        ...preferences,
                        defaultEquipment: [...preferences.defaultEquipment, equipment],
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        defaultEquipment: preferences.defaultEquipment.filter(
                          (eq) => eq !== equipment
                        ),
                      });
                    }
                  }}
                  className="w-4 h-4 accent-soft-bronze"
                />
                <span className="font-paragraph text-charcoal-black">{equipment}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-charcoal-black text-soft-white py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Preferences
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/trainer')}
            className="flex-1 bg-warm-sand-beige text-charcoal-black py-4 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
