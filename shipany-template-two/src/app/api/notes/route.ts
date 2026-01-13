import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db/index';
import { stickyNote } from '@/config/db/schema.postgres';
import { getAuth } from '@/core/auth';
import type { CreateNoteInput } from '@/types/sticky-notes';
import { NOTE_TYPE_CONFIG } from '@/types/sticky-notes';

const ORG_ID = 'prodent';

export async function GET(request: NextRequest) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await db
      .select()
      .from(stickyNote)
      .where(eq(stickyNote.orgId, ORG_ID))
      .orderBy(desc(stickyNote.zIndex));

    // Parse tags from JSON string
    const parsedNotes = notes.map((note) => ({
      ...note,
      tags: JSON.parse(note.tags as string),
    }));

    return NextResponse.json(parsedNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateNoteInput = await request.json();

    const { title, content, type, tags = [], positionX = 100, positionY = 100 } = body;

    if (!content || !type) {
      return NextResponse.json(
        { error: 'Content and type are required' },
        { status: 400 }
      );
    }

    const color = NOTE_TYPE_CONFIG[type].color;

    // Get max zIndex
    const maxZNote = await db
      .select({ zIndex: stickyNote.zIndex })
      .from(stickyNote)
      .where(eq(stickyNote.orgId, ORG_ID))
      .orderBy(desc(stickyNote.zIndex))
      .limit(1);

    const newZIndex = maxZNote.length > 0 ? maxZNote[0].zIndex + 1 : 1;

    const [newNote] = await db
      .insert(stickyNote)
      .values({
        id: nanoid(),
        orgId: ORG_ID,
        createdByUserId: session.user.id,
        title: title || null,
        content,
        type,
        color,
        status: 'new',
        tags: JSON.stringify(tags),
        positionX,
        positionY,
        zIndex: newZIndex,
        isCollapsed: false,
      })
      .returning();

    return NextResponse.json({
      ...newNote,
      tags: JSON.parse(newNote.tags as string),
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
