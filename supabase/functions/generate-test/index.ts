import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { class: className, subject, topic } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an educational assessment creator. Generate exactly 10 multiple-choice questions with 4 options each, correct answer index (0-3), and explanations. Return valid JSON only.'
          },
          {
            role: 'user',
            content: `Create 10 multiple-choice questions for ${className} students on ${subject} - ${topic}. Format: [{"id":1,"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let questions;
    try {
      questions = JSON.parse(content);
    } catch {
      // Fallback questions if parsing fails
      questions = [
        {
          id: 1,
          question: `What is a key concept in ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: `This is a fundamental concept in ${topic}.`
        }
      ];
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});