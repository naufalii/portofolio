import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSectionPagination - DOM-driven item pagination hook for desktop sections.
 * Implements Bagian 2 & 9 of Pagination Specification:
 * - Packs discrete items greedily into pages based on measured DOM heights
 * - Ensures no item is cut across page boundaries
 * - Recalculates on resize and when accordions toggle
 * - Preserves firstVisibleItemId across resize / viewport changes (Bagian 9.b)
 * - Mobile bypass (isDesktop = false): returns all items in a single list
 *
 * @param {Array} items - List of items with unique { id }
 * @param {boolean} isDesktop - Active desktop layout flag
 * @param {object} options - Config options: { reservedHeight, minItemHeight, sectionKey, customAvailableHeight }
 */
export function useSectionPagination(items = [], isDesktop = false, options = {}) {
  const {
    reservedHeight = 110, // Panel chrome (~36px) + padding (~20px) + pagination bar (~44px) + margin
    minItemHeight = 44,
    sectionKey = 'section',
    customAvailableHeight = null,
  } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState(() => (items && items.length > 0 ? [items] : [[]]));
  const containerRef = useRef(null);
  const itemHeightsRef = useRef({});
  const firstVisibleItemIdRef = useRef(items[0]?.id || null);

  // Reset to page 0 whenever sectionKey or items structure changes
  useEffect(() => {
    setCurrentPage(0);
    firstVisibleItemIdRef.current = items[0]?.id || null;
  }, [sectionKey]);

  /**
   * Calculates greedy item packing into pages.
   */
  const calculatePages = useCallback(() => {
    if (!isDesktop || !items || items.length === 0) {
      setPages([items || []]);
      setCurrentPage(0);
      return;
    }

    const containerEl = containerRef.current;
    let availableH = 200;

    if (customAvailableHeight && customAvailableHeight > 50) {
      availableH = customAvailableHeight;
    } else if (containerEl && typeof window !== 'undefined') {
      const rect = containerEl.getBoundingClientRect();
      // Available space from container top to bottom of window minus reserved margin/padding & pagination toolbar
      const windowRemainingH = window.innerHeight - rect.top;
      availableH = Math.max(100, windowRemainingH - reservedHeight);
    } else if (typeof window !== 'undefined') {
      availableH = Math.max(100, window.innerHeight - 380 - reservedHeight);
    }

    // Measure existing DOM items if rendered
    if (containerEl) {
      items.forEach((item) => {
        if (!item || !item.id) return;
        const el = containerEl.querySelector(`[data-page-item-id="${item.id}"]`);
        if (el && el.offsetHeight > 0) {
          itemHeightsRef.current[item.id] = el.offsetHeight;
        }
      });
    }

    const computedPages = [];
    let curPage = [];
    let curHeight = 0;

    items.forEach((item) => {
      const h = itemHeightsRef.current[item.id] || item.estimatedHeight || minItemHeight;

      if (curPage.length > 0 && curHeight + h > availableH) {
        computedPages.push(curPage);
        curPage = [item];
        curHeight = h;
      } else {
        curPage.push(item);
        curHeight += h;
      }
    });

    if (curPage.length > 0) {
      computedPages.push(curPage);
    }

    const finalPages = computedPages.length > 0 ? computedPages : [items];
    setPages(finalPages);

    // Maintain page index on resize by locating firstVisibleItemId (Bagian 9.b)
    if (firstVisibleItemIdRef.current) {
      const targetId = firstVisibleItemIdRef.current;
      const targetPageIndex = finalPages.findIndex((p) =>
        p.some((it) => it.id === targetId)
      );
      if (targetPageIndex !== -1) {
        setCurrentPage(targetPageIndex);
      } else if (currentPage >= finalPages.length) {
        setCurrentPage(Math.max(0, finalPages.length - 1));
      }
    } else if (currentPage >= finalPages.length) {
      setCurrentPage(Math.max(0, finalPages.length - 1));
    }
  }, [isDesktop, items, reservedHeight, minItemHeight, customAvailableHeight, currentPage]);

  // Recompute on mount, resize, and orientationchange
  useEffect(() => {
    calculatePages();

    const handleResize = () => {
      calculatePages();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [calculatePages]);

  // Page navigation helpers
  const goToPage = useCallback(
    (pageIndex) => {
      if (pageIndex < 0 || pageIndex >= pages.length) return;
      setCurrentPage(pageIndex);
      firstVisibleItemIdRef.current = pages[pageIndex]?.[0]?.id || null;
    },
    [pages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Current items for active page
  const currentItems = isDesktop
    ? pages[currentPage] || items
    : items;

  return {
    containerRef,
    currentPage,
    totalPages: isDesktop ? Math.max(1, pages.length) : 1,
    currentItems,
    pages,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage: currentPage === 0,
    isLastPage: currentPage >= Math.max(0, pages.length - 1),
    recomputePages: calculatePages,
  };
}

export default useSectionPagination;
