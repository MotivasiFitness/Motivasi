import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { ParQ } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClipboardList, Search, Calendar, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ParqSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ParQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="min-h-screen bg-soft-white p-8">
      <div className="max-w-[100rem] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-2">
              PAR-Q Submissions
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
            {filteredSubmissions.map((submission) => (
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

                    {/* Emergency Contact */}
                    <div>
                      <label className="font-paragraph text-sm font-semibold text-charcoal-black block mb-1 flex items-center gap-2">
                        <Phone size={16} className="text-soft-bronze" />
                        Emergency Contact Number
                      </label>
                      <p className="font-paragraph text-warm-grey">
                        {submission.emergencyContactNumber || 'Not provided'}
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

                    {/* Submission Details */}
                    <div className="md:col-span-2 pt-4 border-t border-warm-sand-beige">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
