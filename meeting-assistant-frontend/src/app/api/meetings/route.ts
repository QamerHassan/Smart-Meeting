// ============================================
// FILE: src/app/api/meetings/route.ts
// Get all meetings or create a new meeting
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

    const meetings = mockDatabase.getAllMeetings();
    return NextResponse.json(meetings, { status: 200 });

  } catch (error: any) {
    console.error('Get meetings error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get meetings'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.start_time) {
      return NextResponse.json({
        success: false,
        message: 'Title and start_time are required'
      }, { status: 400 });
    }

    console.log('📝 Creating new meeting:', body);

    // Create meeting in DB
    const newMeeting = mockDatabase.createMeeting({
      title: body.title,
      description: body.description,
      start_time: body.start_time,
      end_time: body.end_time,
      location: body.location,
      meeting_link: body.meeting_link,
      status: body.status || 'scheduled',
      created_by: 'user1', // In production, extract from JWT token
    });

    console.log('✅ Meeting created successfully:', newMeeting.id);

    return NextResponse.json(newMeeting, { status: 201 });

  } catch (error: any) {
    console.error('❌ Create meeting error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create meeting'
    }, { status: 500 });
  }
}