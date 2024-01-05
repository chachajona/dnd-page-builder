import React from "react";
import { DesignerContext } from "@/components/context/DesignerContext";

const useDesigner = () => {
  const context = React.useContext(DesignerContext);
  if (!context) {
    throw new Error("useDesigner must be used within a DesignerProvider");
  }
  return context;
};

export default useDesigner;
