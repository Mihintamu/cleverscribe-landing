
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2 } from "lucide-react";
import { uploadFile, parseDocument } from "./utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onContentParsed: (content: string) => void;
  onFileSelected?: (file: File | null) => void;
}

export function FileUploader({ onContentParsed, onFileSelected }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    setSelectedFile(file);
    
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file selected",
      });
      return;
    }

    uploadFile(
      selectedFile,
      (fileUrl) => {
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
        
        // Start parsing the document
        parseDocument(
          fileUrl,
          selectedFile.type,
          (extractedText) => {
            onContentParsed(extractedText);
            toast({
              title: "Success",
              description: "Document parsed successfully",
            });
          },
          (errorMessage) => {
            toast({
              variant: "destructive",
              title: "Error",
              description: errorMessage,
            });
          },
          () => setIsParsingFile(true),
          () => setIsParsingFile(false)
        );
      },
      (errorMessage) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      },
      () => setFileUploading(true),
      () => setFileUploading(false)
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Upload Document (Optional)</Label>
      <div className="flex items-center gap-2">
        <Input 
          ref={fileInputRef}
          id="file-upload" 
          type="file" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
        />
        <Button 
          type="button"
          onClick={handleFileUpload}
          disabled={!selectedFile || fileUploading}
          size="sm"
        >
          {fileUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
        </Button>
      </div>
      {selectedFile && (
        <p className="text-xs text-muted-foreground">
          Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </p>
      )}
      {isParsingFile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Parsing document content...</span>
        </div>
      )}
    </div>
  );
}
