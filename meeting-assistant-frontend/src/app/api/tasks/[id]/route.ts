// app/api/tasks/[id]/route.ts
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
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID'
      }, { status: 400 });
    }

    const task = mockDatabase.getTaskById(taskId);

    if (!task) {
      return NextResponse.json({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });

  } catch (error: any) {
    console.error('Get task error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get task'
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
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID'
      }, { status: 400 });
    }

    const body = await request.json();

    // Update task in database
    const updatedTask = mockDatabase.updateTask(taskId, body);

    if (!updatedTask) {
      return NextResponse.json({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    console.log('✅ Task updated via API:', updatedTask.id);

    return NextResponse.json(updatedTask, { status: 200 });

  } catch (error: any) {
    console.error('Update task error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update task'
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
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID'
      }, { status: 400 });
    }

    // ✅ YAHAN FIX HAI - Actually delete task from database
    const deleted = mockDatabase.deleteTask(taskId);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Task not found'
      }, { status: 404 });
    }

    console.log('✅ Task permanently deleted from database:', taskId);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
      deletedId: taskId
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Delete task error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete task'
    }, { status: 500 });
  }
}