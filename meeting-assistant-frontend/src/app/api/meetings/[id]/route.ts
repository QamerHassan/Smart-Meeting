// ============================================
// FILE: src/app/api/meetings/[id]/route.ts
// Get, update, or delete a specific meeting
// ============================================
import { NextResponse } from 'next/server';
import { mockDatabase } from '@/lib/mockDatabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = await params;
    const meeting = mockDatabase.getMeetingById(parseInt(id));

    if (!meeting) {
      return NextResponse.json({
        success: false,
        message: 'Meeting not found'
      }, { status: 404 });
    }

    return NextResponse.json(meeting, { status: 200 });

  } catch (error: any) {
    console.error('Get meeting error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get meeting'
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updatedMeeting = mockDatabase.updateMeeting(parseInt(id), body);

    if (!updatedMeeting) {
      return NextResponse.json({
        success: false,
        message: 'Meeting not found'
      }, { status: 404 });
    }

    return NextResponse.json(updatedMeeting, { status: 200 });

  } catch (error: any) {
    console.error('Update meeting error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update meeting'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = await params;
    const meetingId = parseInt(id);

    console.log('🗑️ DELETE API Called - Meeting ID:', meetingId);
    console.log('📊 Current meetings in DB before delete:', mockDatabase.debug());
    
    const deleted = mockDatabase.deleteMeeting(meetingId);

    console.log('🔍 Delete result:', deleted);
    console.log('📊 Current meetings in DB after delete:', mockDatabase.debug());

    if (!deleted) {
      console.error('❌ Meeting not found for deletion:', meetingId);
      return NextResponse.json({
        success: false,
        message: 'Meeting not found'
      }, { status: 404 });
    }

    console.log('✅ Meeting deleted successfully:', meetingId);
    return NextResponse.json({
      success: true,
      message: 'Meeting deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Delete meeting error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete meeting'
    }, { status: 500 });
  }
}