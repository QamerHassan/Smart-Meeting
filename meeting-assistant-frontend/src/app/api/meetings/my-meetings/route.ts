// ============================================
// FILE: src/app/api/meetings/my-meetings/route.ts
// Get current user's meetings
// ============================================
import { NextResponse } from 'next/server';
import { mockDatabase } from '@/lib/mockDatabase';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('📥 Fetching my meetings from DB...');

    // For now, return all meetings (since we don't have real auth)
    // In production, you'd extract userId from JWT token
    const myMeetings = mockDatabase.getAllMeetings();

    console.log('✅ Found meetings:', myMeetings.length);

    return NextResponse.json(myMeetings, { status: 200 });

  } catch (error: any) {
    console.error('❌ Get my meetings error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get meetings'
    }, { status: 500 });
  }
}