import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email });

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    const mockToken = 'jwt-token-' + Date.now();
    
    console.log('Login successful:', email);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token: mockToken,
        user: {
          id: Date.now(),
          name: 'Test User',
          email: email
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Login failed'
    }, { status: 500 });
  }
}