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
              <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-6">
                {t.about.meetYourCoach}
              </h1>
              <p className="font-paragraph text-xl text-charcoal-black mb-6 leading-relaxed">
                {t.about.passionateAbout}
              </p>
              <p className="font-paragraph text-lg text-warm-grey mb-6 leading-relaxed">
                {t.about.specialisedTraining}
              </p>
              <p className="font-paragraph text-lg text-warm-grey leading-relaxed">
                {t.about.approachSimple}
              </p>
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
              {t.about.myMission}
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black leading-relaxed">
              {t.about.missionDesc}
            </p>
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
