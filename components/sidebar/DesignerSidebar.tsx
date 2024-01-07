import React from "react";
import useDesigner from "../hooks/useDesigner";
import PageElementsSidebar from "../PageElementsSidebar";
import PropertiesPageSidebar from "../PropertiesPageSidebar";

const DesignerSidebar = () => {
  const { selectedElement } = useDesigner();
  return (
    <aside className="w-[300px] max-w-[300px] flex flex-col flex-grow gap-2 border-r-2 border-muted p-4 bg-background overflow-y-auto h-full">
      {!selectedElement && <PageElementsSidebar />}
      {selectedElement && <PropertiesPageSidebar />}
    </aside>
  );
};

export default DesignerSidebar;
