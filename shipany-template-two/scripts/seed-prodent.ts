import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { organization, workspaceState } from '@/config/db/schema.postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding ProDent organization...');

  // Insert or ignore ProDent organization
  await db
    .insert(organization)
    .values({
      orgId: 'prodent',
      name: 'ProDent',
    })
    .onConflictDoNothing();

  // Insert or ignore default workspace state
  await db
    .insert(workspaceState)
    .values({
      orgId: 'prodent',
      zoomLevel: 100,
      viewportOffsetX: 0,
      viewportOffsetY: 0,
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log('✓ ProDent organization seeded successfully!');

  await sql.end();
}

seed().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
