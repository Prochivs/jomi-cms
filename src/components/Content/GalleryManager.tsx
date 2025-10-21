import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Image as ImageIcon } from 'lucide-react';
import { galleryApi } from '../../services/api';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  coverImage: string;
  photos: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

const GalleryManager: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'general',
  });

  // File upload states
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  // Load gallery items
  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const items = await galleryApi.getAll();
      console.log('Loaded gallery items:', items);
      setGalleryItems(items);
      setError(null);
    } catch (err) {
      console.error('Error loading gallery items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      category: 'general',
    });
    setCoverImageFile(null);
    setPhotoFiles([]);
    setCoverImagePreview('');
    setPhotosPreviews([]);
    setShowForm(true);
    // Clear any previous errors when starting to create
    setError(null);
  };

  const handleEdit = (item: GalleryItem) => {
    console.log('Editing gallery item:', item);
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      category: item.category,
    });
    // Note: For editing, we'll keep existing images and allow adding new ones
    setCoverImageFile(null);
    setPhotoFiles([]);
    setCoverImagePreview(item.coverImage || '');
    setPhotosPreviews(item.photos || []);
    setShowForm(true);
    // Clear any previous errors when starting to edit
    setError(null);
  };

  const handleFormSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      console.log('Submitting form:', { editingItem: !!editingItem, formData });
      
      // Create FormData for file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('date', formData.date);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      
      if (coverImageFile) {
        formDataObj.append('coverImage', coverImageFile);
      }
      
      photoFiles.forEach((file) => {
        formDataObj.append('photos', file);
      });
      
      if (editingItem) {
        console.log('Updating gallery with ID:', editingItem.id);
        await galleryApi.update(editingItem.id, formDataObj);
        console.log('Gallery updated successfully');
      } else {
        console.log('Creating new gallery');
        await galleryApi.create(formDataObj);
        console.log('Gallery created successfully');
      }
      
      // Clear any previous errors
      setError(null);
      
      // Reload gallery items to show the new/updated item
      await loadGalleryItems();
      
      // Close form and reset all form state
      setShowForm(false);
      setEditingItem(null);
      
      // Reset form data
      setFormData({
        title: '',
        description: '',
        date: '',
        category: 'general',
      });
      setCoverImageFile(null);
      setPhotoFiles([]);
      setCoverImagePreview('');
      setPhotosPreviews([]);
      
    } catch (err) {
      console.error('Error in form submit:', err);
      setError(err instanceof Error ? err.message : 'Failed to save gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting gallery with ID:', id);
      await galleryApi.delete(id);
      console.log('Gallery deleted successfully');
      
      // Clear any previous errors
      setError(null);
      
      // Reload gallery items to reflect the deletion
      await loadGalleryItems();
      
      // Close delete confirmation dialog
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Error deleting gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete gallery item');
      // Keep the delete confirmation dialog open so user can try again
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files);
    
    // Create previews
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setPhotosPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      category: 'general',
    });
    setCoverImageFile(null);
    setPhotoFiles([]);
    setCoverImagePreview('');
    setPhotosPreviews([]);
    // Clear any errors when canceling
    setError(null);
  };

  const filteredItems = galleryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-gray-600 mt-1">Manage photo galleries and albums</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Gallery</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search galleries by title, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Debug Info:</h4>
          <p className="text-blue-700 text-sm">Total items: {galleryItems.length}</p>
          <p className="text-blue-700 text-sm">Filtered items: {filteredItems.length}</p>
          {galleryItems.length > 0 && (
            <div className="mt-2">
              <p className="text-blue-700 text-sm font-semibold">First item data:</p>
              <pre className="text-xs text-blue-600 bg-blue-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(galleryItems[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Gallery Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Cover Image */}
            <div className="h-48 bg-gray-200 relative">
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('Image loaded successfully:', item.coverImage);
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', item.coverImage);
                    e.currentTarget.style.display = 'none';
                    // Show fallback
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                    fallback.innerHTML = `
                      <div class="text-center">
                        <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-xs text-gray-500">Image failed to load</p>
                      </div>
                    `;
                    if (e.currentTarget.parentNode) {
                      e.currentTarget.parentNode.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {item.photos?.length || 0} photos
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {item.category}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No galleries found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first gallery'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Gallery
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit Gallery' : 'Add New Gallery'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gallery Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter gallery title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe the gallery"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Events, Ministry, General"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {coverImagePreview && (
                    <img src={coverImagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {photosPreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {photosPreviews.map((preview, idx) => (
                        <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="h-20 w-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Select multiple images to upload
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${
                    submitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                    submitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingItem ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Gallery' : 'Create Gallery'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Gallery</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gallery? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;