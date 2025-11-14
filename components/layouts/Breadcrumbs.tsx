'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { href, label };
  });

  // Add home breadcrumb
  const allBreadcrumbs = [{ href: '/', label: 'Home' }, ...breadcrumbs];

  if (allBreadcrumbs.length === 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      {allBreadcrumbs.map((crumb, index) => {
        const isLast = index === allBreadcrumbs.length - 1;
        
        return (
          <React.Fragment key={crumb.href}>
            {index > 0 && (
              <svg
                className="w-4 h-4 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {isLast ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href}>
                <motion.span
                  className={cn(
                    'text-white/60 hover:text-white transition-colors',
                    'cursor-pointer'
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {crumb.label}
                </motion.span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
