
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DownloadOptions } from "./DownloadOptions";

interface ContentDisplayProps {
  generatedContent: string;
  isGenerating: boolean;
  onDownloadText: () => void;
  onDownloadPDF: () => void;
}

export function ContentDisplay({
  generatedContent,
  isGenerating,
  onDownloadText,
  onDownloadPDF,
}: ContentDisplayProps) {
  // Function to render content with proper formatting
  const renderFormattedContent = (content: string) => {
    // Format markdown-style content
    let formattedContent = content;

    // Replace headers (### Heading) with styled headers
    formattedContent = formattedContent.replace(/^### (.*?)$/gm, (_, text) => 
      `<h3 class="text-xl font-bold mt-4 mb-2">${text}</h3>`
    );
    formattedContent = formattedContent.replace(/^## (.*?)$/gm, (_, text) => 
      `<h2 class="text-2xl font-bold mt-5 mb-3">${text}</h2>`
    );
    formattedContent = formattedContent.replace(/^# (.*?)$/gm, (_, text) => 
      `<h1 class="text-3xl font-bold mt-6 mb-4">${text}</h1>`
    );

    // Replace bold (**text**)
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, (_, text) => 
      `<strong class="font-bold">${text}</strong>`
    );

    // Replace italic (*text*)
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, (_, text) => 
      `<em class="italic">${text}</em>`
    );

    // Replace bullet points
    formattedContent = formattedContent.replace(/^- (.*?)$/gm, (_, text) => 
      `<li class="ml-4">${text}</li>`
    );
    
    // Add proper list tags around bullet points
    formattedContent = formattedContent.replace(/(<li class="ml-4">.*?<\/li>)\n(<li class="ml-4">)/g, '$1$2');
    formattedContent = formattedContent.replace(/(<li class="ml-4">.*?<\/li>)(?!\n<li class="ml-4">|\n<\/ul>)/g, '<ul>$1</ul>');
    
    // Handle multiple consecutive list items
    let hasOpenUl = false;
    const lines = formattedContent.split('\n');
    formattedContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isListItem = line.includes('<li class="ml-4">');
      
      if (isListItem && !hasOpenUl) {
        formattedContent += '<ul>';
        hasOpenUl = true;
      } else if (!isListItem && hasOpenUl) {
        formattedContent += '</ul>';
        hasOpenUl = false;
      }
      
      formattedContent += line + '\n';
    }
    
    if (hasOpenUl) {
      formattedContent += '</ul>';
    }

    // Add paragraphs to regular text
    const paragraphs = formattedContent.split('\n\n');
    formattedContent = paragraphs.map(para => {
      // If the paragraph doesn't already have HTML tags
      if (!para.trim().startsWith('<')) {
        return `<p class="my-2">${para}</p>`;
      }
      return para;
    }).join('');

    return formattedContent;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Generated Content</Label>
            {generatedContent && (
              <DownloadOptions
                onDownloadText={onDownloadText}
                onDownloadPDF={onDownloadPDF}
              />
            )}
          </div>
          <div className="border rounded-md p-4 min-h-[400px] bg-muted/20 overflow-auto">
            {isGenerating ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse">Generating content...</div>
              </div>
            ) : !generatedContent ? (
              <div className="text-muted-foreground flex justify-center items-center h-full">
                Generated content will appear here...
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: renderFormattedContent(generatedContent) }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
