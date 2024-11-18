import { NextResponse } from 'next/server';
import { apiFetch } from '@api/api';

export async function POST(request: Request) {
  try {
    const { type, content } = await request.json();

    const result = await apiFetch('api/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, content }),
    });

    return NextResponse.json({ message: 'Feedback submitted successfully', id: result.id }, { status: 200 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ message: 'Error submitting feedback' }, { status: 500 });
  }
}