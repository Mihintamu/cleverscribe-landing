
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CommonToggleProps {
  isCommon: boolean;
  setIsCommon: (value: boolean) => void;
}

export function CommonToggle({ isCommon, setIsCommon }: CommonToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="checkbox"
        id="is-common"
        className="w-4 h-4"
        checked={isCommon}
        onChange={(e) => setIsCommon(e.target.checked)}
      />
      <Label htmlFor="is-common">Common Knowledge Base</Label>
    </div>
  );
}
