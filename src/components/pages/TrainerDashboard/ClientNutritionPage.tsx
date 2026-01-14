import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { NutritionGuidance, TrainerClientAssignments } from '@/entities';
import { Plus, Edit2, Trash2, Calendar, Download, Save, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getClientDisplayNames } from '@/lib/client-display-name';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface NutritionFormData {
  guidanceTitle: string;
  overview: string;
  mealPlanDetails: string;
  dietaryNotes: string;
  dateIssued: string;
  supportingDocument: string;
  clientId?: string;
}

export default function ClientNutritionPage() {
  const { member } = useMember();
  const [nutritionItems, setNutritionItems] = useState<NutritionGuidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NutritionGuidance | null>(null);
  const [clients, setClients] = useState<Map<string, string>>(new Map());
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<NutritionFormData>({
    guidanceTitle: '',
    overview: '',
    mealPlanDetails: '',
    dietaryNotes: '',
    dateIssued: new Date().toISOString().split('T')[0],
    supportingDocument: '',
    clientId: '',
  });

  const fetchNutritionData = async () => {
    if (!member?._id) return;

    try {
      setLoading(true);
      
      // Get all nutrition guidance
      const { items } = await BaseCrudService.getAll<NutritionGuidance>('nutritionguidance');
      
      // Sort by date issued (most recent first)
      const sorted = items.sort((a, b) => 
        new Date(b.dateIssued || '').getTime() - new Date(a.dateIssued || '').getTime()
      );
      
      setNutritionItems(sorted);

      // Get trainer's clients for the filter
      const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
      const trainerAssignments = assignments.filter(a => a.trainerId === member._id && a.status === 'active');
      const clientIds = trainerAssignments.map(a => a.clientId).filter(Boolean) as string[];
      
      if (clientIds.length > 0) {
        const displayNames = await getClientDisplayNames(clientIds);
        setClients(displayNames);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, [member?._id]);

  const handleOpenDialog = (item?: NutritionGuidance) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        guidanceTitle: item.guidanceTitle || '',
        overview: item.overview || '',
        mealPlanDetails: item.mealPlanDetails || '',
        dietaryNotes: item.dietaryNotes || '',
        dateIssued: item.dateIssued ? new Date(item.dateIssued).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        supportingDocument: item.supportingDocument || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        guidanceTitle: '',
        overview: '',
        mealPlanDetails: '',
        dietaryNotes: '',
        dateIssued: new Date().toISOString().split('T')[0],
        supportingDocument: '',
        clientId: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        // Update existing item
        await BaseCrudService.update<NutritionGuidance>('nutritionguidance', {
          _id: editingItem._id,
          guidanceTitle: formData.guidanceTitle,
          overview: formData.overview,
          mealPlanDetails: formData.mealPlanDetails,
          dietaryNotes: formData.dietaryNotes,
          dateIssued: formData.dateIssued,
          supportingDocument: formData.supportingDocument,
        });

        // Optimistic update
        setNutritionItems(prev => 
          prev.map(item => 
            item._id === editingItem._id 
              ? { ...item, ...formData }
              : item
          )
        );
      } else {
        // Create new item
        const newItem = await BaseCrudService.create<NutritionGuidance>('nutritionguidance', {
          _id: crypto.randomUUID(),
          guidanceTitle: formData.guidanceTitle,
          overview: formData.overview,
          mealPlanDetails: formData.mealPlanDetails,
          dietaryNotes: formData.dietaryNotes,
          dateIssued: formData.dateIssued,
          supportingDocument: formData.supportingDocument,
        });

        // Optimistic update
        setNutritionItems(prev => [newItem, ...prev]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving nutrition guidance:', error);
      // Reload data on error
      fetchNutritionData();
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this nutrition guidance? This action cannot be undone.')) {
      return;
    }

    try {
      // Optimistic update
      setNutritionItems(prev => prev.filter(item => item._id !== itemId));
      
      await BaseCrudService.delete('nutritionguidance', itemId);
    } catch (error) {
      console.error('Error deleting nutrition guidance:', error);
      // Reload data on error
      fetchNutritionData();
    }
  };

  const filteredNutritionItems = nutritionItems;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-charcoal-black">
            Client Nutrition Management
          </h1>
          <p className="text-warm-grey mt-2">
            Create and manage nutrition guidance for your clients
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-soft-bronze hover:bg-soft-bronze/90 text-soft-white"
            >
              <Plus size={20} className="mr-2" />
              Create Nutrition Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">
                {editingItem ? 'Edit Nutrition Guidance' : 'Create Nutrition Guidance'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="guidanceTitle">Plan Title *</Label>
                <Input
                  id="guidanceTitle"
                  value={formData.guidanceTitle}
                  onChange={(e) => setFormData({ ...formData, guidanceTitle: e.target.value })}
                  placeholder="e.g., Sustainable Fat Loss Nutrition Plan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateIssued">Date Issued *</Label>
                <Input
                  id="dateIssued"
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Provide a brief overview of this nutrition plan and its goals..."
                  rows={4}
                />
                <p className="text-xs text-warm-grey">
                  Explain the purpose and key principles of this nutrition plan
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealPlanDetails">Meal Plan Details</Label>
                <Textarea
                  id="mealPlanDetails"
                  value={formData.mealPlanDetails}
                  onChange={(e) => setFormData({ ...formData, mealPlanDetails: e.target.value })}
                  placeholder="Example meals, portion sizes, meal timing, etc..."
                  rows={8}
                />
                <p className="text-xs text-warm-grey">
                  Include specific meal examples, portion guidelines, and timing recommendations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryNotes">Dietary Notes & Guidelines</Label>
                <Textarea
                  id="dietaryNotes"
                  value={formData.dietaryNotes}
                  onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
                  placeholder="Special considerations, restrictions, supplements, hydration tips..."
                  rows={6}
                />
                <p className="text-xs text-warm-grey">
                  Add any special dietary considerations, restrictions, or helpful tips
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportingDocument">Supporting Document URL (Optional)</Label>
                <Input
                  id="supportingDocument"
                  type="url"
                  value={formData.supportingDocument}
                  onChange={(e) => setFormData({ ...formData, supportingDocument: e.target.value })}
                  placeholder="https://example.com/meal-plan.pdf"
                />
                <p className="text-xs text-warm-grey">
                  Link to a PDF, Google Doc, or other downloadable resource
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-soft-bronze hover:bg-soft-bronze/90 text-soft-white"
                >
                  <Save size={16} className="mr-2" />
                  {editingItem ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Nutrition Items List */}
      {filteredNutritionItems.length > 0 ? (
        <div className="grid gap-6">
          {filteredNutritionItems.map((item) => (
            <Card key={item._id} className="border-warm-sand-beige hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-heading text-2xl text-charcoal-black mb-2">
                      {item.guidanceTitle}
                    </CardTitle>
                    {item.dateIssued && (
                      <div className="flex items-center gap-2 text-warm-grey text-sm">
                        <Calendar size={16} />
                        <span>
                          Issued: {new Date(item.dateIssued).toLocaleDateString('en-GB', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(item)}
                      className="border-soft-bronze text-soft-bronze hover:bg-soft-bronze hover:text-soft-white"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.overview && (
                  <div>
                    <h4 className="font-paragraph font-semibold text-charcoal-black mb-2">Overview</h4>
                    <p className="text-sm text-charcoal-black/80 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {item.overview}
                    </p>
                  </div>
                )}
                
                {item.mealPlanDetails && (
                  <div>
                    <h4 className="font-paragraph font-semibold text-charcoal-black mb-2">Meal Plan Details</h4>
                    <p className="text-sm text-charcoal-black/80 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {item.mealPlanDetails}
                    </p>
                  </div>
                )}

                {item.dietaryNotes && (
                  <div>
                    <h4 className="font-paragraph font-semibold text-charcoal-black mb-2">Dietary Notes</h4>
                    <p className="text-sm text-charcoal-black/80 leading-relaxed whitespace-pre-wrap line-clamp-2">
                      {item.dietaryNotes}
                    </p>
                  </div>
                )}

                {item.supportingDocument && (
                  <div className="pt-2 border-t border-warm-sand-beige">
                    <a
                      href={item.supportingDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-soft-bronze hover:text-soft-bronze/80 font-medium"
                    >
                      <Download size={16} />
                      Download Supporting Document
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-warm-sand-beige">
          <CardContent className="py-12 text-center">
            <Users size={48} className="mx-auto text-warm-grey mb-4" />
            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
              No Nutrition Plans Yet
            </h3>
            <p className="text-warm-grey mb-6">
              Create your first nutrition guidance plan to help your clients achieve their goals.
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-soft-bronze hover:bg-soft-bronze/90 text-soft-white"
            >
              <Plus size={20} className="mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
