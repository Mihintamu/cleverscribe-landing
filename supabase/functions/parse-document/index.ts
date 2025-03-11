
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileUrl, fileType } = await req.json();
    console.log('Received request to parse document:', { fileUrl, fileType });

    // Fetch the file from storage
    const storagePath = fileUrl.replace(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/knowledge_base_files/`, '');
    
    if (!storagePath) {
      throw new Error('Invalid file URL');
    }

    console.log('Fetching file from storage path:', storagePath);
    
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('knowledge_base_files')
      .download(storagePath);

    if (fileError) {
      console.error('Error fetching file:', fileError);
      throw new Error(`Error fetching file: ${fileError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received');
    }

    let extractedText = '';

    // Parse different file types
    switch (fileType.toLowerCase()) {
      case 'application/pdf': 
        // For PDF, use text extraction via OpenAI
        const buffer = await fileData.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You will be provided with a base64 encoded PDF file. Your task is to extract and return only the text content."
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Please extract the text from this PDF file."
                  },
                  {
                    type: "file_data",
                    file_data: {
                      content: base64Data,
                      mime_type: "application/pdf"
                    }
                  }
                ]
              }
            ]
          })
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const openaiData = await openaiResponse.json();
        extractedText = openaiData.choices[0]?.message?.content || 'Failed to extract text from PDF';
        break;

      case 'text/plain':
        // For text files, just read the text
        extractedText = await fileData.text();
        break;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/msword':
      case 'application/vnd.ms-excel':
        // For Word/Excel, use OpenAI to extract content
        const docBuffer = await fileData.arrayBuffer();
        const docBase64 = btoa(String.fromCharCode(...new Uint8Array(docBuffer)));
        
        const docsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You will be provided with a base64 encoded ${fileType} file. Your task is to extract and return only the text content.`
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Please extract the text from this ${fileType} file.`
                  },
                  {
                    type: "file_data",
                    file_data: {
                      content: docBase64,
                      mime_type: fileType
                    }
                  }
                ]
              }
            ]
          })
        });

        if (!docsResponse.ok) {
          const errorData = await docsResponse.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const docsData = await docsResponse.json();
        extractedText = docsData.choices[0]?.message?.content || `Failed to extract text from ${fileType}`;
        break;
        
      default:
        extractedText = `Unsupported file type: ${fileType}`;
    }

    console.log('Successfully extracted text from document');
    return new Response(
      JSON.stringify({ extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while parsing the document' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
