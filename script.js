/**
 * PROGETTO LENTO — Responsive 1366x768 Canvas Scaling & Navigation Drawer
 */
(function () {
  'use strict';

  /* 1. Responsive 1366x768 Slide Scaling */
  function updateSlideScale() {
    var firstWrapper = document.querySelector('.slide-wrapper');
    var width = firstWrapper ? firstWrapper.clientWidth : (document.documentElement.clientWidth || window.innerWidth);
    if (width > 0) {
      var scale = width / 1366;
      document.documentElement.style.setProperty('--slide-scale', scale.toFixed(6));
    }
  }

  updateSlideScale();

  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function () {
      updateSlideScale();
    });
    ro.observe(document.documentElement);
  }

  window.addEventListener('resize', updateSlideScale, { passive: true });
  window.addEventListener('orientationchange', updateSlideScale, { passive: true });

  /* 2. Top-Left Slide-In Navigation Drawer */
  var drawer = document.getElementById('drawer');
  var openBtn = document.getElementById('drawer-open');
  var closeBtn = document.getElementById('drawer-close');
  var mainEl = document.getElementById('site-main');

  if (!drawer || !openBtn) return;

  var scroller = drawer.querySelector('.Drawer-scroller');
  var sheet = drawer.querySelector('.Drawer-sheet');

  async function openDrawer() {
    drawer.showPopover();

    if (!window.CSS || !CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
      await new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });
    }

    scroller.scrollTo({ left: 0, behavior: 'auto' });
  }

  function closeDrawer() {
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  }

  function onDrawerOpened() {
    if (mainEl) mainEl.inert = true;
    openBtn.setAttribute('aria-expanded', 'true');
    sheet.focus();
  }

  function onDrawerClosed() {
    try {
      drawer.hidePopover();
    } catch (_) {}
    if (mainEl) mainEl.inert = false;
    openBtn.setAttribute('aria-expanded', 'false');
  }

  var visibleThreshold = 1 / (window.innerWidth || 1366);

  var observer = new IntersectionObserver(
    function (entries) {
      var entry = entries.at ? entries.at(-1) : entries[entries.length - 1];
      if (!entry) return;
      if (entry.intersectionRatio < visibleThreshold) onDrawerClosed();
      if (entry.intersectionRatio === 1) onDrawerOpened();
    },
    { root: drawer, threshold: [visibleThreshold, 1] }
  );
  observer.observe(sheet);

  if (!window.CSS || !CSS.supports('animation-timeline: scroll()')) {
    scroller.addEventListener('scroll', function () {
      var ratio = 1 - scroller.scrollLeft / (sheet.offsetWidth || 1);
      drawer.style.setProperty('--drawer-backdrop', Math.max(0, Math.min(1, ratio)));
    }, { passive: true });
  }

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  drawer.addEventListener('click', function (event) {
    if (!sheet.contains(event.target)) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  });
})();
