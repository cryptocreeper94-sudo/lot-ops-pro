import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, X, Save, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  content: string;
  timestamp: number;
  color: string;
}

const NOTE_COLORS = [
  'from-yellow-400/90 to-amber-500/90',
  'from-pink-400/90 to-rose-500/90',
  'from-blue-400/90 to-indigo-500/90',
  'from-emerald-400/90 to-teal-500/90',
  'from-purple-400/90 to-violet-500/90'
];

const STORAGE_KEY = 'lotops_notes';

export function FloatingNotepad() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      timestamp: Date.now(),
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length]
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setEditContent('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const saveNote = () => {
    if (!activeNote) return;
    setNotes(notes.map(n => 
      n.id === activeNote 
        ? { ...n, content: editContent, timestamp: Date.now() }
        : n
    ));
    setActiveNote(null);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote === id) setActiveNote(null);
  };

  const selectNote = (note: Note) => {
    setActiveNote(note.id);
    setEditContent(note.content);
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-[9998] p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-notepad"
      >
        <StickyNote className="w-6 h-6 text-white" />
        {notes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {notes.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            className="fixed bottom-36 left-4 z-[9999] w-72 max-h-[60vh] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-500">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-white" />
                <span className="font-bold text-white">Quick Notes</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  data-testid="button-close-notepad"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3">
                    <Button
                      onClick={addNote}
                      size="sm"
                      className="w-full mb-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      data-testid="button-add-note"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Note
                    </Button>

                    {activeNote && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 bg-slate-800/60 rounded-xl p-3 border border-slate-700"
                      >
                        <Textarea
                          ref={textareaRef}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Write your note..."
                          className="min-h-[80px] bg-transparent border-0 resize-none focus:ring-0 text-white placeholder:text-slate-500"
                          data-testid="textarea-note-content"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={saveNote} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                            <Save className="w-3 h-3 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setActiveNote(null)} className="border-slate-600">
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {notes.filter(n => n.id !== activeNote).map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`relative bg-gradient-to-br ${note.color} rounded-xl p-3 cursor-pointer group`}
                          onClick={() => selectNote(note)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                          <p className="text-sm text-slate-900 font-medium line-clamp-3 pr-6">
                            {note.content || 'Empty note...'}
                          </p>
                          <p className="text-[10px] text-slate-700 mt-1">
                            {formatTime(note.timestamp)}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {notes.length === 0 && !activeNote && (
                      <div className="text-center py-6 text-slate-400">
                        <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notes yet</p>
                        <p className="text-xs">Tap "New Note" to start</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default FloatingNotepad;
