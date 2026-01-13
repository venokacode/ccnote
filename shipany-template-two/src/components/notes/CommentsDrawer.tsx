'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { NoteComment } from '@/types/sticky-notes';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Card } from '@/shared/components/ui/card';
import { toast } from 'sonner';

interface CommentsDrawerProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentsDrawer({
  noteId,
  open,
  onOpenChange,
}: CommentsDrawerProps) {
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, noteId]);

  const fetchComments = async () => {
    const res = await fetch(`/api/notes/${noteId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({ title: 'Comment cannot be empty', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [created, ...prev]);
        setNewComment('');
        toast({ title: 'Comment added' });
      } else {
        toast({ title: 'Failed to add comment', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error adding comment', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Internal Notes</SheetTitle>
          <SheetDescription>
            Add internal comments for this note. These are not visible to customers.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-150px)]">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isSubmitting}
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 italic">No comments yet</p>
              )}
              {comments.map((comment) => (
                <Card key={comment.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium">
                      {comment.userName || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
