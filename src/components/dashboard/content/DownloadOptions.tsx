
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";

interface DownloadOptionsProps {
  onDownloadText: () => void;
  onDownloadPDF: () => void;
}

export function DownloadOptions({ onDownloadText, onDownloadPDF }: DownloadOptionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onDownloadText}
        title="Download as Text"
      >
        <Save className="w-4 h-4 mr-2" />
        TXT
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownloadPDF}
        title="Download as PDF"
      >
        <Download className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}
