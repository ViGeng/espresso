import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { generateColor, generateInitials } from '@/lib/utils';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET all users
export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(users.name);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const initials = generateInitials(trimmedName);
    const color = generateColor(trimmedName);

    const result = await db.insert(users).values({
      name: trimmedName,
      initials,
      color,
      createdAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const initials = generateInitials(trimmedName);
    const color = generateColor(trimmedName);

    const result = await db
      .update(users)
      .set({ name: trimmedName, initials, color })
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await db.delete(users).where(eq(users.id, parseInt(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
