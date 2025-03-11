
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { contentType, subjectId, topic, wordCount } = await req.json();
    console.log('Received request:', { contentType, subjectId, topic, wordCount });

    // Get subject name
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single();

    if (subjectError) {
      throw new Error(`Error fetching subject: ${subjectError.message}`);
    }

    const subjectName = subjectData?.name || "General";
    console.log('Subject name:', subjectName);

    // Get knowledge base instructions
    let knowledgeBaseInstructions = "";

    // First, get common knowledge base instructions for the specific content type
    const { data: commonKnowledge, error: commonError } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('is_common', true);

    if (!commonError && commonKnowledge && commonKnowledge.length > 0) {
      knowledgeBaseInstructions += "Content Type Guidelines:\n";
      commonKnowledge.forEach((item) => {
        knowledgeBaseInstructions += item.content + "\n\n";
      });
    }

    // Then, get subject specific knowledge if available
    const { data: subjectKnowledge, error: knowledgeError } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('subject', subjectId)
      .eq('is_common', false);

    if (!knowledgeError && subjectKnowledge && subjectKnowledge.length > 0) {
      knowledgeBaseInstructions += `\nSpecific instructions for ${subjectName}:\n`;
      subjectKnowledge.forEach((item) => {
        knowledgeBaseInstructions += item.content + "\n\n";
      });
    }

    console.log('Using knowledge base instructions:', knowledgeBaseInstructions ? 'Yes' : 'No');

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

    // Prepare the system message with knowledge base instructions if available
    let systemMessage = `You are an expert at writing ${contentType} about ${subjectName}. 
Create content that is approximately ${wordCount} words.
Format the content with clear sections, well-structured paragraphs, and logical flow.

For formatting:
- Use proper heading levels (Heading 1 for main title, Heading 2 for sections, Heading 3 for subsections)
- Make important terms bold
- Use italics for emphasis where appropriate
- Use bullet points for lists
- Create well-structured paragraphs with clear topic sentences

Make sure the content is engaging, informative, and appropriate for academic purposes.`;
    
    if (knowledgeBaseInstructions) {
      systemMessage += `\n\nPlease follow these specific guidelines:\n${knowledgeBaseInstructions}`;
    }

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
            content: systemMessage
          },
          {
            role: 'user',
            content: `Write a ${contentType} about: ${topic}`
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
