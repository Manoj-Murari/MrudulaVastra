"use client";

import { CartProvider } from "@/components/providers/CartProvider";
import { ProgressBarProvider } from "@/components/providers/ProgressBarProvider";
import CartDrawer from "@/components/layout/CartDrawer";
import WelcomeModal from "@/components/ui/WelcomeModal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProgressBarProvider>
      <CartProvider>
        <CartDrawer />
        {children}
        <WelcomeModal />
      </CartProvider>
    </ProgressBarProvider>
  );
}
