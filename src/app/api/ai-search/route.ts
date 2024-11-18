import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { query, mainTopic, subtopics } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for an automotive maintenance app. The user is looking for information about ${mainTopic}. The available subtopics are: ${subtopics.join(', ')}. Provide relevant information based on the user's query, summarizing and organizing the information from the most relevant subtopics.`
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 500,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}