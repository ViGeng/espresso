import { db } from '@/lib/db';
import { coffeeBeans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET all beans
export async function GET() {
  try {
    const allBeans = await db.select().from(coffeeBeans).orderBy(coffeeBeans.name);
    return NextResponse.json(allBeans);
  } catch (error) {
    console.error('Error fetching beans:', error);
    return NextResponse.json({ error: 'Failed to fetch beans' }, { status: 500 });
  }
}

// POST create new bean
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, origin, roastLevel, notes } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await db.insert(coffeeBeans).values({
      name: name.trim(),
      origin: origin?.trim() || null,
      roastLevel: roastLevel?.trim() || null,
      notes: notes?.trim() || null,
      createdAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating bean:', error);
    return NextResponse.json({ error: 'Failed to create bean' }, { status: 500 });
  }
}

// PUT update bean
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, origin, roastLevel, notes } = body;

    if (!id || !name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const result = await db
      .update(coffeeBeans)
      .set({
        name: name.trim(),
        origin: origin?.trim() || null,
        roastLevel: roastLevel?.trim() || null,
        notes: notes?.trim() || null,
      })
      .where(eq(coffeeBeans.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Bean not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating bean:', error);
    return NextResponse.json({ error: 'Failed to update bean' }, { status: 500 });
  }
}

// DELETE bean
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await db.delete(coffeeBeans).where(eq(coffeeBeans.id, parseInt(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Bean not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bean:', error);
    return NextResponse.json({ error: 'Failed to delete bean' }, { status: 500 });
  }
}
