import { useEffect, useState } from 'react';
import { Award, Heart } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { TrainerQualifications } from '@/entities';

export default function AboutPage() {
  const [qualifications, setQualifications] = useState<TrainerQualifications[]>([]);

  useEffect(() => {
    const fetchQualifications = async () => {
      const { items } = await BaseCrudService.getAll<TrainerQualifications>('trainerqualifications');
      setQualifications(items.sort((a, b) => {
        const dateA = a.dateObtained ? new Date(a.dateObtained).getTime() : 0;
        const dateB = b.dateObtained ? new Date(b.dateObtained).getTime() : 0;
        return dateB - dateA;
      }));
    };
    fetchQualifications();
  }, []);

  return (
    <div className="bg-soft-white">
      {/* Hero Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-6">
                Meet Your Coach
              </h1>
              <p className="font-paragraph text-xl text-charcoal-black mb-6 leading-relaxed">
                I'm passionate about helping busy women discover their strength and transform their relationship with fitness and nutrition.
              </p>
              <p className="font-paragraph text-lg text-warm-grey mb-6 leading-relaxed">
                With specialised training in pre/postnatal fitness, advanced nutrition, and menopause support, I understand the unique challenges women face at different life stages.
              </p>
              <p className="font-paragraph text-lg text-warm-grey leading-relaxed">
                My approach is simple: sustainable strength training and nutrition guidance that fits your busy lifestyle—no extreme diets, no intimidation, just real results.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] w-full max-w-lg mx-auto rounded-2xl overflow-hidden">
                <Image
                  src="https://static.wixstatic.com/media/93e866_0f87c0e4fd364ec19d67523c7472a283~mv2.png?originWidth=576&originHeight=768"
                  alt="Personal trainer portrait"
                  className="w-full h-full object-cover"
                  width={600}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-soft-bronze rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-soft-white" size={32} />
            </div>
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              My Mission
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black leading-relaxed">
              To empower busy women aged 30–45 to achieve sustainable fat loss and build real strength without extreme diets or feeling intimidated. I believe every woman deserves to feel confident, capable, and strong in her own body.
            </p>
          </div>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-soft-bronze rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="text-soft-white" size={32} />
            </div>
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              Qualifications & Expertise
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
              Certified and specialised to support you through every stage of your fitness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {qualifications.map((qual) => (
              <div
                key={qual._id}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze transition-colors"
              >
                {qual.certificateImage && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-6">
                    <Image
                      src={qual.certificateImage}
                      alt={`${qual.qualificationName} certificate`}
                      className="w-full h-full object-cover"
                      width={600}
                    />
                  </div>
                )}
                <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
                  {qual.qualificationName}
                </h3>
                {qual.issuingBody && (
                  <p className="font-paragraph text-base text-soft-bronze mb-4">
                    {qual.issuingBody}
                  </p>
                )}
                {qual.dateObtained && (
                  <p className="font-paragraph text-sm text-warm-grey mb-4">
                    Obtained: {new Date(qual.dateObtained).toLocaleDateString('en-GB', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
                {qual.description && (
                  <p className="font-paragraph text-base text-charcoal-black mb-4">
                    {qual.description}
                  </p>
                )}
                {qual.relevance && (
                  <div className="border-t border-warm-sand-beige pt-4">
                    <p className="font-paragraph text-sm text-warm-grey italic">
                      {qual.relevance}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">
              My Coaching Approach
            </h2>
            <p className="font-paragraph text-xl text-warm-grey max-w-3xl mx-auto">
              A holistic, sustainable method that respects your time, your body, and your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <h3 className="font-heading text-3xl font-bold text-soft-bronze mb-4">
                Personalized
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                Every program is tailored to your unique needs, schedule, and fitness level. No cookie-cutter plans.
              </p>
            </div>

            <div className="text-center p-8">
              <h3 className="font-heading text-3xl font-bold text-soft-bronze mb-4">
                Evidence-Based
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                Training and nutrition strategies backed by science and proven through years of client success.
              </p>
            </div>

            <div className="text-center p-8">
              <h3 className="font-heading text-3xl font-bold text-soft-bronze mb-4">
                Supportive
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                Weekly check-ins and ongoing support to keep you accountable and motivated throughout your journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
