
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, subject, wordCount } = await req.json();
    console.log('Received request:', { contentType, subject, wordCount });

    // First, let's try to get the available models
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!modelsResponse.ok) {
      const errorData = await modelsResponse.json();
      console.error('OpenAI API models error:', errorData);
      throw new Error(`OpenAI API models error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const modelsData = await modelsResponse.json();
    console.log('Available models:', modelsData.data.map(model => model.id).join(', '));
    
    // Try to find an available model to use
    let modelToUse = 'gpt-3.5-turbo';
    if (modelsData.data.some(model => model.id === 'gpt-3.5-turbo')) {
      modelToUse = 'gpt-3.5-turbo';
    } else if (modelsData.data.some(model => model.id === 'gpt-4o-mini')) {
      modelToUse = 'gpt-4o-mini';
    } else if (modelsData.data.some(model => model.id === 'gpt-4')) {
      modelToUse = 'gpt-4';
    } else {
      // Fallback to the first available model if none of our preferred ones are available
      modelToUse = modelsData.data[0]?.id || 'gpt-3.5-turbo';
    }
    
    console.log(`Using model: ${modelToUse}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are an expert at writing ${contentType}. Create content that is approximately ${wordCount} words.`
          },
          {
            role: 'user',
            content: `Write a ${contentType} about: ${subject}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    const generatedText = data.choices[0].message.content;
    console.log('Successfully generated content');

    return new Response(
      JSON.stringify({ generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while generating content' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
