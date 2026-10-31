import React from "react";
import Link from "next/link";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { AlertCircle } from "lucide-react";

interface EventNotFoundProps {
  message?: string;
  returnHref?: string;
  returnLabel?: string;
}

export function EventNotFound({
  message = "This event could not be located in your browser storage. It may have been deleted or created in a different session.",
  returnHref = "/events",
  returnLabel = "Return to Event Portfolio",
}: EventNotFoundProps) {
  return (
    <Card className="p-12 text-center space-y-4 max-w-lg mx-auto">
      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
      <h2 className="text-xl font-serif font-bold text-forest-950">
        Celebration Not Found
      </h2>
      <p className="text-xs text-sand-600 leading-relaxed">
        {message}
      </p>
      <Link href={returnHref}>
        <Button variant="primary" size="sm">
          {returnLabel}
        </Button>
      </Link>
    </Card>
  );
}

