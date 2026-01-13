import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import {
  Plus,
  Trash2,
  Copy,
  Share2,
  Loader,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  BarChart3,
} from 'lucide-react';
import {
  getTrainerSnippets,
  getSnippetLibrarySummary,
  deleteSnippet,
  duplicateSnippet,
  createSnippet,
  AISnippet,
  SnippetType,
  SnippetCategory,
} from '@/lib/ai-snippets-manager';

const SNIPPET_TYPES: SnippetType[] = ['warm-up', 'progression', 'coaching-cue', 'finisher', 'circuit', 'cooldown', 'mobility'];
const SNIPPET_CATEGORIES: SnippetCategory[] = ['strength', 'hypertrophy', 'endurance', 'mobility', 'recovery', 'general'];

interface LibrarySummary {
  totalSnippets: number;
  byType: Record<SnippetType, number>;
  byCategory: Record<SnippetCategory, number>;
  mostUsed: AISnippet[];
  recentlyAdded: AISnippet[];
}

export default function AISnippetsLibrary() {
  const { member } = useMember();
  const [snippets, setSnippets] = useState<AISnippet[]>([]);
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<SnippetType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<SnippetCategory | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newSnippet, setNewSnippet] = useState({
    snippetName: '',
    snippetType: 'warm-up' as SnippetType,
    content: '',
    category: 'general' as SnippetCategory,
    tags: '',
    description: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!member?._id) return;
      try {
        setIsLoading(true);
        const [snippetsData, summaryData] = await Promise.all([
          getTrainerSnippets(member._id),
          getSnippetLibrarySummary(member._id),
        ]);
        setSnippets(snippetsData);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error loading snippets:', error);
        setMessage({ type: 'error', text: 'Failed to load snippets' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [member?._id]);

  const handleCreateSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?._id) return;

    setIsCreating(true);
    try {
      const created = await createSnippet(member._id, {
        snippetName: newSnippet.snippetName,
        snippetType: newSnippet.snippetType,
        content: newSnippet.content,
        category: newSnippet.category,
        tags: newSnippet.tags.split(',').map(t => t.trim()),
        description: newSnippet.description,
        isShared: false,
      });

      setSnippets([created, ...snippets]);
      setNewSnippet({
        snippetName: '',
        snippetType: 'warm-up',
        content: '',
        category: 'general',
        tags: '',
        description: '',
      });
      setShowCreateForm(false);
      setMessage({ type: 'success', text: 'Snippet created successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error creating snippet:', error);
      setMessage({ type: 'error', text: 'Failed to create snippet' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;

    try {
      await deleteSnippet(snippetId);
      setSnippets(snippets.filter(s => s._id !== snippetId));
      setMessage({ type: 'success', text: 'Snippet deleted' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting snippet:', error);
      setMessage({ type: 'error', text: 'Failed to delete snippet' });
    }
  };

  const handleDuplicateSnippet = async (snippet: AISnippet) => {
    if (!member?._id) return;

    try {
      const duplicated = await duplicateSnippet(
        snippet._id,
        member._id,
        `${snippet.snippetName} (Copy)`
      );
      setSnippets([duplicated, ...snippets]);
      setMessage({ type: 'success', text: 'Snippet duplicated' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error duplicating snippet:', error);
      setMessage({ type: 'error', text: 'Failed to duplicate snippet' });
    }
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch =
      s.snippetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || s.snippetType === filterType;
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg flex gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          )}
          <p
            className={`font-paragraph text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-soft-white border border-warm-sand-beige rounded-xl p-4">
            <p className="font-paragraph text-xs text-warm-grey mb-1">Total Snippets</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">
              {summary.totalSnippets}
            </p>
          </div>

          {Object.entries(summary.byType).map(([type, count]) => (
            count > 0 && (
              <div key={type} className="bg-soft-white border border-warm-sand-beige rounded-xl p-4">
                <p className="font-paragraph text-xs text-warm-grey mb-1 capitalize">
                  {type.replace('-', ' ')}
                </p>
                <p className="font-heading text-3xl font-bold text-soft-bronze">{count}</p>
              </div>
            )
          ))}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="flex items-center gap-2 bg-charcoal-black text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
      >
        <Plus size={20} />
        New Snippet
      </button>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateSnippet} className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-8 space-y-6">
          <h3 className="font-heading text-2xl font-bold text-charcoal-black">
            Create New Snippet
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Snippet Name *
              </label>
              <input
                type="text"
                value={newSnippet.snippetName}
                onChange={(e) => setNewSnippet({ ...newSnippet, snippetName: e.target.value })}
                required
                placeholder="e.g., 5-Minute Dynamic Warm-up"
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Type *
              </label>
              <select
                value={newSnippet.snippetType}
                onChange={(e) => setNewSnippet({ ...newSnippet, snippetType: e.target.value as SnippetType })}
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                {SNIPPET_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Category *
              </label>
              <select
                value={newSnippet.category}
                onChange={(e) => setNewSnippet({ ...newSnippet, category: e.target.value as SnippetCategory })}
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                {SNIPPET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newSnippet.tags}
                onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
                placeholder="e.g., quick, energizing, no-equipment"
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>
          </div>

          <div>
            <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
              Description
            </label>
            <textarea
              value={newSnippet.description}
              onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
              placeholder="Brief description of this snippet..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
            />
          </div>

          <div>
            <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
              Content *
            </label>
            <textarea
              value={newSnippet.content}
              onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
              required
              placeholder="Paste your snippet content here..."
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Snippet
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
            />
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as SnippetType | 'all')}
          className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
        >
          <option value="all">All Types</option>
          {SNIPPET_TYPES.map(type => (
            <option key={type} value={type}>
              {type.replace('-', ' ').toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as SnippetCategory | 'all')}
          className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
        >
          <option value="all">All Categories</option>
          {SNIPPET_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Snippets Grid */}
      {filteredSnippets.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSnippets.map(snippet => (
            <div
              key={snippet._id}
              className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-1">
                    {snippet.snippetName}
                  </h3>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span className="px-2 py-1 bg-soft-bronze/10 text-soft-bronze text-xs rounded font-medium">
                      {snippet.snippetType.replace('-', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-warm-sand-beige text-charcoal-black text-xs rounded font-medium">
                      {snippet.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-paragraph text-xs text-warm-grey">Used</p>
                  <p className="font-heading text-2xl font-bold text-soft-bronze">
                    {snippet.usageCount}
                  </p>
                </div>
              </div>

              {snippet.description && (
                <p className="font-paragraph text-sm text-warm-grey mb-4">
                  {snippet.description}
                </p>
              )}

              {snippet.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {snippet.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-warm-sand-beige/20 text-charcoal-black text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-3 bg-charcoal-black/5 rounded-lg mb-4 max-h-[100px] overflow-hidden">
                <p className="font-paragraph text-xs text-charcoal-black/70 whitespace-pre-wrap line-clamp-3">
                  {snippet.content}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicateSnippet(snippet)}
                  className="flex-1 flex items-center justify-center gap-2 bg-warm-sand-beige text-charcoal-black py-2 rounded-lg font-medium text-sm hover:bg-warm-sand-beige/80 transition-colors"
                >
                  <Copy size={16} />
                  Duplicate
                </button>
                <button
                  onClick={() => handleDeleteSnippet(snippet._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-soft-white border border-warm-sand-beige rounded-2xl">
          <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
          <p className="font-paragraph text-lg text-charcoal-black">
            {snippets.length === 0 ? 'No snippets yet' : 'No snippets match your filters'}
          </p>
          <p className="font-paragraph text-sm text-warm-grey mt-2">
            {snippets.length === 0
              ? 'Create your first snippet to get started'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      )}
    </div>
  );
}
