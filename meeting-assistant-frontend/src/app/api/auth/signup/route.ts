import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log('Signup attempt:', { name, email });

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters'
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

    console.log('User registered successfully:', email);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        token: mockToken,
        user: {
          id: Date.now(),
          name,
          email
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Registration failed'
    }, { status: 500 });
  }
}