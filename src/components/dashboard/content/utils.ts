
import { WordCountOption } from "./types";

// Converts a numeric word count to a WordCountOption
export function formatWords(wordCount: number): WordCountOption {
  if (wordCount <= 500) return "short";
  if (wordCount <= 1000) return "medium";
  return "long";
}

export function createTextDownload(text: string, contentType: string, subject: string) {
  if (!text) return;

  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `${contentType}-${subject}.txt`.replace(/\s+/g, "-").toLowerCase();
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
