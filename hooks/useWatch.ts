import { useEffect, useRef } from "react";

export default function useWatch<T>(value: T, callback: (newValue: T, oldValue: T) => void) {
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current !== value) {
      callback(value, previous.current);
      previous.current = value;
    }
  }, [value]);
}