
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContentInputProps {
  content: string;
  setContent: (value: string) => void;
  hasFile: boolean;
}

export function ContentInput({ content, setContent, hasFile }: ContentInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="content">Content {hasFile ? "(Optional when file is uploaded)" : ""}</Label>
      <Textarea
        id="content"
        placeholder={hasFile ? "Content is optional when a file is uploaded" : "Enter knowledge base content"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-32"
      />
    </div>
  );
}
