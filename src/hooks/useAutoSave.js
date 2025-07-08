import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  setSessionNotesAutoSaving,
  setSessionNotesLastSaved,
  setSessionNotesDraftContent,
  setSessionNotesError,
  clearSessionNotesError,
  setMessagesAutoSaving,
  setMessagesLastSaved,
  setMessagesDraftContent,
  setMessagesError,
  clearMessagesError,
} from '@/store/autoSaveSlice';

export const useAutoSave = (options = {}) => {
  const {
    content,
    onSave,
    onError,
    context = 'sessionNotes', // 'sessionNotes' or 'messages'
    enabled = true,
    interval = 15000, // 15 seconds default
    pauseDelay = 3000, // 3 seconds pause detection
    minLength = 5, // Minimum content length to trigger auto-save
  } = options;

  const dispatch = useDispatch();
  const autoSaveState = useSelector(state => state.autoSave);
  const globalSettings = autoSaveState.settings;
  const contextState = autoSaveState[context];

  // Refs for managing timers and state
  const autoSaveTimer = useRef(null);
  const pauseTimer = useRef(null);
  const lastContent = useRef(content);
  const lastSaveTime = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Redux action dispatchers based on context
  const actionDispatchers = {
    sessionNotes: {
      setAutoSaving: setSessionNotesAutoSaving,
      setLastSaved: setSessionNotesLastSaved,
      setDraftContent: setSessionNotesDraftContent,
      setError: setSessionNotesError,
      clearError: clearSessionNotesError,
    },
    messages: {
      setAutoSaving: setMessagesAutoSaving,
      setLastSaved: setMessagesLastSaved,
      setDraftContent: setMessagesDraftContent,
      setError: setMessagesError,
      clearError: clearMessagesError,
    },
  };

  const actions = actionDispatchers[context];

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
    }
  }, []);

  // Perform auto-save operation
  const performAutoSave = useCallback(async (contentToSave) => {
    if (!enabled || !globalSettings.enabled || !contentToSave || contentToSave.length < minLength) {
      return;
    }

    try {
      dispatch(actions.setAutoSaving(true));
      dispatch(actions.clearError());

      // Create draft data
      const draftData = {
        content: contentToSave,
        timestamp: new Date().toISOString(),
        isDraft: true,
      };

      // Call the provided save function
      await onSave(draftData);

      // Update Redux state
      dispatch(actions.setLastSaved(new Date().toISOString()));
      dispatch(actions.setDraftContent(contentToSave));
      
      lastSaveTime.current = new Date().toISOString();
      retryCount.current = 0;

      // Show subtle success feedback
      if (context === 'sessionNotes') {
        toast.success('Session note auto-saved', {
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true,
          className: 'text-sm',
        });
      } else {
        toast.success('Message draft saved', {
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true,
          className: 'text-sm',
        });
      }

    } catch (error) {
      console.error('Auto-save failed:', error);
      
      const errorMessage = error.message || 'Auto-save failed. Please check your connection.';
      dispatch(actions.setError(errorMessage));

      // Implement retry logic
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        
        toast.error(`Auto-save failed. Retrying... (${retryCount.current}/${maxRetries})`, {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
        });

        // Retry after exponential backoff
        setTimeout(() => {
          performAutoSave(contentToSave);
        }, Math.pow(2, retryCount.current) * 1000);
      } else {
        toast.error('Auto-save failed. Please save manually or check your connection.', {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          action: {
            label: 'Retry',
            onClick: () => {
              retryCount.current = 0;
              performAutoSave(contentToSave);
            },
          },
        });
      }

      if (onError) {
        onError(error);
      }
    } finally {
      dispatch(actions.setAutoSaving(false));
    }
  }, [enabled, globalSettings.enabled, minLength, onSave, onError, dispatch, actions, context]);

  // Schedule auto-save after typing pause
  const scheduleAutoSave = useCallback((contentToSave) => {
    clearTimers();

    // Set pause timer - auto-save after user stops typing
    pauseTimer.current = setTimeout(() => {
      performAutoSave(contentToSave);
    }, pauseDelay);

    // Set interval timer - auto-save periodically while typing
    autoSaveTimer.current = setTimeout(() => {
      performAutoSave(contentToSave);
      
      // Reschedule if content is still being modified
      if (lastContent.current === contentToSave) {
        scheduleAutoSave(contentToSave);
      }
    }, interval);
  }, [performAutoSave, pauseDelay, interval, clearTimers]);

  // Handle content changes
  useEffect(() => {
    if (content !== lastContent.current) {
      lastContent.current = content;
      
      if (content && content.length >= minLength) {
        scheduleAutoSave(content);
      } else {
        clearTimers();
      }
    }
  }, [content, minLength, scheduleAutoSave, clearTimers]);

  // Handle browser close/tab switch
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (contextState.hasUnsavedChanges && content && content.length >= minLength) {
        // Attempt synchronous save
        try {
          performAutoSave(content);
        } catch (error) {
          console.error('Failed to save before unload:', error);
        }

        // Show browser warning
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && content && content.length >= minLength) {
        // Save when tab becomes hidden
        performAutoSave(content);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [content, contextState.hasUnsavedChanges, minLength, performAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      
      // Final auto-save on unmount if there are unsaved changes
      if (content && content.length >= minLength && contextState.hasUnsavedChanges) {
        performAutoSave(content);
      }
    };
  }, []);

  // Manual save function
  const manualSave = useCallback(async (contentToSave = content) => {
    if (!contentToSave) return;

    clearTimers();
    await performAutoSave(contentToSave);
  }, [content, performAutoSave, clearTimers]);

  // Retry failed auto-save
  const retryAutoSave = useCallback(() => {
    if (contextState.error && content) {
      retryCount.current = 0;
      dispatch(actions.clearError());
      performAutoSave(content);
    }
  }, [contextState.error, content, dispatch, actions, performAutoSave]);

  // Get last saved time formatted
  const getLastSavedText = useCallback(() => {
    if (!contextState.lastSaved) return null;
    
    const savedTime = new Date(contextState.lastSaved);
    const now = new Date();
    const diffMinutes = Math.floor((now - savedTime) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Saved just now';
    } else if (diffMinutes < 60) {
      return `Saved ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return `Saved at ${savedTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  }, [contextState.lastSaved]);

  return {
    // State
    isAutoSaving: contextState.isAutoSaving,
    lastSaved: contextState.lastSaved,
    hasUnsavedChanges: contextState.hasUnsavedChanges,
    error: contextState.error,
    
    // Actions
    manualSave,
    retryAutoSave,
    
    // Helpers
    getLastSavedText,
    
    // Settings
    isEnabled: enabled && globalSettings.enabled,
  };
};

export default useAutoSave;