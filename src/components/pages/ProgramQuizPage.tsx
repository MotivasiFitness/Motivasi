import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft, Check } from 'lucide-react';

type QuizPath = 'postpartum' | 'perimenopause' | 'menopause' | 'strength35' | null;
type QuizStage = 'intro' | 'questions' | 'conditional' | 'results';

interface QuizState {
  stage: QuizStage;
  currentQuestion: number;
  answers: Record<string, string>;
  path: QuizPath;
  recommendedProgram: string;
  recommendationReason: string;
}

const PROGRAMMES = {
  postpartum: {
    name: 'Postpartum Strength & Recovery Programme',
    url: 'https://www.everfit.io/postpartum-strength-recovery',
    benefits: [
      'Safe core rebuilding and pelvic floor recovery',
      'Personalised progression from 0-12+ months postpartum',
      'Energy-boosting workouts for busy mums',
      'Confidence and body reconnection',
    ],
  },
  perimenopause: {
    name: 'Perimenopause Strength Programme',
    url: 'https://www.everfit.io/perimenopause-strength',
    benefits: [
      'Hormone-aware strength training',
      'Energy and mood management through exercise',
      'Body composition optimisation',
      'Symptom relief and resilience building',
    ],
  },
  menopause: {
    name: 'Menopause Strength Programme',
    url: 'https://www.everfit.io/menopause-strength',
    benefits: [
      'Bone health protection and strengthening',
      'Metabolic optimisation for this life stage',
      'Strength and confidence building',
      'Long-term health and vitality',
    ],
  },
  strength35: {
    name: 'Strength Training 35+ Programme',
    url: 'https://www.everfit.io/strength-training-35',
    benefits: [
      'Progressive strength and muscle building',
      'Customised to your fitness level',
      'Flexible training options (gym or home)',
      'Sustainable results and confidence',
    ],
  },
};

const QUESTIONS = {
  q1: {
    question: 'Which best describes you right now?',
    type: 'single',
    options: [
      { label: "I'm currently less than 12 months postpartum", value: 'postpartum_recent', icon: '🤱' },
      { label: 'I\'m more than 12 months postpartum and rebuilding my fitness', value: 'postpartum_rebuilding', icon: '🤱' },
      { label: 'My menstrual cycle has become irregular or changed recently', value: 'perimenopause', icon: '🌸' },
      { label: 'My periods have stopped completely for 12+ months', value: 'menopause', icon: '☀️' },
      { label: 'None of the above', value: 'none', icon: '💪' },
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
    setState((prev) => {
      const nextQuestion = prev.currentQuestion + 1;
      
      // After the 3rd conditional question, show results
      if (nextQuestion >= 3) {
        const { path } = prev;
        let recommendedProgram = '';
        let recommendationReason = '';

        if (path === 'postpartum') {
          recommendedProgram = PROGRAMMES.postpartum.name;
          recommendationReason = `Based on your postpartum journey and goals, this programme is specifically designed to help you rebuild core strength, regain confidence, and safely return to exercise. It's tailored for your current fitness level and the time you can dedicate to training.`;
        } else if (path === 'perimenopause') {
          recommendedProgram = PROGRAMMES.perimenopause.name;
          recommendationReason = `This programme is designed specifically for the perimenopause stage, addressing the unique challenges you're facing like energy levels, body composition changes, and hormonal fluctuations. Strength training is proven to help manage perimenopause symptoms whilst building the resilience you need.`;
        } else if (path === 'menopause') {
          recommendedProgram = PROGRAMMES.menopause.name;
          recommendationReason = `This programme is specifically designed for women in menopause, focusing on maintaining bone health, building strength, and managing body composition changes. It's tailored to your current activity level and fitness goals.`;
        } else if (path === 'strength35') {
          recommendedProgram = PROGRAMMES.strength35.name;
          recommendationReason = `This comprehensive strength training programme is designed for women 35+ who want to build muscle, increase strength, and feel more confident. It's customised to your fitness level, available training days, and preferred training environment.`;
        }

        return {
          ...prev,
          answers: { ...prev.answers, [questionKey]: value },
          stage: 'results',
          recommendedProgram,
          recommendationReason,
        };
      }

      return {
        ...prev,
        answers: { ...prev.answers, [questionKey]: value },
        currentQuestion: nextQuestion,
      };
    });
  };

  const handleBack = () => {
    setState((prev) => {
      if (prev.stage === 'conditional' && prev.currentQuestion === 0) {
        return { ...prev, stage: 'questions', currentQuestion: 4 };
      }
      if (prev.stage === 'conditional') {
        return { ...prev, currentQuestion: Math.max(0, prev.currentQuestion - 1) };
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
      className="text-center py-12 px-6 md:py-16"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-6">
            Find Your Perfect Programme
          </h1>
        </motion.div>
        <p className="font-paragraph text-lg text-warm-grey mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover a fitness programme designed specifically for your life stage, goals, and experience. In just 2 minutes, we'll create a personalised recommendation tailored to you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl border border-light-gray"
          >
            <p className="text-3xl mb-3">⏱️</p>
            <p className="font-paragraph text-sm text-charcoal-black font-semibold">2 Minutes</p>
            <p className="font-paragraph text-xs text-warm-grey mt-1">Quick & easy</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl border border-light-gray"
          >
            <p className="text-3xl mb-3">🎯</p>
            <p className="font-paragraph text-sm text-charcoal-black font-semibold">Personalised</p>
            <p className="font-paragraph text-xs text-warm-grey mt-1">Just for you</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl border border-light-gray"
          >
            <p className="text-3xl mb-3">💪</p>
            <p className="font-paragraph text-sm text-charcoal-black font-semibold">For Women 35+</p>
            <p className="font-paragraph text-xs text-warm-grey mt-1">Designed for you</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => setState((prev) => ({ ...prev, stage: 'questions', currentQuestion: 0 }))}
            className="bg-cta-purple hover:bg-primary text-white px-10 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 mx-auto transition-all duration-300 hover:shadow-lg"
          >
            Start Quiz <ChevronRight size={24} />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderQuestion = (questionKey: string, questionData: any, isConditional = false) => {
    const totalQuestions = isConditional ? 3 : 5;
    const progressPercentage = ((state.currentQuestion + 1) / totalQuestions) * 100;

    return (
      <motion.div
        key={questionKey}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
        className="py-8 px-6 md:py-12"
      >
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <p className="font-paragraph text-sm font-semibold text-charcoal-black">
                Question {state.currentQuestion + 1} of {totalQuestions}
              </p>
              <p className="font-paragraph text-sm font-semibold text-cta-purple">
                {Math.round(progressPercentage)}%
              </p>
            </div>
            <div className="w-full bg-light-gray rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cta-purple to-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-black mb-10">
            {questionData.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionData.options.map((option: any, index: number) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (isConditional) {
                    handleConditionalAnswer(questionKey, option.value);
                  } else if (questionKey === 'q1') {
                    handleQ1Answer(option.value);
                  } else {
                    handleAnswer(questionKey, option.value);
                  }
                }}
                className="group relative p-6 text-left border-2 border-light-gray rounded-xl bg-white hover:border-cta-purple hover:bg-soft-white transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {option.icon && (
                    <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="font-paragraph font-semibold text-charcoal-black group-hover:text-cta-purple transition-colors duration-300">
                      {option.label}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-light-gray group-hover:border-cta-purple transition-colors duration-300" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

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
          className="py-12 px-6 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-black mb-4">
              Almost there!
            </h2>
            <p className="font-paragraph text-lg text-warm-grey mb-10">
              Let's move to the next set of questions tailored to your situation.
            </p>
            <Button
              onClick={() => setState((prev) => ({ ...prev, stage: 'conditional', currentQuestion: 0 }))}
              className="bg-cta-purple hover:bg-primary text-white px-10 py-4 rounded-lg font-semibold text-lg inline-flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
            >
              Continue <ChevronRight size={24} />
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
    }
    
    return null;
  };

  const renderResults = () => {
    const programmeKey = Object.entries(PROGRAMMES).find(
      ([_, prog]) => prog.name === state.recommendedProgram
    )?.[0] as keyof typeof PROGRAMMES;

    const programme = PROGRAMMES[programmeKey];

    const handleStartProgramme = () => {
      window.open(programme.url, '_blank');
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="py-12 px-6 md:py-16"
      >
        <div className="max-w-3xl mx-auto">
          {/* Congratulations Header */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl mb-6"
            >
              🎉
            </motion.div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-black mb-3">
              Congratulations!
            </h1>
            <p className="font-paragraph text-lg text-warm-grey">
              Based on your answers, we've found the perfect programme for you.
            </p>
          </motion.div>

          {/* Programme Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-soft-white to-white p-8 md:p-12 rounded-2xl border-2 border-cta-purple mb-10 shadow-lg"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-cta-purple mb-6 text-center">
              {state.recommendedProgram}
            </h2>
            <p className="font-paragraph text-lg text-charcoal-black text-center leading-relaxed mb-8">
              {state.recommendationReason}
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              <p className="font-paragraph font-semibold text-charcoal-black mb-4">What you'll get:</p>
              {programme.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cta-purple flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <p className="font-paragraph text-charcoal-black">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button
              onClick={handleStartProgramme}
              className="bg-cta-purple hover:bg-primary text-white px-12 py-5 rounded-lg font-semibold text-lg inline-flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
            >
              Start My Programme <ChevronRight size={24} />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-white via-white to-light-gray py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        {state.stage !== 'intro' && state.stage !== 'results' && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="flex items-center gap-2 text-cta-purple hover:text-primary mb-8 px-6 font-paragraph font-semibold transition-colors duration-300"
          >
            <ArrowLeft size={20} />
            Back
          </motion.button>
        )}

        {/* Quiz Content */}
        <AnimatePresence mode="wait">
          {state.stage === 'intro' && renderIntro()}
          {state.stage === 'questions' && renderQuestions()}
          {state.stage === 'conditional' && renderConditional()}
          {state.stage === 'results' && renderResults()}
        </AnimatePresence>
      </div>
    </div>
  );
}
