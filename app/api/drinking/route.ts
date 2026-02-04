import { db } from '@/lib/db';
import { coffeeBeans, coffeeDrinking, users } from '@/lib/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Helper to get drinker names from IDs
async function getDrinkerNames(drinkerIds: number[]): Promise<Array<{ id: number; name: string; initials: string; color: string }>> {
  if (drinkerIds.length === 0) return [];
  const drinkers = await db
    .select({ id: users.id, name: users.name, initials: users.initials, color: users.color })
    .from(users)
    .where(inArray(users.id, drinkerIds));
  return drinkers;
}

// GET all drinking records with maker and bean info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const records = await db
      .select({
        id: coffeeDrinking.id,
        makerId: coffeeDrinking.makerId,
        drinkerIds: coffeeDrinking.drinkerIds,
        beanId: coffeeDrinking.beanId,
        cups: coffeeDrinking.cups,
        notes: coffeeDrinking.notes,
        recordedAt: coffeeDrinking.recordedAt,
        makerName: users.name,
        makerInitials: users.initials,
        makerColor: users.color,
        beanName: coffeeBeans.name,
      })
      .from(coffeeDrinking)
      .leftJoin(users, eq(coffeeDrinking.makerId, users.id))
      .leftJoin(coffeeBeans, eq(coffeeDrinking.beanId, coffeeBeans.id))
      .orderBy(desc(coffeeDrinking.recordedAt))
      .limit(limit);

    // Parse drinkerIds and fetch drinker info for each record
    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        const drinkerIdArray: number[] = record.drinkerIds 
          ? JSON.parse(record.drinkerIds) 
          : [];
        const drinkers = await getDrinkerNames(drinkerIdArray);
        return {
          ...record,
          drinkerIds: drinkerIdArray,
          drinkers,
        };
      })
    );

    return NextResponse.json(enrichedRecords);
  } catch (error) {
    console.error('Error fetching drinking records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

// POST create new drinking record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cups, beanId, makerId, drinkerIds, notes } = body;

    // Only cups is required
    if (!cups || typeof cups !== 'number' || cups < 1) {
      return NextResponse.json({ error: 'Cups must be at least 1' }, { status: 400 });
    }

    const result = await db.insert(coffeeDrinking).values({
      makerId: makerId || null,
      drinkerIds: drinkerIds && drinkerIds.length > 0 ? JSON.stringify(drinkerIds) : null,
      beanId: beanId || null,
      cups,
      notes: notes?.trim() || null,
      recordedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating drinking record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

// PUT update drinking record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, cups, beanId, makerId, drinkerIds, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await db
      .update(coffeeDrinking)
      .set({
        makerId: makerId || null,
        drinkerIds: drinkerIds && drinkerIds.length > 0 ? JSON.stringify(drinkerIds) : null,
        beanId: beanId || null,
        cups,
        notes: notes?.trim() || null,
      })
      .where(eq(coffeeDrinking.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating drinking record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

// DELETE drinking record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await db.delete(coffeeDrinking).where(eq(coffeeDrinking.id, parseInt(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting drinking record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
