import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata = {
  title: "AXIOMÉ — Personal Finance Intelligence",
  description: "AXIOMÉ — AI-powered personal finance dashboard. Track expenses, forecast net worth, simulate scenarios, and get intelligent insights to master your financial future.",
  keywords: ["finance dashboard", "expense tracker", "net worth forecast", "AI financial advisor", "budgeting"],
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
