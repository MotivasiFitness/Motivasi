import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { ParQ } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ClipboardList, Search, Calendar, User, Phone, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function ParqSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ParQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const { items } = await BaseCrudService.getAll<ParQ>('ParqSubmission');
      // Sort by submission date, newest first
      const sorted = items.sort((a, b) => {
        const dateA = a.submissionDateTime ? new Date(a.submissionDateTime).getTime() : 0;
        const dateB = b.submissionDateTime ? new Date(b.submissionDateTime).getTime() : 0;
        return dateB - dateA;
      });
      setSubmissions(sorted);
    } catch (error) {
      console.error('Error loading PAR-Q submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => 
    submission.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.emergencyContactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const toggleExpanded = (submissionId: string) => {
    setExpandedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const renderQuestionAnswer = (label: string, value: boolean | undefined | null) => {
    // Check if the value is explicitly true or false (answered)
    const isAnswered = typeof value === 'boolean';
    
    return (
      <div className="flex items-start justify-between gap-3 py-2 border-b border-warm-sand-beige/30 last:border-0">
        <div className="flex-1">
          <p className="font-paragraph text-sm text-charcoal-black">
            {label}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAnswered ? (
            <>
              {value === true ? (
                <>
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="font-paragraph text-sm font-semibold text-green-600">Yes</span>
                </>
              ) : (
                <>
                  <div className="w-[16px] h-[16px] rounded-full border-2 border-warm-grey" />
                  <span className="font-paragraph text-sm text-warm-grey">No</span>
                </>
              )}
            </>
          ) : (
            <span className="font-paragraph text-sm text-warm-grey italic">Not answered</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-soft-white p-8">
      <div className="max-w-[100rem] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-2">
              PAR-Q (Health & Fitness Questionnaire)
            </h1>
            <p className="font-paragraph text-warm-grey">
              View all Physical Activity Readiness Questionnaire submissions from clients
            </p>
          </div>
          <div className="flex items-center gap-2 text-soft-bronze">
            <ClipboardList size={32} />
            <span className="font-heading text-2xl font-bold">{submissions.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-grey" size={20} />
          <Input
            type="text"
            placeholder="Search by client name or emergency contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-paragraph"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto mb-4 text-warm-grey" size={48} />
              <p className="font-paragraph text-warm-grey">
                {searchTerm ? 'No submissions found matching your search.' : 'No PAR-Q submissions yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const isExpanded = expandedSubmissions.has(submission._id);
              
              return (
                <Card key={submission._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-warm-sand-beige/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <User className="text-soft-bronze" size={24} />
                        <div>
                          <CardTitle className="font-heading text-2xl text-charcoal-black">
                            {submission.clientName || 'Unknown Client'}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={14} className="text-warm-grey" />
                            <span className="font-paragraph text-sm text-warm-grey">
                              Submitted: {formatDateTime(submission.submissionDateTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={submission.hasHeartCondition ? "destructive" : "default"}
                        className="flex items-center gap-1"
                      >
                        {submission.hasHeartCondition ? (
                          <>
                            <AlertCircle size={14} />
                            <span>Heart Condition</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            <span>No Heart Condition</span>
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date of Birth */}
                      <div>
                        <label className="font-paragraph text-sm font-semibold text-charcoal-black block mb-1">
                          Date of Birth
                        </label>
                        <p className="font-paragraph text-warm-grey">
                          {formatDate(submission.dateOfBirth)}
                        </p>
                      </div>

                      {/* Email */}
                      {submission.email && (
                        <div>
                          <label className="font-paragraph text-sm font-semibold text-charcoal-black block mb-1">
                            Email
                          </label>
                          <p className="font-paragraph text-warm-grey">
                            {submission.email}
                          </p>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      <div>
                        <label className="font-paragraph text-sm font-semibold text-charcoal-black block mb-1 flex items-center gap-2">
                          <Phone size={16} className="text-soft-bronze" />
                          Emergency Contact Number
                        </label>
                        <p className="font-paragraph text-warm-grey">
                          {submission.emergencyContactNumber || submission.phone || 'Not provided'}
                        </p>
                      </div>

                      {/* Heart Condition Status */}
                      <div className="md:col-span-2">
                        <label className="font-paragraph text-sm font-semibold text-charcoal-black block mb-1">
                          Heart Condition Status
                        </label>
                        <div className="flex items-center gap-2">
                          {submission.hasHeartCondition ? (
                            <>
                              <AlertCircle className="text-destructive" size={20} />
                              <p className="font-paragraph text-destructive font-medium">
                                Client has indicated a heart condition - Review required
                              </p>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="text-green-600" size={20} />
                              <p className="font-paragraph text-green-600 font-medium">
                                No heart condition indicated
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Section for All Answers */}
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(submission._id)}>
                      <div className="mt-6 pt-6 border-t border-warm-sand-beige">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full flex items-center justify-between font-paragraph"
                          >
                            <span className="font-semibold">
                              {isExpanded ? 'Hide' : 'View'} Complete Questionnaire Answers
                            </span>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-6 space-y-6">
                          {/* General Health Section */}
                          <div className="bg-warm-sand-beige/20 rounded-lg p-4">
                            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                              General Health
                            </h3>
                            <div className="space-y-1">
                              {renderQuestionAnswer('Heart condition', submission.hasHeartCondition)}
                              {renderQuestionAnswer('Chest pain during physical activity', submission.chestPain)}
                              {renderQuestionAnswer('Dizziness or fainting', submission.dizzinessFainting)}
                              {renderQuestionAnswer('High blood pressure', submission.highBloodPressure)}
                              {renderQuestionAnswer('Diabetes', submission.diabetes)}
                              {renderQuestionAnswer('Respiratory condition (e.g., asthma)', submission.respiratoryCondition)}
                              {renderQuestionAnswer('Medication affecting exercise ability', submission.exerciseAffectingMedication)}
                            </div>
                            {submission.generalHealthDetails && (
                              <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                <p className="font-paragraph text-sm font-semibold text-charcoal-black mb-2">
                                  Additional Details:
                                </p>
                                <p className="font-paragraph text-sm text-charcoal-black whitespace-pre-wrap">
                                  {submission.generalHealthDetails}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Musculoskeletal & Orthopedic Section */}
                          <div className="bg-warm-sand-beige/20 rounded-lg p-4">
                            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                              Musculoskeletal & Orthopedic
                            </h3>
                            <div className="space-y-1">
                              {renderQuestionAnswer('Joint pain or arthritis', submission.jointPainOrArthritis)}
                              {renderQuestionAnswer('Past injuries or surgeries', submission.pastInjuryOrSurgery)}
                              {renderQuestionAnswer('Low back pain', submission.lowBackPain)}
                              {renderQuestionAnswer('Osteoporosis or osteopenia', submission.osteoporosisOrOsteopenia)}
                              {renderQuestionAnswer('Balance issues or history of falls', submission.balanceIssuesOrFalls)}
                            </div>
                            {submission.orthoDetails && (
                              <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                <p className="font-paragraph text-sm font-semibold text-charcoal-black mb-2">
                                  Additional Details:
                                </p>
                                <p className="font-paragraph text-sm text-charcoal-black whitespace-pre-wrap">
                                  {submission.orthoDetails}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Women-Specific Health Section */}
                          <div className="bg-warm-sand-beige/20 rounded-lg p-4">
                            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                              Women-Specific Health
                            </h3>
                            <div className="space-y-1">
                              {renderQuestionAnswer('Pregnant or possibly pregnant', submission.pregnantOrPossible)}
                              {renderQuestionAnswer('Postpartum within last 12 months', submission.postpartumWithin12Months)}
                              {renderQuestionAnswer('History of C-section', submission.cSectionHistory)}
                              {renderQuestionAnswer('Pelvic floor symptoms (e.g., incontinence)', submission.pelvicFloorSymptoms)}
                              {renderQuestionAnswer('Endometriosis or PCOS', submission.endoOrPCOS)}
                              {renderQuestionAnswer('Irregular, painful, or absent menstrual cycles', submission.irregularPainfulAbsentCycles)}
                              {renderQuestionAnswer('Perimenopausal or postmenopausal', submission.periOrPostMenopause)}
                              {renderQuestionAnswer('Thyroid issues or unexplained fatigue', submission.thyroidOrUnexplainedFatigueSymptoms)}
                            </div>
                            {submission.womensHealthDetails && (
                              <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                <p className="font-paragraph text-sm font-semibold text-charcoal-black mb-2">
                                  Additional Details:
                                </p>
                                <p className="font-paragraph text-sm text-charcoal-black whitespace-pre-wrap">
                                  {submission.womensHealthDetails}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Lifestyle & Recovery Section */}
                          <div className="bg-warm-sand-beige/20 rounded-lg p-4">
                            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                              Lifestyle & Recovery
                            </h3>
                            <div className="space-y-1">
                              {renderQuestionAnswer('High levels of stress', submission.highStress)}
                              {renderQuestionAnswer('Regularly gets less than 6-7 hours of sleep', submission.sleepBelow6to7)}
                              {renderQuestionAnswer('History of eating disorders', submission.eatingDisorderHistory)}
                              {renderQuestionAnswer('Prolonged muscle soreness after exercise', submission.prolongedSoreness)}
                              {renderQuestionAnswer('Fear or avoidance of exercise', submission.fearAvoidExercise)}
                            </div>
                            {submission.lifestyleDetails && (
                              <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                <p className="font-paragraph text-sm font-semibold text-charcoal-black mb-2">
                                  Additional Details:
                                </p>
                                <p className="font-paragraph text-sm text-charcoal-black whitespace-pre-wrap">
                                  {submission.lifestyleDetails}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Medical Clearance Section */}
                          <div className="bg-warm-sand-beige/20 rounded-lg p-4">
                            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                              Medical Clearance
                            </h3>
                            <div className="space-y-1">
                              {renderQuestionAnswer('Doctor told not to exercise', submission.toldNotToExercise)}
                              {renderQuestionAnswer('Doctor said medical clearance needed before exercising', submission.toldNeedMedicalClearance)}
                            </div>
                            {submission.medicalClearanceDetails && (
                              <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                <p className="font-paragraph text-sm font-semibold text-charcoal-black mb-2">
                                  Additional Details:
                                </p>
                                <p className="font-paragraph text-sm text-charcoal-black whitespace-pre-wrap">
                                  {submission.medicalClearanceDetails}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Declaration & Consent */}
                          {(submission.declarationAgreed || submission.signatureFullName) && (
                            <div className="bg-warm-sand-beige/20 rounded-lg p-4">
                              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                                Declaration & Consent
                              </h3>
                              <div className="space-y-3">
                                {submission.declarationAgreed && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="text-green-600" size={18} />
                                    <p className="font-paragraph text-sm text-charcoal-black">
                                      Client agreed to declaration
                                    </p>
                                  </div>
                                )}
                                {submission.signatureFullName && (
                                  <div>
                                    <p className="font-paragraph text-sm font-semibold text-charcoal-black mb-1">
                                      Signature:
                                    </p>
                                    <p className="font-paragraph text-base text-charcoal-black italic">
                                      {submission.signatureFullName}
                                    </p>
                                    {submission.signatureDate && (
                                      <p className="font-paragraph text-xs text-warm-grey mt-1">
                                        Signed on: {submission.signatureDate}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    {/* Submission Details */}
                    <div className="mt-6 pt-4 border-t border-warm-sand-beige">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-paragraph text-warm-grey">Submission ID:</span>
                          <p className="font-paragraph text-charcoal-black font-mono text-xs mt-1">
                            {submission._id}
                          </p>
                        </div>
                        <div>
                          <span className="font-paragraph text-warm-grey">Created:</span>
                          <p className="font-paragraph text-charcoal-black text-xs mt-1">
                            {formatDateTime(submission._createdDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
