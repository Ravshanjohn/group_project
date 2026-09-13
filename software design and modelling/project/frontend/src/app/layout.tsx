"use client";

import "./globals.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import Container from "../components/Container";
import { Toaster } from "react-hot-toast";
import MenuBar from "../components/menu";
import SocketInitializer from "../components/SocketInitializer";
import { useTheme } from "@/src/lib/useTheme";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useTheme();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="overflow-x-hidden"
    >
      <body className="bg-main overflow-x-hidden">
        <SocketInitializer />
        
        <MenuBar />

        <Container>
          {children}
        </Container>

        <Toaster position="bottom-center" />
        
      </body>
    </html> 
  );
}