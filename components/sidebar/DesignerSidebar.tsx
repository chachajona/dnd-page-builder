import React from "react";
import PageElements from "../PageElements";
import SidebarBtnElement from "./SidebarBtnElement";

const DesignerSidebar = () => {
  return (
    <aside className="w-[300px] max-w-[300px] flex flex-col flex-grow gap-2 border-r-2 border-muted p-4 bg-background overflow-y-auto h-full">
      Elements
      <SidebarBtnElement pageElement={PageElements.TextField} />
    </aside>
  );
};

export default DesignerSidebar;
