
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  contentType: string;
  subject: string;
  wordCount: string;
  knowledgeBase?: string;
}

function createPrompt(contentType: string, subject: string, wordCount: string, knowledgeBase: string): string {
  // Content type formats
  const contentFormats = {
    essays: "Write a well-structured essay with introduction, body paragraphs, and conclusion",
    research_paper: "Write a research paper with abstract, introduction, methodology, results, discussion, and conclusion",
    assignments: "Write a comprehensive assignment that demonstrates understanding of the topic",
    reports: "Write a detailed report with executive summary, findings, analysis, and recommendations",
    thesis: "Write a thesis with clear arguments, evidence, and scholarly analysis",
    presentation: "Write presentation content with clear slides, talking points, and visual descriptions",
    case_studies: "Write a case study with background, analysis, alternatives, recommendations, and implementation",
    book_review: "Write a book review with summary, analysis, evaluation, and conclusion",
    article_reviews: "Write an article review with summary, critique, and implications",
    term_papers: "Write a term paper with comprehensive research, analysis, and conclusions",
  };

  // Word count mapping
  const wordCounts = {
    short: "around 300-500 words",
    medium: "around 800-1000 words",
    long: "around 1500-2000 words",
  };

  const format = contentFormats[contentType as keyof typeof contentFormats] || 
    "Write comprehensive content";
  
  const length = wordCounts[wordCount as keyof typeof wordCounts] || 
    "around 800 words";

  let prompt = `${format} about "${subject}", ${length}.`;
  
  // Add knowledge base context if available
  if (knowledgeBase && knowledgeBase.trim()) {
    prompt += `\n\nUse the following information as reference:\n${knowledgeBase}`;
  }
  
  prompt += "\n\nMake sure the content is well-structured, engaging, and academically sound.";
  
  return prompt;
}

async function generateContent(prompt: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional academic content creator that produces well-researched, properly formatted content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message || "Failed to generate content");
    }
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No content was generated");
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const requestData: RequestBody = await req.json();
    const { contentType, subject, wordCount, knowledgeBase = "" } = requestData;
    
    if (!contentType || !subject || !wordCount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log("Generating content for:", { contentType, subject, wordCount });
    console.log("Knowledge base length:", knowledgeBase.length);
    
    const prompt = createPrompt(contentType, subject, wordCount, knowledgeBase);
    const content = await generateContent(prompt);
    
    return new Response(
      JSON.stringify({ content }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
