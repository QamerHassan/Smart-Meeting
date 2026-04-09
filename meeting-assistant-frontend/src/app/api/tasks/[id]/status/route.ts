import { NextResponse } from 'next/server';
import { mockDatabase } from '@/lib/mockDatabase';

export async function PATCH(
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
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'completed', 'in-progress', 'cancelled'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status. Must be one of: pending, completed, in-progress, cancelled'
      }, { status: 400 });
    }

    // Update task status in database
    const updatedTask = mockDatabase.updateTask(taskId, { status });

    if (!updatedTask) {
      return NextResponse.json({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    console.log('✅ Task status updated via API:', taskId, 'New status:', status);

    return NextResponse.json(updatedTask, { status: 200 });

  } catch (error: any) {
    console.error('Update task status error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update task status'
    }, { status: 500 });
  }
}