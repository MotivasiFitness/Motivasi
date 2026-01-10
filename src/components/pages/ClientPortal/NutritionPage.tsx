import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { NutritionGuidance } from '@/entities';
import { Download, Calendar } from 'lucide-react';

export default function NutritionPage() {
  const { member } = useMember();
  const [nutritionGuidance, setNutritionGuidance] = useState<NutritionGuidance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNutrition = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<NutritionGuidance>('nutritionguidance');
        // Sort by date issued (most recent first)
        const sorted = items.sort((a, b) => 
          new Date(b.dateIssued || '').getTime() - new Date(a.dateIssued || '').getTime()
        );
        setNutritionGuidance(sorted);
      } catch (error) {
        console.error('Error fetching nutrition guidance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutrition();
  }, [member?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading nutrition guidance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Nutrition Guidance</h1>
        <p className="text-soft-white/90">
          Your personalized meal plans and nutrition recommendations
        </p>
      </div>

      {/* Nutrition Items */}
      {nutritionGuidance.length > 0 ? (
        <div className="space-y-6">
          {nutritionGuidance.map((guidance) => (
            <div key={guidance._id} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
                    {guidance.guidanceTitle}
                  </h2>
                  {guidance.dateIssued && (
                    <div className="flex items-center gap-2 text-warm-grey text-sm">
                      <Calendar size={16} />
                      <span>
                        Issued: {new Date(guidance.dateIssued).toLocaleDateString('en-GB', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
                {guidance.supportingDocument && (
                  <a
                    href={guidance.supportingDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze/90 transition-colors text-sm font-medium ml-4 flex-shrink-0"
                  >
                    <Download size={16} />
                    Download
                  </a>
                )}
              </div>

              {guidance.overview && (
                <div className="mb-6">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                    Overview
                  </h3>
                  <p className="text-charcoal-black whitespace-pre-wrap">
                    {guidance.overview}
                  </p>
                </div>
              )}

              {guidance.mealPlanDetails && (
                <div className="mb-6 p-6 bg-warm-sand-beige/30 rounded-xl">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                    Meal Plan Details
                  </h3>
                  <p className="text-charcoal-black whitespace-pre-wrap">
                    {guidance.mealPlanDetails}
                  </p>
                </div>
              )}

              {guidance.dietaryNotes && (
                <div className="p-6 bg-soft-white border border-warm-sand-beige rounded-xl">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                    Dietary Notes
                  </h3>
                  <p className="text-charcoal-black whitespace-pre-wrap">
                    {guidance.dietaryNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <p className="text-warm-grey mb-4">
            Your personalized nutrition guidance will be added soon.
          </p>
          <p className="text-warm-grey text-sm">
            Once your trainer creates your meal plan, it will appear here.
          </p>
        </div>
      )}

      {/* Nutrition Tips */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
          Nutrition Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">💧 Stay Hydrated</h4>
            <p className="text-warm-grey text-sm">
              Drink at least 2-3 liters of water daily. Proper hydration supports recovery and performance.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">🥗 Eat Whole Foods</h4>
            <p className="text-warm-grey text-sm">
              Focus on whole, unprocessed foods. They provide better nutrition and keep you fuller longer.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">⏰ Meal Timing</h4>
            <p className="text-warm-grey text-sm">
              Eat balanced meals every 3-4 hours. This keeps your energy stable throughout the day.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">📊 Track Progress</h4>
            <p className="text-warm-grey text-sm">
              Keep a food diary to identify patterns. This helps us adjust your nutrition plan as needed.
            </p>
          </div>
        </div>
      </div>

      {/* Macro Guide */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
          Understanding Your Macros
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-warm-sand-beige/30 rounded-xl">
            <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">Protein</h4>
            <p className="text-warm-grey text-sm mb-3">
              Builds and repairs muscle tissue. Aim for 1.6-2.2g per kg of body weight.
            </p>
            <p className="text-xs text-warm-grey">
              Sources: chicken, fish, eggs, legumes, Greek yogurt
            </p>
          </div>
          <div className="p-6 bg-warm-sand-beige/30 rounded-xl">
            <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">Carbs</h4>
            <p className="text-warm-grey text-sm mb-3">
              Provides energy for workouts. Choose complex carbs for sustained energy.
            </p>
            <p className="text-xs text-warm-grey">
              Sources: oats, brown rice, sweet potatoes, whole grain bread
            </p>
          </div>
          <div className="p-6 bg-warm-sand-beige/30 rounded-xl">
            <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">Fats</h4>
            <p className="text-warm-grey text-sm mb-3">
              Essential for hormone production and nutrient absorption.
            </p>
            <p className="text-xs text-warm-grey">
              Sources: avocado, nuts, olive oil, fatty fish, seeds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
