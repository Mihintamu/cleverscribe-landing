
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Get request body
    const { contentType, subject, wordCount, knowledgeBase } = await req.json()
    
    if (!contentType || !subject) {
      return new Response(
        JSON.stringify({ error: 'Content type and subject are required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Format content type for prompt
    const formattedContentType = contentType.replace(/_/g, ' ')
    
    // Create system and user prompts
    const systemPrompt = `You are an expert academic content creator specializing in creating high-quality ${formattedContentType}. Your task is to create content that is:
    1. Well-structured and organized
    2. Academically sound with proper reasoning
    3. Contains valid arguments and supporting evidence
    4. Uses a formal tone appropriate for academic writing
    5. Approximately ${wordCount} words in length`
    
    // Add knowledge base context if available
    const knowledgeBaseContext = knowledgeBase 
      ? `\n\nUse the following knowledge base information when creating the content:\n${knowledgeBase}`
      : ''
    
    const userPrompt = `Please create a ${formattedContentType} on the subject of ${subject}. The content should be approximately ${wordCount} words in length.${knowledgeBaseContext}`
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4', // Using GPT-4 for high-quality academic content
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` }),
        { 
          status: openAIResponse.status, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    const data = await openAIResponse.json()
    const generatedContent = data.choices[0]?.message?.content || ''
    
    // Return the generated content
    return new Response(
      JSON.stringify({ content: generatedContent }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in generate-content function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during content generation' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
