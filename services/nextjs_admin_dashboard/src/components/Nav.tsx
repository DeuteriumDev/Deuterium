import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

import { cn } from '~/lib/utils';
import { buttonVariants } from '~/components/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/Tooltip';

interface NavProps {
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href: string;
    variant: 'default' | 'ghost';
  }[];
}

export function Nav({ links }: NavProps) {
  return (
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {links.map((link, index) => (
          <Link
            key={link.title}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <link.icon className="h-4 w-4" />
            {link.title}
            {link.label && (
              <span
                className={cn(
                  'ml-auto',
                  link.variant === 'default' &&
                    'text-background dark:text-white',
                )}
              >
                {link.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
