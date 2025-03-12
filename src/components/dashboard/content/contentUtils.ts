
export const formatTextContent = (content: string) => {
  // Remove Markdown asterisks and hashtags while preserving line breaks
  return content.replace(/\*\*(.*?)\*\*/g, '$1')
               .replace(/\*(.*?)\*/g, '$1')
               .replace(/^### (.*?)$/gm, '$1')
               .replace(/^## (.*?)$/gm, '$1')
               .replace(/^# (.*?)$/gm, '$1');
};

export const createTextDownload = (content: string, contentType: string, subject: string) => {
  if (!content) return;
  
  const formattedContent = formatTextContent(content);
  const element = document.createElement("a");
  const file = new Blob([formattedContent], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${contentType}_${subject.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
