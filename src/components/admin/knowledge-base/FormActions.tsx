
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isUploading: boolean;
  isEditing: boolean;
}

export function FormActions({ onClose, onSubmit, isUploading, isEditing }: FormActionsProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
      <Button onClick={onSubmit} disabled={isUploading}>
        {isUploading ? "Saving..." : (isEditing ? "Update" : "Add")}
      </Button>
    </DialogFooter>
  );
}
