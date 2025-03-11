
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2 } from "lucide-react";
import { uploadFile, parseDocument } from "./utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onContentParsed: (content: string) => void;
  onFileSelected: (file: File | null) => void;
}

export function FileUploader({ onContentParsed, onFileSelected }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsingProgress, setParsingProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    setSelectedFile(file);
    onFileSelected(file);
    
    // Reset progress message when a new file is selected
    setParsingProgress("");
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

    try {
      setFileUploading(true);
      setParsingProgress("Starting file upload...");
      
      await new Promise<void>((resolve, reject) => {
        uploadFile(
          selectedFile,
          (fileUrl) => {
            // Start parsing the document
            setParsingProgress("File uploaded successfully. Starting document parsing...");
            
            parseDocument(
              fileUrl,
              selectedFile.type,
              (extractedText) => {
                setParsingProgress("Document parsed successfully!");
                onContentParsed(extractedText);
                toast({
                  title: "Success",
                  description: "Document uploaded and parsed successfully",
                });
                resolve();
              },
              (errorMessage) => {
                setParsingProgress(`Error: ${errorMessage}`);
                toast({
                  variant: "destructive",
                  title: "Error parsing document",
                  description: errorMessage,
                });
                reject(new Error(errorMessage));
              },
              () => {
                setIsParsingFile(true);
                setParsingProgress("Parsing document content... This may take a minute for large files.");
              },
              () => setIsParsingFile(false)
            );
          },
          (errorMessage) => {
            setParsingProgress(`Error: ${errorMessage}`);
            toast({
              variant: "destructive",
              title: "Error uploading file",
              description: errorMessage,
            });
            reject(new Error(errorMessage));
          },
          () => setParsingProgress("Uploading file..."),
          () => {}
        );
      });
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setFileUploading(false);
    }
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
          disabled={fileUploading || isParsingFile}
        />
        <Button 
          type="button"
          onClick={handleFileUpload}
          disabled={!selectedFile || fileUploading || isParsingFile}
          size="sm"
        >
          {fileUploading || isParsingFile ? (
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
      {parsingProgress && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isParsingFile && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{parsingProgress}</span>
        </div>
      )}
    </div>
  );
}
