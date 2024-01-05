import React from "react";
import { TextFieldFormElement } from "./fields/TextField";

export type ElementsType = "TextField";

export type PageElement = {
  type: ElementsType;
  construct: (id: string) => PageElementInstance;
  designerBtnElement: {
    icon: React.ElementType;
    label: string;
  };
  designerComponent: React.FC<{
    elementInstance: PageElementInstance;
  }>;
  pageComponent: React.FC;
  propertiesComponent: React.FC;
};

export type PageElementInstance = {
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};
type PageElementsType = {
  [key in ElementsType]: PageElement;
};

const PageElements: PageElementsType = {
  TextField: TextFieldFormElement,
};

export default PageElements;
