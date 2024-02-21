import React from "react";
import TreeItemBtn from "./TreeItemBtn";
import PageElements from "../PageElements";
import useDesigner from "../hooks/useDesigner";

const ListTreeItem = () => {
  const { addElement } = useDesigner();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center">
      <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
        Layout elements
      </p>
      <TreeItemBtn
        pageElement={PageElements.TextField}
        addElement={addElement}
      />
      <TreeItemBtn
        pageElement={PageElements.SelectField}
        addElement={addElement}
      />
      <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
        Container elements
      </p>
      <TreeItemBtn
        pageElement={PageElements.Container}
        addElement={addElement}
      />
      <TreeItemBtn pageElement={PageElements.Column} addElement={addElement} />
      <TreeItemBtn pageElement={PageElements.Row} addElement={addElement} />
    </div>
  );
};

export default ListTreeItem;
