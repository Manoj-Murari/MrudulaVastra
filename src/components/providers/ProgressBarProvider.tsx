"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import React from "react";

export function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProgressBar
        height="3px"
        color="#B8963E"
        options={{ showSpinner: false, easing: "ease", speed: 500 }}
        shallowRouting
      />
    </>
  );
}
