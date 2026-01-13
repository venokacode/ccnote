import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/core/db/index';
import { workspaceState } from '@/config/db/schema.postgres';
import { getAuth } from '@/core/auth';
import type { UpdateWorkspaceInput } from '@/types/sticky-notes';

const ORG_ID = 'prodent';

export async function GET(request: NextRequest) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [workspace] = await db
      .select()
      .from(workspaceState)
      .where(eq(workspaceState.orgId, ORG_ID))
      .limit(1);

    if (!workspace) {
      // Return default if not found
      return NextResponse.json({
        orgId: ORG_ID,
        zoomLevel: 100,
        viewportOffsetX: 0,
        viewportOffsetY: 0,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace state' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await (await getAuth()).api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateWorkspaceInput = await request.json();

    const updateData: any = { updatedAt: new Date() };

    if (body.zoomLevel !== undefined) {
      // Clamp between 50 and 150
      updateData.zoomLevel = Math.max(50, Math.min(150, body.zoomLevel));
    }
    if (body.viewportOffsetX !== undefined) {
      updateData.viewportOffsetX = body.viewportOffsetX;
    }
    if (body.viewportOffsetY !== undefined) {
      updateData.viewportOffsetY = body.viewportOffsetY;
    }

    const [updated] = await db
      .update(workspaceState)
      .set(updateData)
      .where(eq(workspaceState.orgId, ORG_ID))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating workspace state:', error);
    return NextResponse.json(
      { error: 'Failed to update workspace state' },
      { status: 500 }
    );
  }
}
