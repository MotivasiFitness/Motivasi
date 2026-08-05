import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChevronRight, ArrowLeft } from 'lucide-react';

type QuizPath = 'postpartum' | 'perimenopause' | 'menopause' | 'strength35' | null;
type QuizStage = 'intro' | 'questions' | 'conditional' | 'leadCapture' | 'results';

interface QuizState {
  stage: QuizStage;
  currentQuestion: number;
  answers: Record<string, string>;
  path: QuizPath;
  recommendedProgram: string;
  recommendationReason: string;
  leadInfo: { firstName: string; email: string };
}

const PROGRAMMES = {
  postpartum: {
    name: 'Postpartum Strength & Recovery Programme',
    url: 'https://www.everfit.io/postpartum-strength-recovery',
  },
  perimenopause: {
    name: 'Perimenopause Strength Programme',
    url: 'https://www.everfit.io/perimenopause-strength',
  },
  menopause: {
    name: 'Menopause Strength Programme',
    url: 'https://www.everfit.io/menopause-strength',
  },
  strength35: {
    name: 'Strength Training 35+ Programme',
    url: 'https://www.everfit.io/strength-training-35',
  },
};

const QUESTIONS = {
  q1: {
    question: 'Which best describes you right now?',
    type: 'single',
    options: [
      { label: "I'm currently less than 12 months postpartum", value: 'postpartum_recent' },
      { label: 'I\'m more than 12 months postpartum and rebuilding my fitness', value: 'postpartum_rebuilding' },
      { label: 'My menstrual cycle has become irregular or changed recently', value: 'perimenopause' },
      { label: 'My periods have stopped completely for 12+ months', value: 'menopause' },
      { label: 'None of the above', value: 'none' },
    ],
  },
  q2: {
    question: 'What age range are you in?',
    type: 'single',
    options: [
      { label: 'Under 35', value: 'under35' },
      { label: '35-44', value: '35-44' },
      { label: '45-54', value: '45-54' },
      { label: '55+', value: '55plus' },
    ],
  },
  q3: {
    question: 'What is your main goal right now?',
    type: 'single',
    options: [
      { label: 'Build strength', value: 'strength' },
      { label: 'Lose body fat', value: 'fat_loss' },
      { label: 'Increase energy', value: 'energy' },
      { label: 'Improve confidence', value: 'confidence' },
      { label: 'Tone and shape my body', value: 'tone' },
      { label: 'Improve overall health', value: 'health' },
    ],
  },
  q4: {
    question: 'How would you describe your current fitness level?',
    type: 'single',
    options: [
      { label: 'Complete beginner', value: 'beginner' },
      { label: 'I exercise occasionally', value: 'occasional' },
      { label: 'I exercise 1-3 times per week', value: '1-3x' },
      { label: 'I train consistently', value: 'consistent' },
    ],
  },
  q5: {
    question: 'How many days per week can you realistically commit to exercise?',
    type: 'single',
    options: [
      { label: '2 days', value: '2days' },
      { label: '3 days', value: '3days' },
      { label: '4 days', value: '4days' },
      { label: '5+ days', value: '5plus' },
    ],
  },
};

const CONDITIONAL_QUESTIONS = {
  postpartum: {
    q1: {
      question: 'How long ago did you give birth?',
      options: [
        { label: '0-3 months', value: '0-3m' },
        { label: '4-6 months', value: '4-6m' },
        { label: '7-12 months', value: '7-12m' },
        { label: '1-2 years', value: '1-2y' },
        { label: '2+ years', value: '2plus' },
      ],
    },
    q2: {
      question: 'What is your biggest challenge right now?',
      options: [
        { label: 'Core strength', value: 'core' },
        { label: 'Lack of energy', value: 'energy' },
        { label: 'Weight loss', value: 'weight' },
        { label: 'Confidence', value: 'confidence' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Finding time', value: 'time' },
      ],
    },
    q3: {
      question: 'Have you returned to exercise yet?',
      options: [
        { label: 'Not yet', value: 'not_yet' },
        { label: 'Just getting started', value: 'starting' },
        { label: 'Somewhat consistently', value: 'somewhat' },
        { label: 'Yes regularly', value: 'regularly' },
      ],
    },
  },
  perimenopause: {
    q1: {
      question: 'Which symptoms are affecting you most?',
      options: [
        { label: 'Poor sleep', value: 'sleep' },
        { label: 'Weight gain around my middle', value: 'weight' },
        { label: 'Brain fog', value: 'fog' },
        { label: 'Low energy', value: 'energy' },
        { label: 'Mood changes', value: 'mood' },
        { label: 'Hot flushes', value: 'flushes' },
        { label: 'Several of the above', value: 'several' },
      ],
    },
    q2: {
      question: 'What would you most like to improve?',
      options: [
        { label: 'Strength', value: 'strength' },
        { label: 'Energy', value: 'energy' },
        { label: 'Confidence', value: 'confidence' },
        { label: 'Body composition', value: 'composition' },
        { label: 'Overall fitness', value: 'fitness' },
      ],
    },
    q3: {
      question: 'Have you done strength training before?',
      options: [
        { label: 'Never', value: 'never' },
        { label: 'Occasionally', value: 'occasional' },
        { label: 'Yes regularly', value: 'regular' },
      ],
    },
  },
  menopause: {
    q1: {
      question: 'What would you most like to improve?',
      options: [
        { label: 'Strength', value: 'strength' },
        { label: 'Bone health', value: 'bone' },
        { label: 'Energy', value: 'energy' },
        { label: 'Body composition', value: 'composition' },
        { label: 'Confidence', value: 'confidence' },
      ],
    },
    q2: {
      question: 'How active are you currently?',
      options: [
        { label: 'Mostly sedentary', value: 'sedentary' },
        { label: 'Lightly active', value: 'light' },
        { label: 'Fairly active', value: 'fair' },
        { label: 'Very active', value: 'very' },
      ],
    },
    q3: {
      question: 'Have you done strength training before?',
      options: [
        { label: 'Never', value: 'never' },
        { label: 'Occasionally', value: 'occasional' },
        { label: 'Yes regularly', value: 'regular' },
      ],
    },
  },
  strength35: {
    q1: {
      question: 'What is your biggest fitness goal?',
      options: [
        { label: 'Build muscle', value: 'muscle' },
        { label: 'Get stronger', value: 'strength' },
        { label: 'Lose body fat', value: 'fat' },
        { label: 'Feel more confident', value: 'confidence' },
        { label: 'Improve overall health', value: 'health' },
      ],
    },
    q2: {
      question: 'Where do you prefer to train?',
      options: [
        { label: 'Gym', value: 'gym' },
        { label: 'Home', value: 'home' },
        { label: 'Both', value: 'both' },
      ],
    },
    q3: {
      question: 'What equipment do you have access to?',
      options: [
        { label: 'Full gym', value: 'full' },
        { label: 'Dumbbells', value: 'dumbbells' },
        { label: 'Resistance bands', value: 'bands' },
        { label: 'No equipment', value: 'none' },
      ],
    },
  },
};

export default function ProgramQuizPage() {
  const [state, setState] = useState<QuizState>({
    stage: 'intro',
    currentQuestion: 0,
    answers: {},
    path: null,
    recommendedProgram: '',
    recommendationReason: '',
    leadInfo: { firstName: '', email: '' },
  });

  const handleQ1Answer = (value: string) => {
    let path: QuizPath = null;
    if (value === 'postpartum_recent' || value === 'postpartum_rebuilding') {
      path = 'postpartum';
    } else if (value === 'perimenopause') {
      path = 'perimenopause';
    } else if (value === 'menopause') {
      path = 'menopause';
    } else if (value === 'none') {
      path = 'strength35';
    }

    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, q1: value },
      path,
      currentQuestion: 1,
    }));
  };

  const handleAnswer = (questionKey: string, value: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionKey]: value },
      currentQuestion: prev.currentQuestion + 1,
    }));
  };

  const handleConditionalAnswer = (questionKey: string, value: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionKey]: value },
      currentQuestion: prev.currentQuestion + 1,
    }));
  };

  const proceedToLeadCapture = () => {
    setState((prev) => ({
      ...prev,
      stage: 'leadCapture',
    }));
  };

  const handleLeadCapture = (firstName: string, email: string) => {
    const { path, answers } = state;
    let recommendedProgram = '';
    let recommendationReason = '';

    if (path === 'postpartum') {
      recommendedProgram = PROGRAMMES.postpartum.name;
      recommendationReason = `Based on your postpartum journey and goals, this programme is specifically designed to help you rebuild core strength, regain confidence, and safely return to exercise. It's tailored for your current fitness level and the time you can dedicate to training.`;
    } else if (path === 'perimenopause') {
      recommendedProgram = PROGRAMMES.perimenopause.name;
      recommendationReason = `This programme is designed specifically for the perimenopause stage, addressing the unique challenges you're facing like energy levels, body composition changes, and hormonal fluctuations. Strength training is proven to help manage perimenopause symptoms while building the resilience you need.`;
    } else if (path === 'menopause') {
      recommendedProgram = PROGRAMMES.menopause.name;
      recommendationReason = `This programme is specifically designed for women in menopause, focusing on maintaining bone health, building strength, and managing body composition changes. It's tailored to your current activity level and fitness goals.`;
    } else if (path === 'strength35') {
      recommendedProgram = PROGRAMMES.strength35.name;
      recommendationReason = `This comprehensive strength training programme is designed for women 35+ who want to build muscle, increase strength, and feel more confident. It's customized to your fitness level, available training days, and preferred training environment.`;
    }

    setState((prev) => ({
      ...prev,
      stage: 'results',
      leadInfo: { firstName, email },
      recommendedProgram,
      recommendationReason,
    }));
  };

  const handleBack = () => {
    setState((prev) => {
      if (prev.stage === 'leadCapture') {
        return { ...prev, stage: 'conditional' };
      }
      if (prev.stage === 'conditional' && prev.currentQuestion === 1) {
        return { ...prev, stage: 'questions', currentQuestion: 4 };
      }
      if (prev.stage === 'questions') {
        return { ...prev, currentQuestion: Math.max(0, prev.currentQuestion - 1) };
      }
      if (prev.stage === 'intro') {
        return prev;
      }
      return prev;
    });
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-12 px-6"
    >
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-black mb-4">
        Find Your Perfect Programme
      </h1>
      <p className="font-paragraph text-lg text-warm-grey mb-8 max-w-2xl mx-auto">
        Answer a few quick questions and we'll recommend the best fitness programme for your current stage of life, goals, and experience.
      </p>
      <div className="bg-soft-white p-8 rounded-lg mb-8 max-w-md mx-auto">
        <p className="text-sm text-warm-grey mb-4">⏱️ Takes less than 2 minutes</p>
        <p className="text-sm text-warm-grey mb-6">🎯 Personalized recommendations</p>
        <p className="text-sm text-warm-grey">💪 Designed for women 35+</p>
      </div>
      <Button
        onClick={() => setState((prev) => ({ ...prev, stage: 'questions', currentQuestion: 0 }))}
        className="bg-cta-purple hover:bg-primary text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
      >
        Start Quiz <ChevronRight size={20} />
      </Button>
    </motion.div>
  );

  const renderQuestion = (questionKey: string, questionData: any, isConditional = false) => (
    <motion.div
      key={questionKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-8 px-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-warm-grey mb-2">
            Question {state.currentQuestion + 1} of {isConditional ? 3 : 5}
          </p>
          <div className="w-full bg-light-gray rounded-full h-2">
            <div
              className="bg-cta-purple h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((state.currentQuestion + 1) / (isConditional ? 3 : 5)) * 100}%`,
              }}
            />
          </div>
        </div>

        <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-black mb-6">
          {questionData.question}
        </h2>

        <div className="space-y-3">
          {questionData.options.map((option: any) => (
            <button
              key={option.value}
              onClick={() => {
                if (isConditional) {
                  handleConditionalAnswer(questionKey, option.value);
                } else if (questionKey === 'q1') {
                  handleQ1Answer(option.value);
                } else {
                  handleAnswer(questionKey, option.value);
                }
              }}
              className="w-full p-4 text-left border-2 border-light-gray rounded-lg hover:border-cta-purple hover:bg-soft-white transition-all duration-200 font-paragraph text-charcoal-black"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderQuestions = () => {
    const questionKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const currentKey = questionKeys[state.currentQuestion];

    if (state.currentQuestion < 5) {
      return renderQuestion(currentKey, QUESTIONS[currentKey as keyof typeof QUESTIONS]);
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="py-8 px-6 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-black mb-4">
              Almost there!
            </h2>
            <p className="font-paragraph text-warm-grey mb-8">
              Let's move to the next set of questions tailored to your situation.
            </p>
            <Button
              onClick={() => setState((prev) => ({ ...prev, stage: 'conditional', currentQuestion: 0 }))}
              className="bg-cta-purple hover:bg-primary text-white px-8 py-3 rounded-lg font-semibold"
            >
              Continue <ChevronRight size={20} />
            </Button>
          </div>
        </motion.div>
      );
    }
  };

  const renderConditional = () => {
    if (!state.path) return null;

    const conditionalQuestions = CONDITIONAL_QUESTIONS[state.path];
    const questionKeys = Object.keys(conditionalQuestions);
    const currentKey = questionKeys[state.currentQuestion];

    if (state.currentQuestion < 3) {
      return renderQuestion(
        `${state.path}_${currentKey}`,
        conditionalQuestions[currentKey as keyof typeof conditionalQuestions],
        true
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="py-8 px-6 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-black mb-4">
              Perfect! One last step...
            </h2>
            <p className="font-paragraph text-warm-grey mb-8">
              Let us know your details so we can send you your personalized recommendation.
            </p>
            <Button
              onClick={proceedToLeadCapture}
              className="bg-cta-purple hover:bg-primary text-white px-8 py-3 rounded-lg font-semibold"
            >
              Continue <ChevronRight size={20} />
            </Button>
          </div>
        </motion.div>
      );
    }
  };

  const renderLeadCapture = () => {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
      const newErrors: Record<string, string> = {};
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      if (email && !email.includes('@')) newErrors.email = 'Please enter a valid email';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      handleLeadCapture(firstName, email);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="py-8 px-6"
      >
        <div className="max-w-md mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-black mb-2 text-center">
            Get Your Recommendation
          </h2>
          <p className="font-paragraph text-warm-grey mb-8 text-center">
            We'll send your personalized programme recommendation to your email.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block font-paragraph text-charcoal-black mb-2">First Name</label>
              <Input
                type="text"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                }}
                className="w-full"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block font-paragraph text-charcoal-black mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className="w-full"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-cta-purple hover:bg-primary text-white py-3 rounded-lg font-semibold mt-6"
            >
              See My Recommendation
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    const programmeKey = Object.entries(PROGRAMMES).find(
      ([_, prog]) => prog.name === state.recommendedProgram
    )?.[0] as keyof typeof PROGRAMMES;

    const handleStartProgramme = () => {
      window.open(PROGRAMMES[programmeKey].url, '_blank');
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="py-8 px-6"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-black mb-2">
              Congratulations, {state.leadInfo.firstName}!
            </h1>
            <p className="font-paragraph text-warm-grey">
              Based on your answers, we recommend:
            </p>
          </div>

          <Card className="bg-soft-white p-8 mb-8 border-2 border-cta-purple">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-cta-purple mb-4 text-center">
              {state.recommendedProgram}
            </h2>
            <p className="font-paragraph text-charcoal-black text-center leading-relaxed mb-6">
              {state.recommendationReason}
            </p>
          </Card>

          <div className="text-center">
            <Button 
              onClick={handleStartProgramme}
              className="bg-cta-purple hover:bg-primary text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              Start My Programme <ChevronRight size={20} />
            </Button>
          </div>

          <p className="font-paragraph text-sm text-warm-grey text-center mt-8">
            A confirmation email has been sent to {state.leadInfo.email}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-white to-light-gray py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        {state.stage !== 'intro' && state.stage !== 'results' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-cta-purple hover:text-primary mb-6 px-6 font-paragraph"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}

        {/* Quiz Content */}
        <AnimatePresence mode="wait">
          {state.stage === 'intro' && renderIntro()}
          {state.stage === 'questions' && renderQuestions()}
          {state.stage === 'conditional' && renderConditional()}
          {state.stage === 'leadCapture' && renderLeadCapture()}
          {state.stage === 'results' && renderResults()}
        </AnimatePresence>
      </div>
    </div>
  );
}
