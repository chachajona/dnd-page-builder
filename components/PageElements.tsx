import React from "react";
import { TextFieldFormElement } from "./fields/TextField";
import { SelectFieldFormElement } from "./fields/SelectField";
import { ContainerPageElement } from "./containers/Container";
import { ColumnPageElement } from "./containers/Column";
import { RowPageElement } from "./containers/Row";

export type ElementsType =
  | "TextField"
  | "SelectField"
  | "Container"
  | "Column"
  | "Row";
export type SubmitFunction = (key: string, value: string) => void;
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
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};
type PageElementsType = {
  [key in ElementsType]: PageElement;
};

const PageElements: PageElementsType = {
  TextField: TextFieldFormElement,
  SelectField: SelectFieldFormElement,
  Container: ContainerPageElement,
  Column: ColumnPageElement,
  Row: RowPageElement,
};

export default PageElements;
