"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import Link from "next/link";

const ErrorPage = ({ error }: { error: Error }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex w-full h-full flex-col items-center justify-center">
      <h2 className="text-destructive text-4xl">Something went wrong!</h2>
      <Button asChild>
        <Link href="/">Go back to Home</Link>
      </Button>
    </div>
  );
};

export default ErrorPage;
