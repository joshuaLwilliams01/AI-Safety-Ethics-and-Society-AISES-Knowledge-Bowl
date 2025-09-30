import "./globals.css";
import { ReactNode } from "react";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <header className="w-full border-b p-4 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <h1 className="font-bold">AISES Knowledge Bowl</h1>
            <nav className="flex gap-4 text-sm">
              <a href="/">Home</a>
              <a href="/host">Host</a>
              <a href="/play">Play</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
