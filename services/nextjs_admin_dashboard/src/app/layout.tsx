import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import Link from 'next/link';
import { Home, FileText, Lock, Users, Component } from 'lucide-react';

import { Nav } from '~/components/Nav';
import Toaster from '~/components/Toaster';

import './globals.css';

const fira = Fira_Code({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deuterium',
  description: 'Secure and manage your app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fira.className}>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Component className="size-6" />
                  <span className="">Deuterium</span>
                </Link>
              </div>
              <Nav
                links={[
                  {
                    title: 'Dashboard',
                    icon: Home,
                    variant: 'default',
                    href: '/dashboard',
                  },
                  {
                    title: 'Groups',
                    icon: Users,
                    variant: 'default',
                    href: '/groups',
                  },
                  {
                    title: 'Permissions',
                    icon: Lock,
                    variant: 'default',
                    href: '/permissions',
                  },
                  {
                    title: 'Documents',
                    icon: FileText,
                    variant: 'default',
                    href: '/documents',
                  },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
