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
            content: 'You are an educational content curator. Provide 5-6 high-quality YouTube video suggestions for students.'
          },
          {
            role: 'user',
            content: `Find educational YouTube videos for ${className} students studying ${subject} - ${topic}. Return a JSON array with title, url, description, and duration for each video.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response or create fallback data
    let videos;
    try {
      videos = JSON.parse(content);
    } catch {
      videos = [
        {
          title: `${topic} - Complete Tutorial`,
          url: `https://youtube.com/results?search_query=${encodeURIComponent(className + ' ' + subject + ' ' + topic)}`,
          description: `Comprehensive tutorial on ${topic} for ${className} students`,
          duration: "15-20 mins"
        }
      ];
    }

    return new Response(JSON.stringify({ videos }), {
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