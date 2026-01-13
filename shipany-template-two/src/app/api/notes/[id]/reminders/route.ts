import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db/index';
import { reminder, stickyNote } from '@/config/db/schema.postgres';
import { getAuth } from '@/core/auth';
import type { CreateReminderInput } from '@/types/sticky-notes';

const ORG_ID = 'prodent';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify note belongs to org
    const note = await db
      .select()
      .from(stickyNote)
      .where(and(eq(stickyNote.id, id), eq(stickyNote.orgId, ORG_ID)))
      .limit(1);

    if (!note.length) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const reminders = await db
      .select()
      .from(reminder)
      .where(and(eq(reminder.noteId, id), eq(reminder.orgId, ORG_ID)));

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: CreateReminderInput = await request.json();

    const { remindAt, message } = body;

    if (!remindAt || !message) {
      return NextResponse.json(
        { error: 'remindAt and message are required' },
        { status: 400 }
      );
    }

    // Verify note belongs to org
    const note = await db
      .select()
      .from(stickyNote)
      .where(and(eq(stickyNote.id, id), eq(stickyNote.orgId, ORG_ID)))
      .limit(1);

    if (!note.length) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // For MVP: single reminder per note - delete existing
    await db
      .delete(reminder)
      .where(and(eq(reminder.noteId, id), eq(reminder.orgId, ORG_ID)));

    const [newReminder] = await db
      .insert(reminder)
      .values({
        id: nanoid(),
        orgId: ORG_ID,
        noteId: id,
        remindAt: new Date(remindAt),
        message,
        isTriggered: false,
      })
      .returning();

    return NextResponse.json(newReminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
