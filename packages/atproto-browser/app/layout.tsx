import '@picocss/pico';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "fc315829568c403788332c6f16ba678b"}'
          />
        </main>
      </body>
    </html>
  );
}
