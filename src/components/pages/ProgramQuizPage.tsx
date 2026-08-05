import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuizQuestion {
  id: number;
  question: string;
  description?: string;
  answers: {
    text: string;
    value: number;
    category: string;
  }[];
}

interface ProgramRecommendation {
  name: string;
  description: string;
  focus: string[];
  ideal_for: string;
  cta_text: string;
  cta_link: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is your primary fitness goal?',
    answers: [
      { text: 'Build muscle & strength', value: 3, category: 'strength' },
      { text: 'Lose weight & tone up', value: 2, category: 'weight-loss' },
      { text: 'Improve overall health & endurance', value: 1, category: 'endurance' },
      { text: 'Increase flexibility & mobility', value: 1, category: 'flexibility' },
    ],
  },
  {
    id: 2,
    question: 'What is your current fitness level?',
    answers: [
      { text: 'Beginner - I\'m just starting out', value: 1, category: 'beginner' },
      { text: 'Intermediate - I exercise regularly', value: 2, category: 'intermediate' },
      { text: 'Advanced - I have significant experience', value: 3, category: 'advanced' },
    ],
  },
  {
    id: 3,
    question: 'How many days per week can you commit to training?',
    answers: [
      { text: '2-3 days per week', value: 1, category: 'low-frequency' },
      { text: '4-5 days per week', value: 2, category: 'medium-frequency' },
      { text: '6-7 days per week', value: 3, category: 'high-frequency' },
    ],
  },
  {
    id: 4,
    question: 'Do you have any injuries or physical limitations?',
    answers: [
      { text: 'No, I\'m injury-free', value: 3, category: 'no-limitations' },
      { text: 'Minor issues I can work around', value: 2, category: 'minor-limitations' },
      { text: 'Yes, significant limitations', value: 1, category: 'significant-limitations' },
    ],
  },
  {
    id: 5,
    question: 'What type of training do you prefer?',
    answers: [
      { text: 'Strength training & weights', value: 3, category: 'weights' },
      { text: 'Cardio & conditioning', value: 2, category: 'cardio' },
      { text: 'Mixed / Functional training', value: 2, category: 'functional' },
      { text: 'Low-impact & mindful movement', value: 1, category: 'low-impact' },
    ],
  },
  {
    id: 6,
    question: 'What is your main motivation?',
    answers: [
      { text: 'Aesthetic goals (look better)', value: 2, category: 'aesthetic' },
      { text: 'Performance & strength', value: 3, category: 'performance' },
      { text: 'Health & wellness', value: 1, category: 'wellness' },
      { text: 'Confidence & mental health', value: 1, category: 'mental-health' },
    ],
  },
];

const programRecommendations: Record<string, ProgramRecommendation> = {
  strength: {
    name: 'Strength & Power Program',
    description: 'Build serious muscle and strength with progressive resistance training. Perfect for those looking to transform their physique and increase athletic performance.',
    focus: ['Progressive overload', 'Compound movements', 'Muscle hypertrophy', 'Strength gains'],
    ideal_for: 'Advanced lifters and those committed to serious strength development',
    cta_text: 'Start Strength Program',
    cta_link: '/store/strength-programs',
  },
  weight_loss: {
    name: 'Fat Loss & Toning Program',
    description: 'Combine strategic cardio, strength training, and nutrition guidance to lose fat while preserving muscle. Ideal for sustainable body composition changes.',
    focus: ['Calorie management', 'Metabolic conditioning', 'Lean muscle building', 'Sustainable habits'],
    ideal_for: 'Anyone looking to lose weight while staying strong and toned',
    cta_text: 'Explore Fat Loss Program',
    cta_link: '/store/fat-loss-programs',
  },
  endurance: {
    name: 'Health & Endurance Program',
    description: 'Improve cardiovascular health, stamina, and overall fitness. Build a strong foundation with balanced training that enhances your daily life.',
    focus: ['Cardiovascular health', 'Functional fitness', 'Endurance building', 'Injury prevention'],
    ideal_for: 'Beginners and those prioritizing overall health and wellness',
    cta_text: 'Start Health Program',
    cta_link: '/store/health-programs',
  },
  flexibility: {
    name: 'Mobility & Recovery Program',
    description: 'Enhance flexibility, mobility, and recovery. Perfect for those dealing with tightness or looking to complement their existing training.',
    focus: ['Flexibility training', 'Mobility work', 'Recovery protocols', 'Injury prevention'],
    ideal_for: 'Anyone looking to move better and recover faster',
    cta_text: 'Explore Mobility Program',
    cta_link: '/store/mobility-programs',
  },
};

function ProgramQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const answer = quizQuestions[currentQuestion].answers[selectedAnswer];
    setScores((prev) => ({
      ...prev,
      [answer.category]: (prev[answer.category] || 0) + answer.value,
    }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScores({});
    setShowResults(false);
    setSelectedAnswer(null);
  };

  const getRecommendation = (): ProgramRecommendation => {
    if (scores.strength && scores.strength >= 5) {
      return programRecommendations.strength;
    } else if (scores['weight-loss'] && scores['weight-loss'] >= 4) {
      return programRecommendations.weight_loss;
    } else if (scores.flexibility && scores.flexibility >= 3) {
      return programRecommendations.flexibility;
    } else {
      return programRecommendations.endurance;
    }
  };

  const recommendation = getRecommendation();
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto" ref={containerRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-primary-foreground mb-4">
            Find Your Perfect Program
          </h1>
          <p className="font-paragraph text-lg text-primary-foreground/80">
            Answer a few quick questions to discover the program that matches your goals
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur p-8 sm:p-10 shadow-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-paragraph text-sm font-medium text-primary">
                      Question {currentQuestion + 1} of {quizQuestions.length}
                    </span>
                    <span className="font-paragraph text-sm font-medium text-primary">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary mb-2">
                    {quizQuestions[currentQuestion].question}
                  </h2>
                  {quizQuestions[currentQuestion].description && (
                    <p className="font-paragraph text-secondary-text">
                      {quizQuestions[currentQuestion].description}
                    </p>
                  )}
                </div>

                {/* Answers */}
                <div className="space-y-3 mb-8">
                  {quizQuestions[currentQuestion].answers.map((answer, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all font-paragraph ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-gray-200 bg-white text-primary-text hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{answer.text}</span>
                        {selectedAnswer === index && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {currentQuestion === quizQuestions.length - 1 ? 'See Results' : 'Next'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white/95 backdrop-blur p-8 sm:p-10 shadow-2xl">
                {/* Results Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-block mb-4"
                  >
                    <CheckCircle className="w-16 h-16 text-emerald-green" />
                  </motion.div>
                  <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary mb-2">
                    Your Recommendation
                  </h2>
                  <p className="font-paragraph text-secondary-text">
                    Based on your answers, here's the perfect program for you
                  </p>
                </div>

                {/* Recommendation Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 sm:p-8 mb-8 border border-primary/20"
                >
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-primary mb-3">
                    {recommendation.name}
                  </h3>
                  <p className="font-paragraph text-primary-text mb-6 leading-relaxed">
                    {recommendation.description}
                  </p>

                  {/* Focus Areas */}
                  <div className="mb-6">
                    <h4 className="font-heading text-lg font-semibold text-primary mb-3">
                      What You'll Get:
                    </h4>
                    <ul className="space-y-2">
                      {recommendation.focus.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center font-paragraph text-primary-text"
                        >
                          <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal For */}
                  <div className="bg-white/50 rounded p-4 mb-6">
                    <p className="font-paragraph text-sm text-secondary-text">
                      <span className="font-semibold text-primary">Ideal for: </span>
                      {recommendation.ideal_for}
                    </p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button
                    onClick={() => (window.location.href = recommendation.cta_link)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {recommendation.cta_text}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="font-paragraph text-xs text-secondary-text text-center mt-6">
                  This quiz is designed to guide you. Our coaches can also help you find the perfect program.
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProgramQuizPage;
