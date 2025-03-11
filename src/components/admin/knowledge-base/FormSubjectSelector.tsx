
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subject = {
  id: string;
  name: string;
};

interface FormSubjectSelectorProps {
  subjects: Subject[];
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  isCommon: boolean;
}

export function FormSubjectSelector({
  subjects,
  selectedSubject,
  setSelectedSubject,
  isCommon
}: FormSubjectSelectorProps) {
  if (isCommon) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="subject">Subject</Label>
      <Select
        value={selectedSubject}
        onValueChange={setSelectedSubject}
      >
        <SelectTrigger id="subject">
          <SelectValue placeholder="Select a subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
