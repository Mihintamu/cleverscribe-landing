
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
    console.log('Starting document parsing process');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { fileUrl, fileType } = await req.json();
    console.log('Received parsing request:', { fileUrl, fileType });

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Ensure storage bucket exists
    const bucketName = 'knowledge_base_files';
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(b => b.name === bucketName)) {
      console.log(`Bucket ${bucketName} not found, creating now`);
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, { public: true });
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        throw new Error(`Error creating bucket: ${bucketError.message}`);
      }
      console.log(`Created bucket: ${bucketName}`);
    }

    // Extract the file path from the URL
    const storageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${bucketName}/`;
    let storagePath = '';
    
    if (fileUrl.startsWith(storageUrl)) {
      storagePath = fileUrl.substring(storageUrl.length);
    } else {
      // Try to extract the path from the URL's last segment
      const urlParts = fileUrl.split('/');
      storagePath = urlParts[urlParts.length - 1];
      
      if (!storagePath) {
        throw new Error('Could not extract file path from URL');
      }
    }
    
    console.log('Attempting to download file from storage path:', storagePath);
    
    // Download the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from(bucketName)
      .download(storagePath);

    if (fileError) {
      console.error('Error fetching file:', fileError);
      throw new Error(`Error fetching file: ${fileError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received');
    }

    console.log('File downloaded successfully, size:', fileData.size, 'bytes');
    let extractedText = '';

    // For large documents, consider chunking the text extraction
    // Choose parsing method based on file type
    switch (fileType.toLowerCase()) {
      case 'application/pdf': 
        console.log('Processing PDF file');
        // For PDF, use text extraction via OpenAI
        const buffer = await fileData.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        
        console.log('Making OpenAI API request for PDF parsing');
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
          throw new Error('OpenAI API key not configured');
        }
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a document extraction tool. Your task is to accurately extract text from the provided document. Focus on getting as much of the content as possible. For very large documents, prioritize summarizing the key points if you can't extract all text."
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract the text from this PDF file. For large documents, provide as much content as you can within the limits."
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
            ],
            max_tokens: 4000 // Increase token limit for larger documents
          })
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
        }

        console.log('OpenAI response received');
        const openaiData = await openaiResponse.json();
        extractedText = openaiData.choices[0]?.message?.content || 'Failed to extract text from PDF';
        break;

      case 'text/plain':
        console.log('Processing plain text file');
        // For text files, just read the text
        extractedText = await fileData.text();
        break;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/msword':
      case 'application/vnd.ms-excel':
        console.log(`Processing ${fileType} file`);
        // For Word/Excel, use OpenAI to extract content
        const docBuffer = await fileData.arrayBuffer();
        const docBase64 = btoa(String.fromCharCode(...new Uint8Array(docBuffer)));
        
        console.log('Making OpenAI API request for document parsing');
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
                content: `You are a document extraction tool. Your task is to accurately extract text from the provided ${fileType} file. Focus on getting as much of the content as possible. For very large documents, prioritize key points.`
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Extract the text from this ${fileType} file. For large documents, provide as much content as you can within the limits.`
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
            ],
            max_tokens: 4000 // Increase token limit for larger documents
          })
        });

        if (!docsResponse.ok) {
          const errorData = await docsResponse.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
        }

        console.log('OpenAI response received for document');
        const docsData = await docsResponse.json();
        extractedText = docsData.choices[0]?.message?.content || `Failed to extract text from ${fileType}`;
        break;
        
      default:
        console.warn(`Unsupported file type: ${fileType}`);
        extractedText = `Unsupported file type: ${fileType}`;
    }

    console.log(`Successfully extracted text: ${extractedText.length} characters`);
    
    // For very large files, we might need to truncate the text to avoid response size limits
    if (extractedText.length > 500000) {
      console.log('Text is very large, truncating to 500K characters');
      extractedText = extractedText.substring(0, 500000) + "... [Content truncated due to size]";
    }

    return new Response(
      JSON.stringify({ extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while parsing the document' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
