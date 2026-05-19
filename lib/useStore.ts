"use client";

import * as React from "react";
import { subscribe } from "./storage";

export function useStore<T>(read: () => T, fallback: T): T {
  const [value, setValue] = React.useState<T>(fallback);

  React.useEffect(() => {
    setValue(read());
    const unsub = subscribe(() => setValue(read()));
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}
