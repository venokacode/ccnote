import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db/index';
import { noteComment, stickyNote, user } from '@/config/db/schema.postgres';
import { getAuth } from '@/core/auth';
import type { CreateCommentInput } from '@/types/sticky-notes';

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

    // Get comments with user info
    const comments = await db
      .select({
        id: noteComment.id,
        orgId: noteComment.orgId,
        noteId: noteComment.noteId,
        userId: noteComment.userId,
        content: noteComment.content,
        createdAt: noteComment.createdAt,
        userName: user.name,
      })
      .from(noteComment)
      .leftJoin(user, eq(noteComment.userId, user.id))
      .where(and(eq(noteComment.noteId, id), eq(noteComment.orgId, ORG_ID)))
      .orderBy(desc(noteComment.createdAt));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
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
    const body: CreateCommentInput = await request.json();

    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
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

    const [newComment] = await db
      .insert(noteComment)
      .values({
        id: nanoid(),
        orgId: ORG_ID,
        noteId: id,
        userId: session.user.id,
        content,
      })
      .returning();

    // Get user info
    const [userInfo] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      ...newComment,
      userName: userInfo?.name || 'Unknown',
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
