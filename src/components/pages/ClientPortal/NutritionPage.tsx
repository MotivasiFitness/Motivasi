import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { NutritionGuidance } from '@/entities';
import { Download, Calendar, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="space-y-8 bg-warm-sand-beige/20 min-h-screen p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Nutrition Guidance</h1>
        <p className="text-soft-white/90">
          Your personalised meal plans and nutrition recommendations
        </p>
      </div>

      {/* Nutrition Items */}
      {nutritionGuidance.length > 0 ? (
        <div className="space-y-8">
          {nutritionGuidance.map((guidance) => (
            <div key={guidance._id} className="space-y-6">
              {/* Main Card */}
              <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-8">
                  <div className="flex-1">
                    <h2 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-black mb-3">
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
                      className="flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze/90 transition-colors text-sm font-medium flex-shrink-0"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  )}
                </div>

                {/* What This Plan Focuses On */}
                <div className="mb-8 pb-8 border-b border-warm-sand-beige">
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-5">
                    What This Plan Focuses On
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      'Sustainable fat loss',
                      'Strength and energy',
                      'Whole foods over restriction',
                      'Supporting workouts and recovery'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-soft-bronze flex-shrink-0 mt-0.5" />
                        <span className="font-paragraph text-charcoal-black">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overview */}
                {guidance.overview && (
                  <div className="mb-8 pb-8 border-b border-warm-sand-beige">
                    <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                      Overview
                    </h3>
                    <p className="font-paragraph text-charcoal-black leading-relaxed whitespace-pre-wrap">
                      {guidance.overview}
                    </p>
                  </div>
                )}

                {/* Daily Plate Guide */}
                <div className="mb-8 pb-8 border-b border-warm-sand-beige">
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                    Daily Plate Guide
                  </h3>
                  <p className="font-paragraph text-charcoal-black mb-6 leading-relaxed">
                    Use this simple visual guide to balance your meals throughout the day:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: '½ plate', item: 'Vegetables or fruit', color: 'bg-green-50 border-green-200' },
                      { label: '¼ plate', item: 'Protein', color: 'bg-blue-50 border-blue-200' },
                      { label: '¼ plate', item: 'Carbohydrates', color: 'bg-amber-50 border-amber-200' },
                      { label: 'As needed', item: 'Healthy fats', color: 'bg-orange-50 border-orange-200' }
                    ].map((plate, idx) => (
                      <div key={idx} className={`${plate.color} border rounded-xl p-5`}>
                        <p className="font-heading font-bold text-charcoal-black text-lg mb-1">
                          {plate.label}
                        </p>
                        <p className="font-paragraph text-charcoal-black/80">
                          {plate.item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meal Plan Details */}
                {guidance.mealPlanDetails && (
                  <div className="mb-8 pb-8 border-b border-warm-sand-beige">
                    <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                      Meal Plan Details
                    </h3>
                    <div className="bg-warm-sand-beige/30 rounded-xl p-6 mb-5">
                      <p className="font-paragraph text-sm text-charcoal-black italic leading-relaxed">
                        💡 <span className="font-medium">These meals are examples, not rules.</span> Swap foods based on preference, culture, and family meals.
                      </p>
                    </div>
                    <p className="font-paragraph text-charcoal-black leading-relaxed whitespace-pre-wrap">
                      {guidance.mealPlanDetails}
                    </p>
                  </div>
                )}

                {/* How to Use This Plan */}
                <div className="mb-8 pb-8 border-b border-warm-sand-beige">
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-5">
                    How to Use This Plan
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Aim for 3 meals + 1–2 snacks most days',
                      'Focus on protein and plants at each meal',
                      'No foods are off-limits — consistency over perfection',
                      'Adjust portions based on hunger and energy'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-soft-bronze flex-shrink-0 mt-0.5" />
                        <span className="font-paragraph text-charcoal-black">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helpful Nutrition Guidelines */}
                {guidance.dietaryNotes && (
                  <div className="p-6 bg-soft-white border border-warm-sand-beige rounded-xl">
                    <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                      Helpful Nutrition Guidelines
                    </h3>
                    <p className="font-paragraph text-charcoal-black leading-relaxed whitespace-pre-wrap mb-4">
                      {guidance.dietaryNotes}
                    </p>
                    <div className="pt-4 border-t border-warm-sand-beige">
                      <p className="font-paragraph text-sm text-charcoal-black/80 italic">
                        ✨ Small, consistent choices matter more than perfect days.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Coaching Support Prompt */}
              <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <MessageCircle size={24} className="text-soft-bronze flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-paragraph text-charcoal-black leading-relaxed">
                    <span className="font-medium">💬 Not sure how this fits your routine?</span> Send me a message and we'll adjust it together.
                  </p>
                </div>
                <Link
                  to="/portal/messages"
                  className="flex-shrink-0 bg-soft-bronze text-soft-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-soft-bronze/90 transition-colors whitespace-nowrap"
                >
                  Send Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <p className="text-charcoal-black font-medium mb-2">
            Your personalised nutrition guidance will be added soon.
          </p>
          <p className="text-warm-grey text-sm">
            Once your trainer creates your meal plan, it will appear here.
          </p>
        </div>
      )}

      {/* Nutrition Tips */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
        <h3 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-black mb-8">
          Nutrition Tips
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-soft-white rounded-xl p-6 hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-paragraph font-bold mb-3">💧 Stay Hydrated</h4>
            <p className="text-sm leading-relaxed">
              Drink at least 2-3 liters of water daily. Proper hydration supports recovery and performance.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6 hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-paragraph font-bold mb-3">🥗 Eat Whole Foods</h4>
            <p className="text-sm leading-relaxed">
              Focus on whole, unprocessed foods. They provide better nutrition and keep you fuller longer.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6 hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-paragraph font-bold mb-3">⏰ Meal Timing</h4>
            <p className="text-sm leading-relaxed">
              Eat balanced meals every 3-4 hours. This keeps your energy stable throughout the day.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6 hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-paragraph font-bold mb-3">📊 Track Progress</h4>
            <p className="text-sm leading-relaxed">
              Keep a food diary to identify patterns. This helps us adjust your nutrition plan as needed.
            </p>
          </div>
        </div>
      </div>

      {/* Macro Guide */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
        <h3 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-black mb-8">
          Understanding Your Macros
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 bg-warm-sand-beige/30 rounded-xl hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-heading text-lg font-bold mb-3">Protein</h4>
            <p className="text-sm mb-4 leading-relaxed">
              Builds and repairs muscle tissue. Aim for 1.6-2.2g per kg of body weight.
            </p>
            <p className="text-xs italic opacity-80">
              Sources: chicken, fish, eggs, legumes, Greek yogurt
            </p>
          </div>
          <div className="p-6 bg-warm-sand-beige/30 rounded-xl hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-heading text-lg font-bold mb-3">Carbs</h4>
            <p className="text-sm mb-4 leading-relaxed">
              Provides energy for workouts. Choose complex carbs for sustained energy.
            </p>
            <p className="text-xs italic opacity-80">
              Sources: oats, brown rice, sweet potatoes, whole grain bread
            </p>
          </div>
          <div className="p-6 bg-warm-sand-beige/30 rounded-xl hover:bg-soft-bronze hover:text-soft-white transition-all duration-300">
            <h4 className="font-heading text-lg font-bold mb-3">Fats</h4>
            <p className="text-sm mb-4 leading-relaxed">
              Essential for hormone production and nutrient absorption.
            </p>
            <p className="text-xs italic opacity-80">
              Sources: avocado, nuts, olive oil, fatty fish, seeds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
