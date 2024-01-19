import React from "react";
import SidebarBtnElement from "./SidebarBtnElement";
import PageElements from "../PageElements";

const PageElementsSidebar = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center">
      <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
        Layout elements
      </p>
      <SidebarBtnElement pageElement={PageElements.TextField} />
      <SidebarBtnElement pageElement={PageElements.SelectField} />
      <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
        Container elements
      </p>
      <SidebarBtnElement pageElement={PageElements.Container} />
    </div>
  );
};

export default PageElementsSidebar;
