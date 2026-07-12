import { useEffect } from "react";

/** Sets document.title for the lifetime of the page, restoring the previous title on unmount. */
export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
