

import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "My Notes",
  description: "acces your notes everywhere",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      <title>my Notes</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
    
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 bg-[url('/fjord.jpg')] bg-cover bg-center">
        {children}
        </div>

        <footer><p></p> <p className="center">contact support on <a href="mailto:amenjaballi08@gmail.com">amenjaballi08@gmail.com  </a>  or on <a href="contact:50175966">50175966</a></p></footer>
      </body>
    </html>
  );
}
