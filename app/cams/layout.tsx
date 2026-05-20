import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LDUFK Cams",
  description: "Live player camera routing for LDUFK CS2 HUD"
};

export default function CamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
