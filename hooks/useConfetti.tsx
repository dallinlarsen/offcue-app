// ConfettiContext.tsx
import React, { createContext, useRef, useContext, useState } from "react";
import { Confetti, ConfettiMethods } from "react-native-fast-confetti";

const CONFETTI_COLORS = [
  "#377EC0",
  "#5460AC",
  "#FBDF54",
  "#12BAAA",
  "#F7891F",
  "#F04F52",
];

const ConfettiContext = createContext<React.RefObject<ConfettiMethods> | null>(
  null
);

// function assigned by the provider to allow external teardown of the confetti
// view. This enables consumers outside of React components (e.g. services)
// to remove the Skia-based view before the runtime is destroyed.
let teardownConfetti: (() => void) | null = null;

export const destroyConfettiView = () => {
  teardownConfetti?.();
};

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
};

export const ConfettiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const confettiRef = useRef<ConfettiMethods>(null);
  const [visible, setVisible] = useState(true);

  teardownConfetti = () => setVisible(false);

  return (
    <ConfettiContext.Provider value={confettiRef}>
      {visible && (
        <Confetti
          ref={confettiRef}
          colors={CONFETTI_COLORS}
          autoplay={false}
          fallDuration={6000}
        />
      )}
      {children}
    </ConfettiContext.Provider>
  );
};
