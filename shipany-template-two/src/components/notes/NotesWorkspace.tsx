'use client';

import { useEffect, useState, useRef } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Plus, ZoomIn, ZoomOut } from 'lucide-react';

import type { StickyNote as StickyNoteType, Reminder, NoteComment } from '@/types/sticky-notes';
import { StickyNoteCard } from './StickyNoteCard';
import { TodoPanel } from './TodoPanel';
import { CreateNoteDialog } from './CreateNoteDialog';
import { ReminderDialog } from './ReminderDialog';
import { CommentsDrawer } from './CommentsDrawer';
import { EMAIL_TEMPLATES } from '@/types/sticky-notes';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

export function NotesWorkspace() {
  const [notes, setNotes] = useState<StickyNoteType[]>([]);
  const [reminders, setReminders] = useState<Record<string, Reminder>>({});
  const [workspace, setWorkspace] = useState({
    zoomLevel: 100,
    viewportOffsetX: 0,
    viewportOffsetY: 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNoteForReminder, setSelectedNoteForReminder] = useState<string | null>(null);
  const [selectedNoteForComments, setSelectedNoteForComments] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load data
  useEffect(() => {
    fetchNotes();
    fetchWorkspace();
    fetchAllReminders();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  };

  const fetchWorkspace = async () => {
    const res = await fetch('/api/workspace');
    if (res.ok) {
      const data = await res.json();
      setWorkspace(data);
    }
  };

  const fetchAllReminders = async () => {
    // Fetch reminders for all notes
    const res = await fetch('/api/notes');
    if (res.ok) {
      const notesData = await res.json();
      const reminderPromises = notesData.map(async (note: StickyNoteType) => {
        const remRes = await fetch(`/api/notes/${note.id}/reminders`);
        if (remRes.ok) {
          const rems = await remRes.json();
          return { noteId: note.id, reminders: rems };
        }
        return { noteId: note.id, reminders: [] };
      });

      const results = await Promise.all(reminderPromises);
      const reminderMap: Record<string, Reminder> = {};
      results.forEach(({ noteId, reminders: rems }) => {
        if (rems.length > 0) {
          reminderMap[noteId] = rems[0];
        }
      });
      setReminders(reminderMap);
    }
  };

  const updateNote = async (id: string, updates: any) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return updated;
    }
  };

  const bringToFront = async (id: string) => {
    const maxZ = Math.max(...notes.map((n) => n.zIndex), 0);
    await updateNote(id, { zIndex: maxZ + 1 });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const note = active.data.current as StickyNoteType;

    if (note) {
      updateNote(note.id, {
        positionX: note.positionX + delta.x,
        positionY: note.positionY + delta.y,
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateNote(id, { status });
    toast({ title: 'Status updated' });
  };

  const handleCopyTemplate = (note: StickyNoteType) => {
    const templates = EMAIL_TEMPLATES[note.type];
    if (templates && templates.length > 0) {
      const template = templates[0];
      const text = `Subject: ${template.subject}\n\n${template.body}`;
      navigator.clipboard.writeText(text);
      toast({ title: 'Email template copied to clipboard' });
    }
  };

  const handleToggleCollapse = async (id: string, isCollapsed: boolean) => {
    await updateNote(id, { isCollapsed: !isCollapsed });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom =
      direction === 'in'
        ? Math.min(workspace.zoomLevel + 10, 150)
        : Math.max(workspace.zoomLevel - 10, 50);

    setWorkspace((prev) => ({ ...prev, zoomLevel: newZoom }));
    fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoomLevel: newZoom }),
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const direction = e.deltaY < 0 ? 'in' : 'out';
      handleZoom(direction);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - workspace.viewportOffsetX, y: e.clientY - workspace.viewportOffsetY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newOffsetX = e.clientX - panStart.x;
      const newOffsetY = e.clientY - panStart.y;
      setWorkspace((prev) => ({
        ...prev,
        viewportOffsetX: newOffsetX,
        viewportOffsetY: newOffsetY,
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      // Save viewport state
      fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewportOffsetX: workspace.viewportOffsetX,
          viewportOffsetY: workspace.viewportOffsetY,
        }),
      });
    }
  };

  const focusNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note && canvasRef.current) {
      const containerRect = canvasRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      const newOffsetX = centerX - note.positionX * (workspace.zoomLevel / 100) - 150;
      const newOffsetY = centerY - note.positionY * (workspace.zoomLevel / 100) - 100;

      setWorkspace((prev) => ({
        ...prev,
        viewportOffsetX: newOffsetX,
        viewportOffsetY: newOffsetY,
      }));

      // Highlight effect
      bringToFront(noteId);

      fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewportOffsetX: newOffsetX,
          viewportOffsetY: newOffsetY,
        }),
      });
    }
  };

  const isReminderOverdue = (reminder?: Reminder) => {
    if (!reminder || reminder.isTriggered) return false;
    return new Date(reminder.remindAt) < new Date();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Todo Panel */}
      <TodoPanel notes={notes} onNoteClick={focusNote} />

      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleZoom('out')}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="px-3 py-2 bg-white border rounded-md text-sm font-medium">
            {workspace.zoomLevel}%
          </span>
          <Button variant="outline" size="icon" onClick={() => handleZoom('in')}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="w-full h-full"
          onWheel={handleWheel}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div
              style={{
                transform: `translate(${workspace.viewportOffsetX}px, ${workspace.viewportOffsetY}px) scale(${workspace.zoomLevel / 100})`,
                transformOrigin: '0 0',
                width: '4000px',
                height: '4000px',
                position: 'relative',
              }}
            >
              {notes.map((note) => (
                <StickyNoteCard
                  key={note.id}
                  note={note}
                  onUpdateStatus={(status) => handleUpdateStatus(note.id, status)}
                  onSetReminder={() => setSelectedNoteForReminder(note.id)}
                  onOpenComments={() => setSelectedNoteForComments(note.id)}
                  onCopyTemplate={() => handleCopyTemplate(note)}
                  onToggleCollapse={() => handleToggleCollapse(note.id, note.isCollapsed)}
                  onClick={() => bringToFront(note.id)}
                  hasReminder={!!reminders[note.id]}
                  isOverdue={isReminderOverdue(reminders[note.id])}
                />
              ))}
            </div>
          </DndContext>
        </div>
      </div>

      {/* Dialogs */}
      <CreateNoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={fetchNotes}
      />

      {selectedNoteForReminder && (
        <ReminderDialog
          noteId={selectedNoteForReminder}
          open={!!selectedNoteForReminder}
          onOpenChange={(open) => !open && setSelectedNoteForReminder(null)}
          onCreated={() => {
            fetchAllReminders();
            setSelectedNoteForReminder(null);
          }}
        />
      )}

      {selectedNoteForComments && (
        <CommentsDrawer
          noteId={selectedNoteForComments}
          open={!!selectedNoteForComments}
          onOpenChange={(open) => !open && setSelectedNoteForComments(null)}
        />
      )}
    </div>
  );
}
