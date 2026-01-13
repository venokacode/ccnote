import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

import { db } from '@/core/db/index';
import { stickyNote } from '@/config/db/schema.postgres';
import { getAuth } from '@/core/auth';
import type { UpdateNoteInput } from '@/types/sticky-notes';

const ORG_ID = 'prodent';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateNoteInput = await request.json();

    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tags !== undefined)
      updateData.tags = JSON.stringify(body.tags);
    if (body.positionX !== undefined) updateData.positionX = body.positionX;
    if (body.positionY !== undefined) updateData.positionY = body.positionY;
    if (body.zIndex !== undefined) updateData.zIndex = body.zIndex;
    if (body.isCollapsed !== undefined)
      updateData.isCollapsed = body.isCollapsed;

    const [updatedNote] = await db
      .update(stickyNote)
      .set(updateData)
      .where(and(eq(stickyNote.id, id), eq(stickyNote.orgId, ORG_ID)))
      .returning();

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedNote,
      tags: JSON.parse(updatedNote.tags as string),
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Archive instead of delete (as per MVP requirements)
    const [archivedNote] = await db
      .update(stickyNote)
      .set({ status: 'archived' })
      .where(and(eq(stickyNote.id, id), eq(stickyNote.orgId, ORG_ID)))
      .returning();

    if (!archivedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving note:', error);
    return NextResponse.json(
      { error: 'Failed to archive note' },
      { status: 500 }
    );
  }
}
