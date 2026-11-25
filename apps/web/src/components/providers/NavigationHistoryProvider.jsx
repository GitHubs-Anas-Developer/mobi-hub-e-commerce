"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { usePathname, useRouter } from "next/navigation";

const NavigationHistoryContext = createContext(null);

export function NavigationHistoryProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const historyStack = useRef([]);
  const isBrowserBack = useRef(false);

  // Track internal route navigation
  useEffect(() => {
    if (!pathname) return;

    const stack = historyStack.current;
    const lastPath = stack[stack.length - 1];

    if (lastPath === pathname) return;

    if (isBrowserBack.current) {
      isBrowserBack.current = false;

      // Browser already moved to the previous route.
      // Do not add that route again.
      if (stack[stack.length - 1] === pathname) return;
    }

    historyStack.current.push(pathname);
  }, [pathname]);

  // Keep our internal stack in sync with browser Back.
  useEffect(() => {
    const handlePopState = () => {
      const stack = historyStack.current;

      if (stack.length > 1) {
        stack.pop();
        isBrowserBack.current = true;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const goBack = useCallback(
    (fallbackUrl = "/") => {
      const stack = historyStack.current;

      if (stack.length > 1) {
        router.back();
      } else {
        router.push(fallbackUrl);
      }
    },
    [router]
  );

  return (
    <NavigationHistoryContext.Provider value={{ goBack }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);

  if (!context) {
    throw new Error(
      "useNavigationHistory must be used inside NavigationHistoryProvider"
    );
  }

  return context;
}