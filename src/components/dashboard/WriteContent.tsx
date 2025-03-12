
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

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
      <ContentForm
        contentType={contentType}
        setContentType={setContentType}
        subject={subject}
        setSubject={setSubject}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        wordCount={wordCount}
        setWordCount={setWordCount}
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
