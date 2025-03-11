
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function AuthButtons() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="font-medium" onClick={() => navigate("/auth")}>
        Login
      </Button>
      <Button className="font-medium" onClick={() => navigate("/auth")}>
        Sign Up
      </Button>
    </div>
  );
}
