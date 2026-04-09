import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('Fetching my tasks...');

    // Mock tasks data
    const myTasks = [
      {
        id: 1,
        title: 'Prepare presentation',
        description: 'Create slides for project review',
        priority: 'high',
        status: 'pending',
        due_date: '2024-11-26T12:00:00Z',
        meeting_id: 2,
        meeting_title: 'Project Review',
        created_at: '2024-11-24T08:00:00Z'
      },
      {
        id: 2,
        title: 'Review code',
        description: 'Review pull requests',
        priority: 'medium',
        status: 'in-progress',
        due_date: '2024-11-25T17:00:00Z',
        meeting_id: null,
        meeting_title: null,
        created_at: '2024-11-24T09:00:00Z'
      }
    ];

    return NextResponse.json(myTasks, { status: 200 });

  } catch (error: any) {
    console.error('Get my tasks error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get tasks'
    }, { status: 500 });
  }
}