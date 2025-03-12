
import { useToast } from "@/hooks/use-toast";
import { ContentForm } from "./content/ContentForm";
import { ContentDisplay } from "./content/ContentDisplay";
import { useContentGeneration } from "./content/useContentGeneration";
import { createTextDownload } from "./content/contentUtils";
import { WriteContentProps } from "./content/types";

export function WriteContent({ userId }: WriteContentProps) {
  const { toast } = useToast();
  const {
    contentType,
    setContentType,
    subject,
    setSubject,
    selectedSubjectId,
    setSelectedSubjectId,
    wordCount,
    setWordCount,
    generatedContent,
    isGenerating,
    handleGenerate
  } = useContentGeneration(userId);

  const downloadAsText = () => {
    createTextDownload(generatedContent, contentType, subject);
  };

  const downloadAsPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download functionality will be available soon!",
    });
  };

  // Convert wordCount to string for ContentForm props
  const wordCountString = wordCount === 750 ? "short" : wordCount === 1500 ? "medium" : "long";
  
  // Create a setter function that converts string to number
  const handleWordCountChange = (value: string) => {
    let numericValue = 1500; // medium is default
    
    if (value === "short") numericValue = 750;
    else if (value === "medium") numericValue = 1500;
    else if (value === "long") numericValue = 3000;
    
    setWordCount(numericValue);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
      <ContentForm
        contentType={contentType}
        setContentType={setContentType}
        subject={subject}
        setSubject={setSubject}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        wordCount={wordCountString}
        setWordCount={handleWordCountChange}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
      />
      
      <ContentDisplay
        generatedContent={generatedContent}
        isGenerating={isGenerating}
        onDownloadText={downloadAsText}
        onDownloadPDF={downloadAsPDF}
      />
    </div>
  );
}
