import React from "react";
import { Button } from "../ui/button";
import { HiSaveAs } from "react-icons/hi";

const SavePageBtn = () => {
  return (
    <Button variant={"outline"}>
      <HiSaveAs className="h-6 w-6" />
      Save
    </Button>
  );
};

export default SavePageBtn;
