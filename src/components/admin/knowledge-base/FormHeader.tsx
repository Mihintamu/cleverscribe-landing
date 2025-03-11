
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FormHeaderProps {
  isEditing: boolean;
}

export function FormHeader({ isEditing }: FormHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>{isEditing ? "Edit Knowledge Base Entry" : "Add Knowledge Base Entry"}</DialogTitle>
    </DialogHeader>
  );
}
