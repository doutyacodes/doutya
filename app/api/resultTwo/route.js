import { NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai"

export async function POST(req) {
    try {
        const { interests } = await req.json();
        console.log('got',interests)
        const chatModel = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set")
        }

        const prompt=`I have interest in ${interests} and I have ENFP personality ,give me the description, suitable careers for it and tell me the reason for each career suggestion why you suggested that career`

        const response = await chatModel.invoke(prompt)

        console.log('response',response)
        return NextResponse.json({result: response.content});
    } catch (error) {
        console.error('Error sending prompt to ChatGPT API:', error);
        return NextResponse.json({ error: 'Failed to generate response from ChatGPT API' }, { status: 500 });
    }
}
