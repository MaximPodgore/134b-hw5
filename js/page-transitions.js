/**
 * View Transition API Integration (SPA-style approach)
 * Creates smooth transitions by dynamically loading page content
 * Uses the View Transition API for same-document transitions
 */

(function() {
  'use strict';

  // Check if View Transition API is supported
  const supportsViewTransitions = 'startViewTransition' in document;

  /**
   * Initialize page transitions
   */
  function initPageTransitions() {
    if (!supportsViewTransitions) {
      console.log('View Transition API not supported in this browser');
      return;
    }

    // Intercept navigation clicks for same-origin links
    document.addEventListener('click', handleNavigationClick);
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
    
    // Add visual indicator that transitions are active
    document.documentElement.classList.add('view-transitions-enabled');
  }

  /**
   * Handle clicks on navigation links
   */
  function handleNavigationClick(event) {
    // Only handle left clicks (not middle/right click or ctrl+click)
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Find the closest anchor tag
    const link = event.target.closest('a');
    
    // Validate the link
    if (!link || !link.href) return;
    
    // Check if it's a same-origin navigation
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    
    // Don't intercept if it opens in a new tab/window
    if (link.target === '_blank' || link.getAttribute('rel')?.includes('external')) {
      return;
    }

    // Don't intercept hash-only links on the same page
    if (url.pathname === location.pathname && url.hash) {
      return;
    }

    // Prevent default navigation
    event.preventDefault();

    // Perform transition
    transitionToPage(url.href, true);
  }

  /**
   * Handle browser back/forward navigation
   */
  function handlePopState(event) {
    if (event.state && event.state.url) {
      transitionToPage(event.state.url, false);
    }
  }

  /**
   * Navigate to a new page with a view transition
   */
  async function transitionToPage(url, pushState = true) {
    try {
      // Fetch the new page
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Extract main content and title
      const newMain = newDoc.querySelector('main');
      const newTitle = newDoc.querySelector('title')?.textContent || document.title;
      
      if (!newMain) {
        throw new Error('No main element found in new page');
      }

      // Update URL in browser history
      if (pushState) {
        window.history.pushState({ url }, '', url);
      }

      // Perform the view transition
      if (supportsViewTransitions) {
        const transition = document.startViewTransition(() => {
          updatePageContent(newMain, newTitle);
        });
        
        await transition.finished;
      } else {
        updatePageContent(newMain, newTitle);
      }

    } catch (error) {
      console.error('Transition failed, falling back to normal navigation:', error);
      // Fallback to normal navigation if anything goes wrong
      window.location.href = url;
    }
  }

  /**
   * Update the page content
   */
  function updatePageContent(newMain, newTitle) {
    // Update the main content
    const currentMain = document.querySelector('main');
    if (currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
    }
    
    // Update page title
    document.title = newTitle;
    
    // Update active navigation state
    updateActiveNavigation();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Update active navigation indicators
   */
  function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Remove all aria-current attributes
    document.querySelectorAll('[aria-current="page"]').forEach(el => {
      el.removeAttribute('aria-current');
    });
    
    // Add aria-current to matching links
    document.querySelectorAll('.site-nav a').forEach(link => {
      const linkPath = new URL(link.href).pathname.split('/').pop();
      if (linkPath === currentPage || 
          (currentPage === '' && linkPath === 'index.html') ||
          (currentPage === 'index.html' && linkPath === '')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTransitions);
  } else {
    initPageTransitions();
  }

  // Store initial state
  if (supportsViewTransitions) {
    window.history.replaceState({ url: window.location.href }, '', window.location.href);
  }

})();
