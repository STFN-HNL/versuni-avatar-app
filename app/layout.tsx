import "@/styles/globals.css";
import { Metadata } from "next";
import { Maven_Pro } from "next/font/google";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-maven-pro",
});

export const metadata: Metadata = {
  title: {
    default: "HeyGen Interactive Avatar SDK Demo",
    template: `%s - HeyGen Interactive Avatar SDK Demo`,
  },
  icons: {
    icon: "/heygen-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${mavenPro.variable} font-sans`}
      lang="en"
    >
      <head />
      <body className="min-h-screen bg-white text-black">
        <main className="relative flex flex-col gap-6 min-h-screen w-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
