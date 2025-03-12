
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubjectManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Subject management functionality has been purged.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
