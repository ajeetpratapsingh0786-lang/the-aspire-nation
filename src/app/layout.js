import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://theaspirenation.com"),

  title: {
    default:
      "The Aspire Nation | Daily Current Affairs & E-Paper for Aspirants",
    template: "%s | The Aspire Nation",
  },

  description:
    "The Aspire Nation is a daily digital newspaper and preparation platform for UPSC, SSC, Banking, Railway, Defence, State PCS and other competitive exam aspirants. Read exam-focused current affairs, editorials, e-paper editions, government job updates and results in one place.",

  applicationName: "The Aspire Nation",

  authors: [
    {
      name: "The Aspire Nation",
      url: "https://theaspirenation.com",
    },
  ],

  creator: "The Aspire Nation",
  publisher: "The Aspire Nation",

  keywords: [
    "The Aspire Nation",
    "daily current affairs",
    "competitive exam current affairs",
    "daily e-paper for aspirants",
    "UPSC current affairs",
    "SSC current affairs",
    "Banking current affairs",
    "Railway current affairs",
    "Defence current affairs",
    "State PCS current affairs",
    "editorial analysis",
    "government job notifications",
    "competitive exam results",
    "UPSC newspaper",
    "exam-focused newspaper",
    "competitive exam preparation",
  ],

  category: "Education",

  openGraph: {
    title:
      "The Aspire Nation | Daily Current Affairs & E-Paper for Aspirants",

    description:
      "Every Aspirant's Morning Starts Here. Read daily current affairs, editorials, exam updates and premium e-paper editions for competitive examinations.",

    url: "/",

    siteName: "The Aspire Nation",

    locale: "en_IN",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "The Aspire Nation | Daily Current Affairs & E-Paper",

    description:
      "Daily current affairs, editorials, exam updates and premium e-paper editions for competitive exam aspirants.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  referrer: "origin-when-cross-origin",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#b91c1c",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}