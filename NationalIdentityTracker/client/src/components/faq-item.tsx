import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-muted rounded-lg">
      <div 
        className="cursor-pointer flex items-center justify-between p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-medium">{question}</h4>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      {isOpen && (
        <div className="p-4 pt-0 text-muted-foreground text-sm">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
