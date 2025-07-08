import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Auto-save status for different components
  sessionNotes: {
    isAutoSaving: false,
    lastSaved: null,
    draftContent: null,
    error: null,
    hasUnsavedChanges: false,
  },
  messages: {
    isAutoSaving: false,
    lastSaved: null,
    draftContent: null,
    error: null,
    hasUnsavedChanges: false,
  },
  // Global auto-save settings
  settings: {
    enabled: true,
    interval: 15000, // 15 seconds default
    pauseDelay: 3000, // 3 seconds pause detection
  },
};

export const autoSaveSlice = createSlice({
  name: 'autoSave',
  initialState,
  reducers: {
    // Session Notes Auto-Save Actions
    setSessionNotesAutoSaving: (state, action) => {
      state.sessionNotes.isAutoSaving = action.payload;
    },
    setSessionNotesLastSaved: (state, action) => {
      state.sessionNotes.lastSaved = action.payload;
      state.sessionNotes.hasUnsavedChanges = false;
    },
    setSessionNotesDraftContent: (state, action) => {
      state.sessionNotes.draftContent = action.payload;
      state.sessionNotes.hasUnsavedChanges = true;
    },
    setSessionNotesError: (state, action) => {
      state.sessionNotes.error = action.payload;
      state.sessionNotes.isAutoSaving = false;
    },
    clearSessionNotesError: (state) => {
      state.sessionNotes.error = null;
    },
    resetSessionNotesState: (state) => {
      state.sessionNotes = {
        isAutoSaving: false,
        lastSaved: null,
        draftContent: null,
        error: null,
        hasUnsavedChanges: false,
      };
    },

    // Messages Auto-Save Actions
    setMessagesAutoSaving: (state, action) => {
      state.messages.isAutoSaving = action.payload;
    },
    setMessagesLastSaved: (state, action) => {
      state.messages.lastSaved = action.payload;
      state.messages.hasUnsavedChanges = false;
    },
    setMessagesDraftContent: (state, action) => {
      state.messages.draftContent = action.payload;
      state.messages.hasUnsavedChanges = true;
    },
    setMessagesError: (state, action) => {
      state.messages.error = action.payload;
      state.messages.isAutoSaving = false;
    },
    clearMessagesError: (state) => {
      state.messages.error = null;
    },
    resetMessagesState: (state) => {
      state.messages = {
        isAutoSaving: false,
        lastSaved: null,
        draftContent: null,
        error: null,
        hasUnsavedChanges: false,
      };
    },

    // Global Settings Actions
    setAutoSaveEnabled: (state, action) => {
      state.settings.enabled = action.payload;
    },
    setAutoSaveInterval: (state, action) => {
      state.settings.interval = action.payload;
    },
    setPauseDelay: (state, action) => {
      state.settings.pauseDelay = action.payload;
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  // Session Notes Actions
  setSessionNotesAutoSaving,
  setSessionNotesLastSaved,
  setSessionNotesDraftContent,
  setSessionNotesError,
  clearSessionNotesError,
  resetSessionNotesState,

  // Messages Actions
  setMessagesAutoSaving,
  setMessagesLastSaved,
  setMessagesDraftContent,
  setMessagesError,
  clearMessagesError,
  resetMessagesState,

  // Global Settings Actions
  setAutoSaveEnabled,
  setAutoSaveInterval,
  setPauseDelay,
  updateSettings,
} = autoSaveSlice.actions;

export default autoSaveSlice.reducer;