'use client';

import { useState } from 'react';
import { REMINDER_PRESETS } from '@/types/sticky-notes';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';

interface ReminderDialogProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function ReminderDialog({
  noteId,
  open,
  onOpenChange,
  onCreated,
}: ReminderDialogProps) {
  const [message, setMessage] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const handlePresetClick = async (hours: number) => {
    if (!message.trim()) {
      toast({ title: 'Reminder message is required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const remindAt = new Date(Date.now() + hours * 60 * 60 * 1000);

      const res = await fetch(`/api/notes/${noteId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remindAt, message }),
      });

      if (res.ok) {
        toast({ title: 'Reminder set successfully' });
        setMessage('');
        setCustomDate('');
        setCustomTime('');
        onCreated();
      } else {
        toast({ title: 'Failed to set reminder', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error setting reminder', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({ title: 'Reminder message is required', variant: 'destructive' });
      return;
    }

    if (!customDate || !customTime) {
      toast({ title: 'Date and time are required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const remindAt = new Date(`${customDate}T${customTime}`);

      const res = await fetch(`/api/notes/${noteId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remindAt, message }),
      });

      if (res.ok) {
        toast({ title: 'Reminder set successfully' });
        setMessage('');
        setCustomDate('');
        setCustomTime('');
        onCreated();
      } else {
        toast({ title: 'Failed to set reminder', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error setting reminder', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Set a reminder for this note. Only one reminder per note is allowed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Reminder Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What to remind about..."
              rows={3}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {REMINDER_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset.hours)}
                  disabled={isSubmitting}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-2 block">Custom Date & Time</Label>
            <form onSubmit={handleCustomSubmit} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date" className="text-sm">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-sm">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Setting...' : 'Set Custom Reminder'}
              </Button>
            </form>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
