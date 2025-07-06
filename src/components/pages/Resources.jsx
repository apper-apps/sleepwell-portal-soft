import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import resourceService from '@/services/api/resourceService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const Resources = () => {
  const { user } = useUser();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'pdf',
    url: '',
    description: '',
    clientAccess: []
  });
  
  useEffect(() => {
    loadResources();
  }, []);
  
  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, typeFilter]);
  
  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAll();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterResources = () => {
    let filtered = resources;
    
    if (searchQuery) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(resource => resource.type === typeFilter);
    }
    
    // Filter by access for clients
    if (user?.role === 'client') {
      filtered = filtered.filter(resource => 
        resource.clientAccess.includes(user.Id.toString()) || 
        resource.clientAccess.includes('all')
      );
    }
    
    setFilteredResources(filtered);
  };
  
  const handleUploadResource = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      await resourceService.create({
        ...uploadForm,
        coachId: user?.Id
      });
      toast.success('Resource uploaded successfully');
      await loadResources();
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        type: 'pdf',
        url: '',
        description: '',
        clientAccess: []
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(resourceId);
        toast.success('Resource deleted successfully');
        await loadResources();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return 'FileText';
      case 'video': return 'Play';
      case 'audio': return 'Volume2';
      case 'link': return 'ExternalLink';
      default: return 'File';
    }
  };
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'error';
      case 'video': return 'primary';
      case 'audio': return 'warning';
      case 'link': return 'info';
      default: return 'gray';
    }
  };
  
  const getAccessText = (clientAccess) => {
    if (clientAccess.includes('all')) return 'All Clients';
    if (clientAccess.length === 0) return 'No Access';
    return `${clientAccess.length} Client${clientAccess.length > 1 ? 's' : ''}`;
  };
  
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadResources} />;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'coach' ? 'Resource Library' : 'My Resources'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'coach' 
              ? 'Manage and share resources with your clients'
              : 'Access educational materials and resources from your coach'
            }
          </p>
        </div>
        
        {user?.role === 'coach' && (
          <Button
            icon="Plus"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Resource
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search resources..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="link">Link</option>
            </select>
            
            <Button
              variant="outline"
              icon="Filter"
              size="sm"
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Resources Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Resources ({filteredResources.length})
          </h3>
        </div>
        
        {filteredResources.length === 0 ? (
          <Empty
            title="No resources found"
            description={searchQuery 
              ? "No resources match your search criteria."
              : user?.role === 'coach' 
                ? "You haven't uploaded any resources yet."
                : "Your coach hasn't shared any resources with you yet."
            }
            icon="BookOpen"
            action={!searchQuery && user?.role === 'coach' ? () => setShowUploadModal(true) : undefined}
            actionLabel="Upload First Resource"
            showAction={!searchQuery && user?.role === 'coach'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredResources.map((resource) => (
              <motion.div
                key={resource.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${getTypeColor(resource.type)} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                      <ApperIcon name={getTypeIcon(resource.type)} className={`w-5 h-5 text-${getTypeColor(resource.type)}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <Badge variant={getTypeColor(resource.type)} size="sm">
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {user?.role === 'coach' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Edit"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleDeleteResource(resource.Id)}
                      />
                    </div>
                  )}
                </div>
                
                {resource.description && (
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {user?.role === 'coach' && (
                      <span>{getAccessText(resource.clientAccess)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon="Download"
                    >
                      Access
                    </Button>
                    
                    {resource.type === 'link' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="ExternalLink"
                        onClick={() => window.open(resource.url, '_blank')}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload Resource</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowUploadModal(false)}
              />
            </div>
            
            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Type</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                  className="form-select"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="link">Web Link</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">
                  {uploadForm.type === 'link' ? 'URL' : 'File URL'}
                </label>
                <input
                  type="url"
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, url: e.target.value }))}
                  className="form-input"
                  placeholder="https://example.com/resource"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  rows="3"
                  placeholder="Brief description of the resource..."
                />
              </div>
              
              <div>
                <label className="form-label">Client Access</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={uploadForm.clientAccess.includes('all')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUploadForm(prev => ({ ...prev, clientAccess: ['all'] }));
                        } else {
                          setUploadForm(prev => ({ ...prev, clientAccess: [] }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">All Clients</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 pt-4">
                <Button
                  type="submit"
                  loading={uploading}
                  disabled={uploading}
                  fullWidth
                >
                  Upload Resource
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowUploadModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Resources;