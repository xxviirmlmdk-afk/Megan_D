import React from "react";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => {
  return <label {...props} className="block mb-2 font-semibold" />;
};
