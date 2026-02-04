'use client';

import { useEffect } from 'react';

/**
 * Removes Pathfora's inline styles that conflict with our CSS.
 * Pathfora applies inline !important styles which cannot be overridden by CSS.
 * This component watches for Pathfora widgets and strips the problematic inline styles,
 * allowing our globals.css styles to take effect.
 */
export default function PathforaStyleFix() {
  useEffect(() => {
    // Function to strip inline styles from Pathfora elements
    const stripPathforaInlineStyles = () => {
      // Target all Pathfora widgets
      const widgets = document.querySelectorAll('.pf-widget');

      widgets.forEach((widget) => {
        // Elements that commonly have inline styles we want to remove
        const elementsToFix = [
          '.pf-widget-content',
          '.pf-widget-headline',
          '.pf-widget-message',
          '.pf-widget-body',
          '.pf-widget-close',
          '.pf-widget-ok',
          '.pf-widget-cancel',
          '.pf-widget-btn',
        ];

        elementsToFix.forEach((selector) => {
          const elements = widget.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              // Remove specific style properties that Pathfora sets
              el.style.removeProperty('background-color');
              el.style.removeProperty('color');
              el.style.removeProperty('background');
            }
          });
        });

        // Also check the widget itself
        if (widget instanceof HTMLElement) {
          widget.style.removeProperty('background-color');
          widget.style.removeProperty('color');
        }
      });
    };

    // Run immediately in case widgets are already present
    stripPathforaInlineStyles();

    // Set up a MutationObserver to catch widgets as they're added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if this is a Pathfora widget or contains one
            if (node.classList?.contains('pf-widget') || node.querySelector?.('.pf-widget')) {
              // Small delay to let Pathfora finish applying its styles
              setTimeout(stripPathforaInlineStyles, 50);
            }
          }
        });
      });
    });

    // Observe the body for new widgets
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also run periodically for the first few seconds to catch late-loading widgets
    const intervals = [100, 500, 1000, 2000];
    const timeouts = intervals.map((delay) =>
      setTimeout(stripPathforaInlineStyles, delay)
    );

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return null;
}
