import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
