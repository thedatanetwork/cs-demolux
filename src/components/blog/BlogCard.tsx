import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/contentstack';
import { formatDate } from '@/lib/utils';
import { Calendar, User } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, className = '' }: BlogCardProps) {
  const featuredImage = Array.isArray(post.featured_image) 
    ? post.featured_image[0] 
    : post.featured_image;

  return (
    <article className={`card-hover group ${className}`}>
      {/* Featured Image */}
      {featuredImage && (
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <Image
            src={featuredImage.url}
            alt={featuredImage.title || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.publish_date}>
              {formatDate(post.publish_date)}
            </time>
          </div>
          
          {post.author && (
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={post.url.href} className="group">
          <h3 className="font-heading text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-2 mb-3">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.post_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Read More Link */}
        <Link
          href={post.url.href}
          className="inline-flex items-center text-gray-900 hover:text-gray-700 font-medium text-sm group transition-colors duration-200"
        >
          Read More
          <svg
            className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
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
        </Link>
      </div>
    </article>
  );
}
