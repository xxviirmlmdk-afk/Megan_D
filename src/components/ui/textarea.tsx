import React from "react";

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return <textarea {...props} className={`border px-2 py-1 rounded resize-none ${props.className ?? ""}`} />;
};
