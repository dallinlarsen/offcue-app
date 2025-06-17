// ConfettiContext.tsx
import React, { createContext, useRef, useContext } from "react";
import { Confetti, ConfettiMethods } from "react-native-fast-confetti";

  const CONFETTI_COLORS = [
    "#377EC0",
    "#5460AC",
    "#FBDF54",
    "#12BAAA",
    "#F7891F",
    "#F04F52",
  ];

const ConfettiContext = createContext<(() => void) | null>(null);

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
  const isFalling = useRef(false);

  const sendConfetti = () => {
    if (isFalling.current) return;
    isFalling.current = true;
    confettiRef.current?.restart();
    setTimeout(() => {
      confettiRef.current?.reset();
      isFalling.current = false;
    }, 6000);
  };

  return (
    <ConfettiContext.Provider value={sendConfetti}>
      <Confetti
        ref={confettiRef}
        colors={CONFETTI_COLORS}
        autoplay={false}
        fallDuration={6000}
      />
      {children}
    </ConfettiContext.Provider>
  );
};
