/**
 * QRCodeModal Component
 *
 * Displays a QR code for payment page URLs with download and share functionality.
 * Follows SOLID principles:
 * - SRP: Single responsibility of displaying and managing QR codes
 * - OCP: Can be extended with different QR code styles/formats
 * - ISP: Clean interface with focused props
 */

'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

export interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
}

export function QRCodeModal({
  open,
  onOpenChange,
  url,
  title,
  description,
}: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  /**
   * Download QR code as PNG image
   * Following SRP: Isolated download logic
   */
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Create canvas from SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url_img = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Set canvas size with padding
      const padding = 40;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      ctx.drawImage(img, padding, padding);

      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
        link.click();
        URL.revokeObjectURL(url);
      });

      URL.revokeObjectURL(url_img);
    };

    img.src = url_img;
  };

  /**
   * Share QR code as image or URL
   * Uses Web Share API if available, with proper fallback handling
   */
  const handleShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        // First try sharing with image file
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        // Create canvas from SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url_img = URL.createObjectURL(svgBlob);

        img.onload = async () => {
          const padding = 40;
          canvas.width = img.width + padding * 2;
          canvas.height = img.height + padding * 2;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, padding, padding);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              URL.revokeObjectURL(url_img);
              return;
            }

            try {
              const file = new File([blob], `${title.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`, {
                type: 'image/png',
              });

              const shareData = {
                title: title,
                text: description || `Scan this QR code to access ${title}`,
                files: [file],
              };

              // Check if sharing files is supported
              if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
              } else {
                // If file sharing not supported, try sharing URL only
                await navigator.share({
                  title: title,
                  text: `${description || `Scan this QR code to access ${title}`}\n\n${url}`,
                  url: url,
                });
              }
            } catch (error) {
              // User cancelled or error occurred
              if ((error as Error).name !== 'AbortError') {
                console.error('Share failed:', error);
                // Fallback: download
                handleDownload();
              }
            }

            URL.revokeObjectURL(url_img);
          }, 'image/png');
        };

        img.onerror = () => {
          URL.revokeObjectURL(url_img);
          // Fallback: just share the URL
          navigator.share({
            title: title,
            text: `${description || `Scan this QR code to access ${title}`}\n\n${url}`,
            url: url,
          }).catch(() => handleDownload());
        };

        img.src = url_img;
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback: download
        handleDownload();
      }
    } else {
      // Web Share API not available, fallback to download
      handleDownload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {title}</DialogTitle>
          <DialogDescription>
            {description || 'Scan this QR code to access the payment page'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <div
            ref={qrRef}
            className="flex justify-center items-center bg-white p-6 rounded-lg border-2 border-gray-200"
          >
            <QRCodeSVG
              value={url}
              size={256}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* URL Display */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-mono text-gray-600 break-all">{url}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share QR
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            QR code generated with high error correction level
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
