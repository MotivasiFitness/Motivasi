import { useEffect, useState } from 'react';
import { Award, Heart } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { TrainerQualifications } from '@/entities';
import { useLanguage } from '@/i18n/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
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
              <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-8">
                Meet Your Coach
              </h1>
              <div className="space-y-6 font-paragraph text-lg text-charcoal-black leading-relaxed">
                <p>
                  I'm a mum of two — and like many women, I know first-hand how much life changes after having children. Between sleepless nights, work, family responsibilities, and a body that no longer feels the same, fitness can quickly become confusing, overwhelming, or something that gets pushed to the bottom of the list.
                </p>
                <p>
                  After the birth of my children, I experienced injuries from not training correctly and not having the right guidance on how to recover safely. I wanted to feel strong again — but I didn't know how to train my body properly, and there was very little support available. That experience changed everything.
                </p>
                <p>
                  After years working in corporate management, I retrained as a personal trainer so I could truly understand the female body — particularly during pregnancy, postnatal recovery, and later life stages. I wanted to create the kind of support I wish I'd had: informed, reassuring, and built around real life.
                </p>
                <p>
                  Today, I run a women's personal training business dedicated to helping women become stronger, healthier, and more confident at every stage of their journey — whether you're pre or postnatal, navigating menopause, or simply ready to prioritise your health again.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] w-full max-w-lg mx-auto rounded-2xl overflow-hidden">
                <Image
                  src="https://static.wixstatic.com/media/93e866_ad8d5ca17dc741309161d852cb79fc52~mv2.png"
                  className="w-full h-full object-cover"
                  width={600}
                  originWidth={1024}
                  originHeight={1536}
                  focalPointX={30.908203125}
                  focalPointY={46.54947916666667} />
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
              My Approach
            </h2>
            <div className="space-y-6 font-paragraph text-xl text-charcoal-black leading-relaxed">
              <p>
                My approach is grounded in lived experience and professional expertise. I don't believe in extreme diets, punishment-style workouts, or intimidation. I believe in strength training that supports your body, practical nutrition that fits around family life, and consistent guidance that helps you feel capable and in control again.
              </p>
              <p className="text-2xl font-bold text-soft-bronze">
                You don't need to "bounce back." You deserve to move forward — stronger than before.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Qualifications Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige/40">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-soft-bronze rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="text-soft-white" size={32} />
            </div>
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              {t.about.qualificationsExpertise}
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
              {t.about.certifiedAndSpecialised}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {qualifications.map((qual) => (
              <div
                key={qual._id}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze hover:shadow-lg transition-all"
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
                  {qual.qualificationName?.toLowerCase().includes('pre') && qual.qualificationName?.toLowerCase().includes('post') && qual.qualificationName?.toLowerCase().includes('natal')
                    ? `Level 3 ${qual.qualificationName}`
                    : qual.qualificationName}
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
              {t.about.myCoachingApproach}
            </h2>
            <p className="font-paragraph text-xl text-warm-grey max-w-3xl mx-auto">
              {t.about.holisticSustainable}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <h3 className="font-heading text-3xl font-bold text-soft-bronze mb-4">
                {t.about.personalised}
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                {t.about.personalisedDesc}
              </p>
            </div>

            <div className="text-center p-8">
              <h3 className="font-heading text-3xl font-bold text-soft-bronze mb-4">
                {t.about.evidenceBased}
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                {t.about.evidenceBasedDesc}
              </p>
            </div>

            <div className="text-center p-8">
              <h3 className="font-heading text-3xl font-bold text-soft-bronze mb-4">
                {t.about.supportive}
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                {t.about.supportiveDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
