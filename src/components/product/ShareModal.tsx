'use client';

import React from 'react';
import { X, Facebook, Twitter, Linkedin, Mail, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productUrl: string;
  onShare: (platform: string) => void;
}

export function ShareModal({ isOpen, onClose, productTitle, productUrl, onShare }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    onShare('copy_link');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    onShare(platform);
    // In a real app, these would open share dialogs
    // For demo purposes, we just track the event
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="font-heading text-2xl font-bold text-gray-900">
            Share Product
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Share "{productTitle}" with your network
          </p>

          {/* Share Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                Share on Facebook
              </span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center space-x-3 p-4 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                <Twitter className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900 group-hover:text-sky-600">
                Share on Twitter
              </span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                <Linkedin className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900 group-hover:text-blue-700">
                Share on LinkedIn
              </span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900 group-hover:text-gray-700">
                Share via Email
              </span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or copy link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
              <Button
                variant={copied ? "success" : "primary"}
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
