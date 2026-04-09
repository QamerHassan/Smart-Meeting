import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized - No token provided'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    console.log('Fetching user info');

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Get user error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get user'
    }, { status: 500 });
  }
}