'use client';

import { useEffect } from 'react';
import { MetaPixelEvents } from './MetaPixel';

interface ViewContentTrackerProps {
  contentName: string;
  contentCategory: string;
  value: number;
}

export default function ViewContentTracker({ contentName, contentCategory, value }: ViewContentTrackerProps) {
  useEffect(() => {
    MetaPixelEvents.viewContent({
      content_name: contentName,
      content_category: contentCategory,
      value: value,
    });
  }, [contentName, contentCategory, value]);

  return null;
}
