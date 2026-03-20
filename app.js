// ============================================
// PART A: GET REFERENCES TO HTML ELEMENTS
// ============================================

// We're using document.getElementById() to grab each
// element from the DOM by its unique id

const newNoteBtn    = document.getElementById('new-note-btn');
const notesList     = document.getElementById('notes-list');
const noteTitle     = document.getElementById('note-title');
const noteEditor    = document.getElementById('note-editor');
const notePreview   = document.getElementById('note-preview');
const saveStatus    = document.getElementById('save-status');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const editTab       = document.getElementById('edit-tab');
const previewTab    = document.getElementById('preview-tab');
// ============================================
// PART B: DATA - HOW WE STORE NOTES
// ============================================

// This will hold all our notes as an array of objects
let notes = [];

// This tracks WHICH note is currently open
let activeNoteId = null;

// Each note looks like this:
// {
//   id: 1699282800000,      ← unique number (timestamp)
//   title: "My First Note", ← the title
//   content: "Hello world"  ← the markdown content
// }
// ============================================
// PART C: LOCALSTORAGE - SAVING & LOADING
// ============================================

// SAVE: Convert notes array to a string and store it
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// LOAD: Get the string from storage and convert back to array
function loadNotes() {
  const stored = localStorage.getItem('notes');
  if (stored) {
    notes = JSON.parse(stored);
  }
}
// ============================================
// PART D: DISPLAY NOTES IN THE SIDEBAR
// ============================================

function renderNotesList() {
  // Clear the current list first
  notesList.innerHTML = '';

  // If no notes exist, show a message
  if (notes.length === 0) {
    notesList.innerHTML = '<li class="empty-msg">No notes yet. Create one!</li>';
    return;
  }

  // Loop through each note and create a list item
  notes.forEach(function(note) {
    const li = document.createElement('li');

    li.textContent = note.title || 'Untitled Note';
    li.dataset.id  = note.id;

    // Highlight the active note
    if (note.id === activeNoteId) {
      li.classList.add('active');
    }

    // When a note in the list is clicked, open it
    li.addEventListener('click', function() {
      openNote(note.id);
    });

    notesList.appendChild(li);
  });
}
// ============================================
// PART E: CREATE, OPEN, DELETE NOTES
// ============================================

function createNote() {
  // Date.now() gives a unique number based on current time
  const newNote = {
    id:      Date.now(),
    title:   'New Note',
    content: ''
  };

  // Add to the beginning of the array
  notes.unshift(newNote);
  saveNotes();

  // Immediately open the new note
  openNote(newNote.id);
  renderNotesList();
}

function openNote(id) {
  // Find the note in our array that matches this id
  const note = notes.find(function(n) {
    return n.id === id;
  });

  if (!note) return;

  // Set this as the active note
  activeNoteId = id;

  // Fill the editor with this note's data
  noteTitle.value   = note.title;
  noteEditor.value  = note.content;

  // Update the sidebar highlight
  renderNotesList();

  // Always start in Edit mode when opening a note
  showEditTab();
}

function deleteNote() {
  if (!activeNoteId) return;

  // Filter out the note with this id (remove it)
  notes = notes.filter(function(note) {
    return note.id !== activeNoteId;
  });

  saveNotes();

  // Clear the editor
  activeNoteId    = null;
  noteTitle.value  = '';
  noteEditor.value = '';
  notePreview.innerHTML = '';

  renderNotesList();
}
// ============================================
// PART F: AUTO-SAVE WHILE TYPING
// ============================================

let saveTimeout = null;

function autoSave() {
  if (!activeNoteId) return;

  // Show "Saving..." immediately
  saveStatus.textContent = 'Saving...';

  // Wait 500ms after user stops typing, THEN save
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(function() {

    // Find and update the active note
    const note = notes.find(function(n) {
      return n.id === activeNoteId;
    });

    if (note) {
      note.title   = noteTitle.value;
      note.content = noteEditor.value;
      saveNotes();
      renderNotesList();
      saveStatus.textContent = 'All changes saved ✅';
    }

  }, 500);
}
// ============================================
// PART G: TAB SWITCHING
// ============================================

function showEditTab() {
  // Show editor, hide preview
  noteEditor.classList.remove('hidden');
  notePreview.classList.add('hidden');

  // Update button styles
  editTab.classList.add('active');
  previewTab.classList.remove('active');
}

function showPreviewTab() {
  // Convert markdown to HTML using marked.js
  const markdownText  = noteEditor.value;
  notePreview.innerHTML = marked.parse(markdownText);

  // Hide editor, show preview
  noteEditor.classList.add('hidden');
  notePreview.classList.remove('hidden');

  // Update button styles
  previewTab.classList.add('active');
  editTab.classList.remove('active');
}
// ============================================
// PART H: EVENT LISTENERS + INITIALIZATION
// ============================================

// Button clicks
newNoteBtn.addEventListener('click',   createNote);
deleteNoteBtn.addEventListener('click', deleteNote);
editTab.addEventListener('click',      showEditTab);
previewTab.addEventListener('click',   showPreviewTab);

// Auto-save when typing in title or editor
noteTitle.addEventListener('input',  autoSave);
noteEditor.addEventListener('input', autoSave);

// ============================================
// START THE APP
// ============================================
loadNotes();
renderNotesList();

// If there are existing notes, open the first one
if (notes.length > 0) {
  openNote(notes[0].id);
}