import React from "react";
import SidebarBtnElement from "./sidebar/SidebarBtnElement";
import PageElements from "./PageElements";

const PageElementsSidebar = () => {
  return (
    <div>
      Elements
      <SidebarBtnElement pageElement={PageElements.TextField} />
    </div>
  );
};

export default PageElementsSidebar;
