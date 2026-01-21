import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary, TrainerClientAssignments } from '@/entities';
import { 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Globe, 
  Lock,
  Search,
  Filter,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { getTrainerClients } from '@/lib/role-utils';

interface VideoFormData {
  videoTitle: string;
  description: string;
  videoUrl: string;
  category: string;
  isPublic: boolean;
  accessTags: string;
  uploadType: 'url' | 'file';
}

interface ClientInfo {
  clientId: string;
  clientName: string;
}

export default function VideoLibraryManagementPage() {
  const { member } = useMember();
  const [videos, setVideos] = useState<PrivateVideoLibrary[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<PrivateVideoLibrary | null>(null);
  const [formData, setFormData] = useState<VideoFormData>({
    videoTitle: '',
    description: '',
    videoUrl: '',
    category: 'Strength',
    isPublic: false,
    accessTags: '',
  });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, [member?._id]);

  const fetchData = async () => {
    if (!member?._id) return;

    try {
      setLoading(true);

      // Fetch trainer's clients
      const assignments = await getTrainerClients(member._id);
      const clientInfos: ClientInfo[] = assignments.map(a => ({
        clientId: a.clientId || '',
        clientName: a.clientId?.slice(0, 8) || 'Unknown Client', // In production, fetch actual names
      }));
      setClients(clientInfos);

      // Fetch all videos created by this trainer or public videos
      const { items } = await BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary');
      
      // Filter to show only:
      // 1. Videos created by this trainer (accessTags contains trainer ID)
      // 2. Public videos created by this trainer
      // 3. Exclude client-submitted videos (category !== 'exercise-review')
      const trainerVideos = items.filter(v => {
        // Exclude client exercise review submissions
        if (v.category === 'exercise-review') return false;
        
        // Show if trainer ID is in accessTags (trainer created it)
        if (v.accessTags?.includes(member._id)) return true;
        
        // Show if it's a public video (for reference)
        if (v.isPublic === true) return true;
        
        return false;
      });

      setVideos(trainerVideos);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = () => {
    setEditingVideo(null);
    setFormData({
      videoTitle: '',
      description: '',
      videoUrl: '',
      category: 'Strength',
      isPublic: false,
      accessTags: '',
      uploadType: 'file',
    });
    setSelectedClients([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setShowCreateModal(true);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleEditVideo = (video: PrivateVideoLibrary) => {
    setEditingVideo(video);
    setFormData({
      videoTitle: video.videoTitle || '',
      description: video.description || '',
      videoUrl: video.videoUrl || '',
      category: video.category || 'Strength',
      isPublic: video.isPublic || false,
      accessTags: video.accessTags || '',
      uploadType: 'url',
    });
    
    // Parse selected clients from accessTags
    const tags = (video.accessTags || '').split(',').map(t => t.trim()).filter(Boolean);
    const clientIds = tags.filter(tag => clients.some(c => c.clientId === tag));
    setSelectedClients(clientIds);
    
    setSelectedFile(null);
    setUploadProgress(0);
    setShowCreateModal(true);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await BaseCrudService.delete('privatevideolibrary', videoId);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      setSubmitSuccess('Video deleted successfully');
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting video:', error);
      setSubmitError('Failed to delete video');
      setTimeout(() => setSubmitError(''), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Please upload a valid video file (MP4, MOV, AVI, or WebM)');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setSubmitError(`File size must be less than 100MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    setSelectedFile(file);
    setSubmitError('');
  };

  const uploadVideoFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          setUploadProgress(50);
          
          const response = await fetch('/_functions/uploadVideo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              base64: base64,
            }),
          });

          setUploadProgress(75);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const data = await response.json();
          
          setUploadProgress(100);
          
          if (!data.url) {
            throw new Error('No URL returned from upload');
          }

          resolve(data.url);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Validation
      if (!formData.videoTitle.trim()) {
        setSubmitError('Please enter a video title');
        setIsSubmitting(false);
        return;
      }

      let videoUrl = formData.videoUrl;

      // Handle file upload
      if (formData.uploadType === 'file') {
        if (!selectedFile && !editingVideo) {
          setSubmitError('Please select a video file to upload');
          setIsSubmitting(false);
          return;
        }

        if (selectedFile) {
          setUploadProgress(10);
          videoUrl = await uploadVideoFile(selectedFile);
        }
      } else {
        // URL validation
        if (!formData.videoUrl.trim()) {
          setSubmitError('Please enter a video URL');
          setIsSubmitting(false);
          return;
        }

        // Validate URL format
        try {
          new URL(formData.videoUrl);
        } catch {
          setSubmitError('Please enter a valid video URL');
          setIsSubmitting(false);
          return;
        }
      }

      // Build accessTags: include trainer ID and selected client IDs
      const tags = [member?._id || '', ...selectedClients].filter(Boolean);
      const accessTagsString = tags.join(',');

      const videoData: PrivateVideoLibrary = {
        _id: editingVideo?._id || crypto.randomUUID(),
        videoTitle: formData.videoTitle,
        description: formData.description,
        videoUrl: videoUrl,
        category: formData.category,
        isPublic: formData.isPublic,
        accessTags: accessTagsString,
      };

      if (editingVideo) {
        // Update existing video
        await BaseCrudService.update('privatevideolibrary', videoData);
        setVideos(prev => prev.map(v => v._id === videoData._id ? videoData : v));
        setSubmitSuccess('Video updated successfully');
      } else {
        // Create new video
        await BaseCrudService.create('privatevideolibrary', videoData);
        setVideos(prev => [videoData, ...prev]);
        setSubmitSuccess('Video created successfully');
      }

      // Close modal after short delay
      setTimeout(() => {
        setShowCreateModal(false);
        setSubmitSuccess('');
        setUploadProgress(0);
      }, 1500);
    } catch (error) {
      console.error('Error saving video:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save video. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const filteredVideos = videos
    .filter(v => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          v.videoTitle?.toLowerCase().includes(query) ||
          v.description?.toLowerCase().includes(query) ||
          v.category?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(v => {
      // Visibility filter
      if (filterVisibility === 'public') return v.isPublic === true;
      if (filterVisibility === 'private') return v.isPublic !== true;
      return true;
    });

  if (loading) {
    return (
      <div className="p-8 lg:p-12 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading video library...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
              Video Library Management
            </h1>
            <p className="text-lg text-warm-grey">
              Create and manage exercise videos for your clients
            </p>
          </div>
          <button
            onClick={handleCreateVideo}
            className="flex items-center gap-2 bg-charcoal-black text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze transition-colors font-medium"
          >
            <Plus size={20} />
            Create Video
          </button>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="font-paragraph text-sm text-green-800">{submitSuccess}</p>
          </div>
        )}
        {submitError && !showCreateModal && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="font-paragraph text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>

            {/* Visibility Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-warm-grey" />
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as 'all' | 'public' | 'private')}
                className="px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                <option value="all">All Videos</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <Video className="mx-auto text-warm-grey mb-4" size={48} />
            <p className="text-warm-grey text-lg mb-6">
              {videos.length === 0 
                ? 'No videos yet. Create your first video to get started!'
                : 'No videos match your search criteria.'}
            </p>
            {videos.length === 0 && (
              <button
                onClick={handleCreateVideo}
                className="inline-flex items-center gap-2 bg-charcoal-black text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze transition-colors font-medium"
              >
                <Plus size={20} />
                Create Your First Video
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const isPublic = video.isPublic === true;
              const assignedClientIds = (video.accessTags || '')
                .split(',')
                .map(t => t.trim())
                .filter(id => id && id !== member?._id);
              const assignedCount = assignedClientIds.length;

              return (
                <div
                  key={video._id}
                  className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden hover:border-soft-bronze transition-all"
                >
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-charcoal-black/10 flex items-center justify-center relative group">
                    <Video className="text-warm-grey" size={48} />
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-charcoal-black/0 group-hover:bg-charcoal-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Eye className="text-soft-white" size={32} />
                    </a>
                    
                    {/* Visibility Badge */}
                    <div className="absolute top-3 right-3">
                      {isPublic ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Globe size={12} />
                          Public
                        </div>
                      ) : (
                        <div className="bg-warm-grey text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Lock size={12} />
                          Private
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2 line-clamp-2">
                      {video.videoTitle}
                    </h3>
                    
                    {video.description && (
                      <p className="text-sm text-warm-grey mb-4 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    {/* Category */}
                    {video.category && (
                      <span className="inline-block text-xs font-medium text-charcoal-black bg-warm-sand-beige px-3 py-1 rounded-full mb-4">
                        {video.category}
                      </span>
                    )}

                    {/* Assigned Clients */}
                    {!isPublic && assignedCount > 0 && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-warm-grey">
                        <Users size={16} />
                        <span>Assigned to {assignedCount} client{assignedCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="flex-1 flex items-center justify-center gap-2 bg-warm-sand-beige text-charcoal-black px-4 py-2 rounded-lg hover:bg-soft-bronze hover:text-soft-white transition-colors text-sm font-medium"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-charcoal-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-soft-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-3xl font-bold text-charcoal-black">
                    {editingVideo ? 'Edit Video' : 'Create New Video'}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-warm-grey hover:text-charcoal-black transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="font-paragraph text-sm text-red-800">{submitError}</p>
                  </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    <p className="font-paragraph text-sm text-green-800">{submitSuccess}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Video Title */}
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      value={formData.videoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoTitle: e.target.value }))}
                      placeholder="e.g., Proper Squat Form Tutorial"
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    />
                  </div>

                  {/* Upload Type Selection */}
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
                      Video Source *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadType"
                          value="file"
                          checked={formData.uploadType === 'file'}
                          onChange={(e) => setFormData(prev => ({ ...prev, uploadType: 'file' }))}
                          className="w-4 h-4 text-soft-bronze border-warm-sand-beige focus:ring-soft-bronze"
                        />
                        <span className="text-sm text-charcoal-black">Upload File</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadType"
                          value="url"
                          checked={formData.uploadType === 'url'}
                          onChange={(e) => setFormData(prev => ({ ...prev, uploadType: 'url' }))}
                          className="w-4 h-4 text-soft-bronze border-warm-sand-beige focus:ring-soft-bronze"
                        />
                        <span className="text-sm text-charcoal-black">Video URL</span>
                      </label>
                    </div>
                  </div>

                  {/* File Upload or URL Input */}
                  {formData.uploadType === 'file' ? (
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Upload Video File *
                      </label>
                      <div className="border-2 border-dashed border-warm-sand-beige rounded-lg p-6 text-center hover:border-soft-bronze transition-colors">
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                          onChange={handleFileChange}
                          className="hidden"
                          id="video-file-input"
                        />
                        <label
                          htmlFor="video-file-input"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Video className="text-warm-grey" size={32} />
                          {selectedFile ? (
                            <div className="text-sm">
                              <p className="font-medium text-charcoal-black">{selectedFile.name}</p>
                              <p className="text-warm-grey">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <p className="font-medium text-charcoal-black">Click to upload video</p>
                              <p className="text-warm-grey">MP4, MOV, AVI, or WebM (max 100MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-warm-grey mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-warm-sand-beige rounded-full h-2">
                            <div
                              className="bg-soft-bronze h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Video URL *
                      </label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this video covers..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    >
                      <option value="Strength">Strength</option>
                      <option value="Core">Core</option>
                      <option value="Nutrition">Nutrition</option>
                      <option value="Recovery">Recovery</option>
                      <option value="Postnatal Recovery">Postnatal Recovery</option>
                      <option value="Menopause Support">Menopause Support</option>
                      <option value="Pre-Natal Training">Pre-Natal Training</option>
                      <option value="Mindset & Motivation">Mindset & Motivation</option>
                      <option value="Progress Tracking">Progress Tracking</option>
                    </select>
                  </div>

                  {/* Visibility Settings */}
                  <div className="border border-warm-sand-beige rounded-lg p-6 space-y-4">
                    <h3 className="font-heading text-lg font-bold text-charcoal-black">
                      Visibility Settings
                    </h3>

                    {/* Public Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-paragraph text-sm font-medium text-charcoal-black">
                          Make Public
                        </label>
                        <p className="text-xs text-warm-grey mt-1">
                          Public videos are visible to all clients
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.isPublic ? 'bg-soft-bronze' : 'bg-warm-grey'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Client Assignment */}
                    {!formData.isPublic && (
                      <div>
                        <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                          Assign to Specific Clients
                        </label>
                        <p className="text-xs text-warm-grey mb-3">
                          Select clients who can access this video
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-2 border border-warm-sand-beige rounded-lg p-3">
                          {clients.length === 0 ? (
                            <p className="text-sm text-warm-grey text-center py-4">
                              No clients assigned yet
                            </p>
                          ) : (
                            clients.map(client => (
                              <label
                                key={client.clientId}
                                className="flex items-center gap-3 p-2 hover:bg-warm-sand-beige/30 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedClients.includes(client.clientId)}
                                  onChange={() => toggleClientSelection(client.clientId)}
                                  className="w-4 h-4 text-soft-bronze border-warm-sand-beige rounded focus:ring-soft-bronze"
                                />
                                <span className="text-sm text-charcoal-black">
                                  {client.clientName}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 rounded-lg border border-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-charcoal-black text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          {editingVideo ? 'Update Video' : 'Create Video'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
