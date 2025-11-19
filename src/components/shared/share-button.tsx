/**
 * ShareButton Component
 *
 * Reusable component for sharing payment page links to social media.
 * Follows SOLID principles:
 * - SRP: Single responsibility of handling social media sharing
 * - OCP: Open for extension (easy to add new platforms)
 * - ISP: Clean interface with minimal props
 * - DIP: Depends on abstractions (share URLs, not implementations)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Facebook, Linkedin, Mail, MessageCircle, Copy, Check } from 'lucide-react';

/**
 * X (formerly Twitter) Icon Component
 * Custom SVG icon for the X platform
 */
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

/**
 * Share platforms configuration
 * Following OCP: Easy to add new platforms without modifying core logic
 */
const sharePlatforms = [
  {
    name: 'Copy Link',
    icon: Copy,
    getUrl: (url: string) => url,
    action: 'copy',
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    action: 'open',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    action: 'open',
  },
  {
    name: 'X',
    icon: XIcon,
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    action: 'open',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    action: 'open',
  },
  {
    name: 'Email',
    icon: Mail,
    getUrl: (url: string, title: string, description?: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `${description ? description + '\n\n' : ''}${url}`
      )}`,
    action: 'open',
  },
];

export function ShareButton({
  url,
  title,
  description,
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: typeof sharePlatforms[0]) => {
    const shareUrl = platform.getUrl(url, title, description);

    if (platform.action === 'copy') {
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Open in new window
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4" />
          {showLabel && <span className="ml-2">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sharePlatforms.map((platform) => {
          const Icon = platform.icon;
          const isCopyButton = platform.action === 'copy';
          const showCheckIcon = isCopyButton && copied;

          return (
            <DropdownMenuItem
              key={platform.name}
              onClick={() => handleShare(platform)}
              className="cursor-pointer"
            >
              {showCheckIcon ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <Icon className="mr-2 h-4 w-4" />
              )}
              <span>{isCopyButton && copied ? 'Copied!' : platform.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
