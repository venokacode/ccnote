'use client';

import type { StickyNote } from '@/types/sticky-notes';
import { NOTE_TYPE_CONFIG, NOTE_STATUS_CONFIG } from '@/types/sticky-notes';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

interface TodoPanelProps {
  notes: StickyNote[];
  onNoteClick: (noteId: string) => void;
}

export function TodoPanel({ notes, onNoteClick }: TodoPanelProps) {
  const activeNotes = notes.filter(
    (n) => n.status !== 'done' && n.status !== 'archived'
  );

  const grouped = {
    new: activeNotes.filter((n) => n.status === 'new'),
    in_progress: activeNotes.filter((n) => n.status === 'in_progress'),
    waiting: activeNotes.filter((n) => n.status === 'waiting'),
  };

  return (
    <div className="w-80 border-r bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">To-Do</h2>
      <ScrollArea className="h-[calc(100vh-100px)]">
        <div className="space-y-4">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status}>
              <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">
                {NOTE_STATUS_CONFIG[status as keyof typeof NOTE_STATUS_CONFIG]?.label || status} ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((note) => (
                  <Card
                    key={note.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onNoteClick(note.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0"
                      >
                        {NOTE_TYPE_CONFIG[note.type].label}
                      </Badge>
                    </div>
                    {note.title && (
                      <p className="font-medium text-sm mt-1 line-clamp-1">
                        {note.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No items</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
