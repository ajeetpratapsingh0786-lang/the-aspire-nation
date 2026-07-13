import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "The Aspire Nation",
    template: "%s | The Aspire Nation",
  },

  description:
    "The Aspire Nation is India's digital newspaper and preparation platform for UPSC, SSC, Banking, Railway, Defence, State PCS, CUET, NEET and all competitive exam aspirants. Read daily current affairs, government job notifications, editorials, e-paper, exam results and exam-focused analysis in one place. Every Aspirant's Morning Starts Here.",

  keywords: [
    "The Aspire Nation",
    "The Aspire Nation Newspaper",
    "The Aspire Nation E Paper",
    "Current Affairs",
    "Daily Current Affairs",
    "Current Affairs Today",
    "UPSC Current Affairs",
    "SSC Current Affairs",
    "Banking Current Affairs",
    "Railway Current Affairs",
    "Defence Current Affairs",
    "State PCS Current Affairs",
    "IAS Current Affairs",
    "Current Affairs for UPSC",
    "Current Affairs for SSC",
    "Current Affairs for Banking",
    "Current Affairs for Railway",
    "Current Affairs PDF",
    "UPSC Newspaper",
    "Daily Newspaper for UPSC",
    "Current Affairs Newspaper",
    "Best Newspaper for Competitive Exams",
    "Government Jobs",
    "Latest Government Jobs",
    "Government Job Notifications",
    "Exam Results",
    "Admit Card",
    "Editorial Analysis",
    "Daily Editorial",
    "UPSC Editorial",
    "SSC Preparation",
    "UPSC Preparation",
    "Bank PO Preparation",
    "Railway Exam Preparation",
    "Competitive Exam Preparation",
    "Daily E-Paper",
    "Exam Updates",
    "UPSC News",
    "SSC News",
    "Banking News",
    "Railway News",
    "One Platform for Competitive Exams",
  ],

  authors: [
    {
      name: "The Aspire Nation",
    },
  ],

  creator: "The Aspire Nation",

  publisher: "The Aspire Nation",

  metadataBase: new URL("https://theaspirenation.com"),

  alternates: {
    canonical: "https://theaspirenation.com",
  },

  openGraph: {
    title:
      "The Aspire Nation | Daily Current Affairs, Government Jobs & E-Paper",

    description:
      "Every Aspirant's Morning Starts Here. Daily Current Affairs, Government Jobs, Editorials, Exam Results and Premium E-Paper for UPSC, SSC, Banking, Railway, Defence, State PCS and all competitive exam aspirants.",

    url: "https://theaspirenation.com",

    siteName: "The Aspire Nation",

    locale: "en_IN",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "The Aspire Nation | Daily Current Affairs & E-Paper",

    description:
      "Daily Current Affairs, Editorials, Government Jobs, Results and Premium E-Paper for UPSC, SSC, Banking, Railway and all competitive examinations.",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "Education",

  applicationName: "The Aspire Nation",

  referrer: "origin-when-cross-origin",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}