import { jura } from "./styles/fonts";
import "./styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jura.variable}`}>
      <body>{children}</body>
    </html>
  );
}
