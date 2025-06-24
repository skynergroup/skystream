// Single Page Application (SPA) redirect script for static hosting
// This script should be included in the main index.html to handle client-side routing

(function() {
  // Check if we're on a sub-path that should be handled by React Router
  var path = window.location.pathname;
  var search = window.location.search;
  var hash = window.location.hash;
  
  // List of paths that should be handled by the SPA
  var spaRoutes = [
    '/browse',
    '/search',
    '/library',
    '/movie',
    '/tv',
    '/anime',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];
  
  // Check if current path should be handled by SPA
  var isSpaRoute = spaRoutes.some(function(route) {
    return path.startsWith(route);
  });
  
  // If it's a SPA route and we're not already on the index page
  if (isSpaRoute && path !== '/') {
    // Store the intended path in sessionStorage
    sessionStorage.redirect = path + search + hash;
    
    // Redirect to the index page
    window.location.replace('/');
  }
})();
