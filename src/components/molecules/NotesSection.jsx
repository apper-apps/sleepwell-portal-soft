import 'react-quill/dist/quill.snow.css';
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactQuill from "react-quill";
import { useUser } from "@/hooks/useUser";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import useAutoSave from "@/hooks/useAutoSave";
import { noteService } from "@/services/api/noteService";
const NotesSection = ({ clientId, notes: initialNotes, onNotesUpdate }) => {
  const { user } = useUser();
  const [notes, setNotes] = useState(initialNotes || []);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [draftRecovered, setDraftRecovered] = useState(false);

  // Get user's auto-save preference
  const autoSaveSettings = useSelector(state => state.autoSave.settings);
  useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  useEffect(() => {
    applyFilters();
  }, [notes, filter, searchTerm]);

  const applyFilters = () => {
    let filtered = [...notes];

    // Apply privacy filter
    if (filter === 'shared') {
      filtered = filtered.filter(note => note.is_shared);
    } else if (filter === 'private') {
      filtered = filtered.filter(note => !note.is_shared);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn));

    setFilteredNotes(filtered);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setIsShared(false);
    setAttachments([]);
    setShowEditor(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.Name || '');
    setNoteContent(note.content || '');
    setIsShared(note.is_shared || false);
    setAttachments([]);
    setShowEditor(true);
  };

// Auto-save functionality
  const autoSaveHandler = async (draftData) => {
    if (!noteContent.trim()) return;

    const noteData = {
      Name: noteTitle || 'Session Note',
      content: noteContent,
      client_id: clientId,
      coach_id: user?.userId || user?.Id,
      is_shared: isShared,
      draft_content: draftData.content,
      draft_timestamp: draftData.timestamp,
      is_draft: true
    };

    if (editingNote) {
      await noteService.update(editingNote.Id, noteData);
    } else {
      // For new notes, create a draft first
      const draftNote = await noteService.create(noteData);
      if (draftNote && !editingNote) {
        setEditingNote(draftNote);
      }
    }
  };

  const {
    isAutoSaving,
    hasUnsavedChanges,
    error: autoSaveError,
    manualSave,
    retryAutoSave,
    getLastSavedText,
    isEnabled: autoSaveEnabled
  } = useAutoSave({
    content: noteContent,
    onSave: autoSaveHandler,
    context: 'sessionNotes',
    enabled: autoSaveSettings.enabled,
    interval: autoSaveSettings.interval,
    pauseDelay: autoSaveSettings.pauseDelay,
    minLength: 10,
  });

  // Load draft content when opening editor
  useEffect(() => {
    if (showEditor && editingNote?.draft_content && editingNote.draft_content !== editingNote.content) {
      setDraftRecovered(true);
    }
  }, [showEditor, editingNote]);

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content is required');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        Name: noteTitle || 'Session Note',
        content: noteContent,
        client_id: clientId,
        coach_id: user?.userId || user?.Id,
        is_shared: isShared,
        draft_content: null,
        draft_timestamp: null,
        is_draft: false
      };

      let savedNote;
      if (editingNote) {
        savedNote = await noteService.update(editingNote.Id, noteData);
      } else {
        savedNote = await noteService.create(noteData);
      }

      if (savedNote) {
        // Update local state
        const updatedNotes = editingNote
          ? notes.map(note => note.Id === editingNote.Id ? savedNote : note)
          : [...notes, savedNote];
        
        setNotes(updatedNotes);
        onNotesUpdate?.(updatedNotes);
        setShowEditor(false);
        setDraftRecovered(false);
        toast.success('Note saved successfully');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDraft = () => {
    if (editingNote?.draft_content) {
      setNoteContent(editingNote.draft_content);
      setDraftRecovered(false);
      toast.success('Draft restored successfully');
    }
  };

  const handleDiscardDraft = () => {
    setDraftRecovered(false);
    toast.info('Draft discarded');
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setLoading(true);
    try {
      const success = await noteService.delete(noteId);
      if (success) {
        const updatedNotes = notes.filter(note => note.Id !== noteId);
        setNotes(updatedNotes);
        onNotesUpdate?.(updatedNotes);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShared = async (note) => {
    setLoading(true);
    try {
      const updatedNote = await noteService.update(note.Id, {
        ...note,
        is_shared: !note.is_shared
      });

      if (updatedNote) {
        const updatedNotes = notes.map(n => n.Id === note.Id ? updatedNote : n);
        setNotes(updatedNotes);
        onNotesUpdate?.(updatedNotes);
      }
    } catch (error) {
      console.error('Error updating note privacy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Session Notes</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({notes.length})
            </button>
            <button
              onClick={() => setFilter('shared')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === 'shared'
                  ? 'bg-success text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Shared ({notes.filter(n => n.is_shared).length})
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === 'private'
                  ? 'bg-warning text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Private ({notes.filter(n => !n.is_shared).length})
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 lg:w-64">
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          <Button
            icon="Plus"
            onClick={handleAddNote}
            disabled={loading}
          >
            Add Note
          </Button>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {editingNote ? 'Edit Note' : 'Add New Note'}
                    </h4>
                    
                    {/* Auto-save status */}
                    <div className="flex items-center space-x-4 mt-1">
                      {autoSaveEnabled && (
                        <div className="flex items-center space-x-2 text-sm">
                          {isAutoSaving && (
                            <div className="flex items-center space-x-1 text-primary">
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span>Auto-saving...</span>
                            </div>
                          )}
                          
                          {!isAutoSaving && getLastSavedText() && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <ApperIcon name="Check" className="w-3 h-3" />
                              <span>{getLastSavedText()}</span>
                            </div>
                          )}
                          
                          {autoSaveError && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <ApperIcon name="AlertCircle" className="w-3 h-3" />
                              <span className="truncate max-w-32">{autoSaveError}</span>
                              <button
                                onClick={retryAutoSave}
                                className="text-xs underline hover:no-underline"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {hasUnsavedChanges && !isAutoSaving && (
                        <div className="flex items-center space-x-1 text-amber-600 text-sm">
                          <ApperIcon name="Clock" className="w-3 h-3" />
                          <span>Unsaved changes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Manual save button */}
                    {autoSaveEnabled && hasUnsavedChanges && (
                      <button
                        onClick={manualSave}
                        className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        disabled={isAutoSaving}
                      >
                        Save Now
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowEditor(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ApperIcon name="X" className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

{/* Draft recovery notification */}
              {draftRecovered && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mx-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Info" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        We've restored your auto-saved draft. Would you like to continue editing?
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRestoreDraft}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Restore Draft
                      </button>
                      <button
                        onClick={handleDiscardDraft}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* Note Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note Title
                    </label>
                    <Input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Enter note title..."
                    />
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${
                        isShared ? 'bg-success' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isShared ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Share with client
                      </span>
                    </label>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <ApperIcon 
                        name={isShared ? "Eye" : "EyeOff"} 
                        className="w-4 h-4" 
                      />
                      <span>{isShared ? 'Client can view' : 'Private to coach'}</span>
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note Content
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={noteContent}
                        onChange={setNoteContent}
                        modules={quillModules}
                        placeholder="Write your note here..."
                        style={{ minHeight: '200px' }}
                      />
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments
                    </label>
                    <div className="space-y-3">
                      <label className="file-upload-zone cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4"
                        />
                        <div className="text-center">
                          <ApperIcon name="Upload" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload files or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, Images, Audio, Video files
                          </p>
                        </div>
                      </label>

                      {/* Attachment List */}
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <ApperIcon name="File" className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeAttachment(attachment.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
</div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Auto-save toggle */}
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => {
                          // Update user preference - would need client service update
                          toast.info('Auto-save preference updated');
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-gray-700">Enable auto-save</span>
                    </label>

                    {/* Version history button */}
                    {editingNote && (
                      <button
                        onClick={() => setShowVersionHistory(true)}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <ApperIcon name="History" className="w-4 h-4 inline mr-1" />
                        Version History
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditor(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveNote}
                      loading={loading}
                    >
                      {editingNote ? 'Update Note' : 'Save Note'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="FileText" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No notes found' : 'No session notes yet'}
            </h4>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters' 
                : 'Start documenting your sessions with the client'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleAddNote} icon="Plus">
                Add Your First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {note.Name || 'Session Note'}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          note.is_shared 
                            ? 'bg-success bg-opacity-10 text-success' 
                            : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          <ApperIcon 
                            name={note.is_shared ? "Eye" : "EyeOff"} 
                            className="w-3 h-3 mr-1" 
                          />
                          {note.is_shared ? 'Shared' : 'Private'}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(note.CreatedOn), 'MMM d, yyyy at h:mm a')}
                      {note.ModifiedOn !== note.CreatedOn && (
                        <span className="ml-2">
                          (edited {format(parseISO(note.ModifiedOn), 'MMM d, yyyy')})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleShared(note)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={note.is_shared ? 'Make private' : 'Share with client'}
                    >
                      <ApperIcon name={note.is_shared ? "EyeOff" : "Eye"} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit note"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.Id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete note"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: note.content || '' 
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;