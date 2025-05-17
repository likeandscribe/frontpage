"use client";

import { useEffect } from "react";

export function SuperHackyScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
