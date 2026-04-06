import "./globals.css";

export const metadata = {
  title: "SkillBarter",
  description: "Teach what you know. Learn what you don't.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}