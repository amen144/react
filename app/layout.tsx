

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AudioControls from "./component/audioCtrl";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
  const tracks = [
    "/1.mp3", "/2.mp3", "/3.mp3", "/4.mp3", "/5.mp3",
    "/6.mp3", "/7.mp3", "/8.mp3", "/9.mp3", "/10.mp3", "/11.mp3"
  ];
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
           <AudioControls tracks={tracks} />
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 bg-[url('/fjord.jpg')] bg-cover bg-center">
        {children}
        </div>
        
      </body>
    </html>
  );
}
