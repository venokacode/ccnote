'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  MoreVertical,
  Bell,
  MessageSquare,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type { StickyNote, NoteType, NOTE_STATUS_CONFIG } from '@/types/sticky-notes';
import { NOTE_TYPE_CONFIG } from '@/types/sticky-notes';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface StickyNoteCardProps {
  note: StickyNote;
  onUpdateStatus: (status: string) => void;
  onSetReminder: () => void;
  onOpenComments: () => void;
  onCopyTemplate: () => void;
  onToggleCollapse: () => void;
  onClick: () => void;
  hasReminder?: boolean;
  isOverdue?: boolean;
}

const COLOR_CLASSES = {
  blue: 'bg-blue-100 border-blue-300 hover:shadow-blue-200',
  red: 'bg-red-100 border-red-300 hover:shadow-red-200',
  yellow: 'bg-yellow-100 border-yellow-300 hover:shadow-yellow-200',
  green: 'bg-green-100 border-green-300 hover:shadow-green-200',
  purple: 'bg-purple-100 border-purple-300 hover:shadow-purple-200',
};

export function StickyNoteCard({
  note,
  onUpdateStatus,
  onSetReminder,
  onOpenComments,
  onCopyTemplate,
  onToggleCollapse,
  onClick,
  hasReminder,
  isOverdue,
}: StickyNoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: note.id,
    data: note,
  });

  const colorClass = COLOR_CLASSES[note.color];

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: note.positionX,
        top: note.positionY,
        zIndex: note.zIndex,
        width: note.isCollapsed ? '200px' : '300px',
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`${colorClass} border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="px-3 py-2 border-b border-gray-300 cursor-move bg-white bg-opacity-30 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {NOTE_TYPE_CONFIG[note.type].label}
          </Badge>
          {hasReminder && (
            <Bell
              className={`h-4 w-4 flex-shrink-0 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}
            />
          )}
        </div>

        {isHovered && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
            >
              {note.isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus('new');
                }}>
                  Set as New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus('in_progress');
                }}>
                  Set as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus('waiting');
                }}>
                  Set as Waiting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus('done');
                }}>
                  Set as Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onSetReminder();
                }}>
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onOpenComments();
                }}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Internal Notes
                </DropdownMenuItem>
                {(note.type === 'missing_call' ||
                  note.type === 'installation_record') && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onCopyTemplate();
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Email Template
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {note.title && !note.isCollapsed && (
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">{note.title}</h3>
        )}
        <p
          className={`text-sm text-gray-700 whitespace-pre-wrap ${note.isCollapsed ? 'line-clamp-2' : 'line-clamp-6'}`}
        >
          {note.content}
        </p>

        {!note.isCollapsed && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {!note.isCollapsed && (
          <div className="mt-2 text-xs text-gray-500">
            Status: <span className="font-medium">{note.status}</span>
          </div>
        )}
      </div>
    </div>
  );
}
