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

    // Get all tasks (we'll filter by user later if needed)
    const tasks = mockDatabase.getAllTasks();

    console.log('📋 Retrieved all tasks, Count:', tasks.length);

    return NextResponse.json(tasks, { status: 200 });

  } catch (error: any) {
    console.error('Get tasks error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get tasks'
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
    const { title, description, priority, due_date, meeting_id, assigned_to, status } = body;

    if (!title) {
      return NextResponse.json({
        success: false,
        message: 'Title is required'
      }, { status: 400 });
    }

    // Get user ID from token
    const token = authHeader.replace('Bearer ', '');
    const userId = token || 'default-user';

    // Create task in database
    const newTask = mockDatabase.createTask({
      title,
      description,
      priority: priority || 'medium',
      due_date,
      meeting_id,
      assigned_to,
      status: status || 'pending',
      created_by: userId
    });

    console.log('✅ Task created via API:', newTask.id);

    return NextResponse.json(newTask, { status: 201 });

  } catch (error: any) {
    console.error('Create task error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create task'
    }, { status: 500 });
  }
}