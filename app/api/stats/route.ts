import { db } from '@/lib/db';
import { coffeeDrinking } from '@/lib/db/schema';
import { gte, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daily = searchParams.get('daily') === 'true';
    const days = parseInt(searchParams.get('days') || '30');

    const now = new Date();
    
    // Start of today (local time approximation - using UTC)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    // Start of this week (Monday)
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday).toISOString();
    
    // Start of this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // If daily stats requested, return array of { date, cups } for histogram/heatmap
    if (daily) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1).toISOString();
      
      const dailyStats = await db
        .select({
          date: sql<string>`DATE(${coffeeDrinking.recordedAt})`,
          cups: sql<number>`COALESCE(SUM(${coffeeDrinking.cups}), 0)`,
        })
        .from(coffeeDrinking)
        .where(gte(coffeeDrinking.recordedAt, startDate))
        .groupBy(sql`DATE(${coffeeDrinking.recordedAt})`)
        .orderBy(sql`DATE(${coffeeDrinking.recordedAt})`);

      // Fill in missing dates with 0 cups
      const filledStats: Array<{ date: string; cups: number }> = [];
      const statsMap = new Map(dailyStats.map(s => [s.date, s.cups]));
      
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        filledStats.push({
          date: dateStr,
          cups: statsMap.get(dateStr) || 0,
        });
      }

      return NextResponse.json({ daily: filledStats });
    }

    // Today's cups
    const todayResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${coffeeDrinking.cups}), 0)` })
      .from(coffeeDrinking)
      .where(gte(coffeeDrinking.recordedAt, todayStart));
    
    // This week's cups
    const weekResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${coffeeDrinking.cups}), 0)` })
      .from(coffeeDrinking)
      .where(gte(coffeeDrinking.recordedAt, weekStart));
    
    // This month's cups
    const monthResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${coffeeDrinking.cups}), 0)` })
      .from(coffeeDrinking)
      .where(gte(coffeeDrinking.recordedAt, monthStart));

    return NextResponse.json({
      today: todayResult[0]?.total || 0,
      week: weekResult[0]?.total || 0,
      month: monthResult[0]?.total || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
