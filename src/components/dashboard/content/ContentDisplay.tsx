
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
          <div className="border rounded-md p-4 min-h-[400px] bg-muted/20">
            {isGenerating ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse">Generating content...</div>
              </div>
            ) : !generatedContent ? (
              <div className="text-muted-foreground flex justify-center items-center h-full">
                Generated content will appear here...
              </div>
            ) : (
              <div className="whitespace-pre-line">{generatedContent}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
