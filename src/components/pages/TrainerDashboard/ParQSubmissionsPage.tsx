import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ParqSubmissions } from '@/entities';
import { Search, Filter, AlertCircle, CheckCircle, Clock, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParQSubmissionsPage() {
  const { member } = useMember();
  const [submissions, setSubmissions] = useState<ParqSubmissions[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ParqSubmissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flaggedFilter, setFlaggedFilter] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ParqSubmissions | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [trainerNotes, setTrainerNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchQuery, statusFilter, flaggedFilter]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const { items } = await BaseCrudService.getAll<ParqSubmissions>('ParqSubmissions');
      
      // Sort by newest first
      const sorted = items.sort((a, b) => {
        const dateA = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
        const dateB = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
        return dateB - dateA;
      });
      
      setSubmissions(sorted);
    } catch (error) {
      console.error('Error loading PAR-Q submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.clientName?.toLowerCase().includes(query) ||
        sub.firstName?.toLowerCase().includes(query) ||
        sub.lastName?.toLowerCase().includes(query) ||
        sub.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Flagged filter
    if (flaggedFilter) {
      filtered = filtered.filter(sub => sub.flagsYes === true);
    }

    setFilteredSubmissions(filtered);
  };

  const openDetail = (submission: ParqSubmissions) => {
    setSelectedSubmission(submission);
    setTrainerNotes(submission.notes || '');
    setSelectedStatus(submission.status || 'New');
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedSubmission(null);
    setTrainerNotes('');
    setSelectedStatus('');
  };

  const handleSaveNotes = async () => {
    if (!selectedSubmission) return;

    try {
      setIsSaving(true);
      await BaseCrudService.update<ParqSubmissions>('ParqSubmissions', {
        _id: selectedSubmission._id,
        notes: trainerNotes,
        status: selectedStatus,
      });

      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub._id === selectedSubmission._id 
          ? { ...sub, notes: trainerNotes, status: selectedStatus }
          : sub
      ));

      setSelectedSubmission(prev => prev ? { ...prev, notes: trainerNotes, status: selectedStatus } : null);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'New':
        return <Badge className="bg-blue-500 text-white">New</Badge>;
      case 'Reviewed':
        return <Badge className="bg-green-500 text-white">Reviewed</Badge>;
      case 'Follow-up needed':
        return <Badge className="bg-orange-500 text-white">Follow-up</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const parseAnswers = (answersString?: string) => {
    if (!answersString) return null;
    try {
      // The answers field contains the formatted email body
      return answersString;
    } catch (error) {
      return answersString;
    }
  };

  const newSubmissionsCount = submissions.filter(sub => sub.status === 'New').length;

  return (
    <div className="min-h-screen bg-soft-white">
      <div className="max-w-[100rem] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-2">
                PAR-Q Submissions
              </h1>
              <p className="font-paragraph text-base text-warm-grey">
                Review and manage client health questionnaires
              </p>
            </div>
            {newSubmissionsCount > 0 && (
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                <span className="font-heading text-lg font-bold">{newSubmissionsCount}</span>
                <span className="font-paragraph text-sm ml-2">New</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-grey" size={20} />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Follow-up needed">Follow-up needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Flagged Filter */}
              <div>
                <Button
                  variant={flaggedFilter ? "default" : "outline"}
                  onClick={() => setFlaggedFilter(!flaggedFilter)}
                  className="w-full"
                >
                  <AlertCircle size={16} className="mr-2" />
                  {flaggedFilter ? 'Flagged Only' : 'Show All'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : null}

        {/* Submissions List */}
        {!isLoading && filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 text-warm-grey" size={48} />
              <p className="font-paragraph text-lg text-warm-grey">
                {searchQuery || statusFilter !== 'all' || flaggedFilter
                  ? 'No submissions match your filters'
                  : 'No PAR-Q submissions yet'}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card
                key={submission._id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openDetail(submission)}
              >
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-heading text-xl font-bold text-charcoal-black">
                          {submission.firstName && submission.lastName 
                            ? `${submission.firstName} ${submission.lastName}`
                            : submission.clientName || 'Unknown Client'}
                        </h3>
                        {submission.flagsYes && (
                          <Badge className="bg-red-500 text-white">
                            <AlertCircle size={14} className="mr-1" />
                            FLAGGED
                          </Badge>
                        )}
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-warm-grey">
                        <span>{submission.email || 'No email'}</span>
                        <span>
                          {submission.submissionDate 
                            ? new Date(submission.submissionDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : submission._createdDate
                            ? new Date(submission._createdDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'No date'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="text-warm-grey" size={24} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold text-charcoal-black flex items-center gap-3">
              PAR-Q Submission Details
              {selectedSubmission?.flagsYes && (
                <Badge className="bg-red-500 text-white">
                  <AlertCircle size={14} className="mr-1" />
                  MEDICAL CLEARANCE REQUIRED
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-paragraph text-sm text-warm-grey">Name</p>
                      <p className="font-paragraph text-base text-charcoal-black font-medium">
                        {selectedSubmission.firstName && selectedSubmission.lastName
                          ? `${selectedSubmission.firstName} ${selectedSubmission.lastName}`
                          : selectedSubmission.clientName || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-warm-grey">Email</p>
                      <p className="font-paragraph text-base text-charcoal-black font-medium">
                        {selectedSubmission.email || 'No email'}
                      </p>
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-warm-grey">Date of Birth</p>
                      <p className="font-paragraph text-base text-charcoal-black font-medium">
                        {selectedSubmission.dateOfBirth 
                          ? new Date(selectedSubmission.dateOfBirth).toLocaleDateString('en-GB')
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-warm-grey">Submitted</p>
                      <p className="font-paragraph text-base text-charcoal-black font-medium">
                        {selectedSubmission.submissionDate
                          ? new Date(selectedSubmission.submissionDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : selectedSubmission._createdDate
                          ? new Date(selectedSubmission._createdDate).toLocaleDateString('en-GB')
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Full Answers */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Complete Questionnaire Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-soft-white p-4 rounded-lg border border-warm-sand-beige">
                    <pre className="font-paragraph text-sm text-charcoal-black whitespace-pre-wrap">
                      {parseAnswers(selectedSubmission.answers) || 'No detailed answers available'}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Trainer Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                      Status
                    </label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Reviewed">Reviewed</SelectItem>
                        <SelectItem value="Follow-up needed">Follow-up needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                      Internal Notes
                    </label>
                    <Textarea
                      value={trainerNotes}
                      onChange={(e) => setTrainerNotes(e.target.value)}
                      placeholder="Add your notes here (visible only to trainers)..."
                      rows={6}
                      className="font-paragraph"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="bg-soft-bronze text-white hover:bg-soft-bronze/90"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeDetail}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
