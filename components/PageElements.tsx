import React from "react";
import { TextFieldFormElement } from "./fields/TextField";
import { SelectFieldFormElement } from "./fields/SelectField";
import { ColumnPageElement } from "./containers/Column";
import { RowPageElement } from "./containers/Row";
import { UniqueIdentifier } from "@dnd-kit/core";

export type ElementsType = "TextField" | "SelectField" | "Column" | "Row";
export type SubmitFunction = (key: UniqueIdentifier, value: string) => void;
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
  pageComponent: React.FC<{
    elementInstance: PageElementInstance;
    submitValue?: SubmitFunction;
  }>;
  propertiesComponent: React.FC<{
    elementInstance: PageElementInstance;
  }>;
  jsonPropertiesComponent: React.FC<{
    elementInstance: PageElementInstance;
  }>;
  validate: (formElement: PageElementInstance, currentValue: string) => boolean;
};

export type PageElementInstance = {
  id: UniqueIdentifier;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};
type PageElementsType = {
  [key in ElementsType]: PageElement;
};

const PageElements: PageElementsType = {
  TextField: TextFieldFormElement,
  SelectField: SelectFieldFormElement,
  Column: ColumnPageElement,
  Row: RowPageElement,
};

export default PageElements;
