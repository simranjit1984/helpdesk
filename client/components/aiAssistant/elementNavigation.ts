export interface ElementTarget {
  id?: string;
  selector?: string;
  tabValue?: string;
}

export const scrollToElement = (target: ElementTarget, options?: { offset?: number }) => {
  const offset = options?.offset || 100;
  
  let element: HTMLElement | null = null;

  // Find element by ID
  if (target.id) {
    element = document.getElementById(target.id);
  }
  // Find element by selector
  else if (target.selector) {
    element = document.querySelector(target.selector);
  }

  if (!element) {
    console.warn("Element not found", target);
    return false;
  }

  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const scrollPosition = elementTop - offset;

  window.scrollTo({
    top: scrollPosition,
    behavior: "smooth",
  });

  // Highlight the element
  setTimeout(() => {
    highlightElement(element!);
  }, 500);

  return true;
};

export const highlightElement = (element: HTMLElement, duration: number = 5000) => {
  // Remove existing highlight if any
  const existingHighlight = document.querySelector("[data-highlight]");
  if (existingHighlight) {
    existingHighlight.removeAttribute("data-highlight");
  }

  // Add highlight
  element.setAttribute("data-highlight", "true");
  element.classList.add(
    "animate-pulse",
    "ring-2",
    "ring-ring",
    "ring-offset-2",
    "rounded"
  );

  // Auto-remove highlight
  setTimeout(() => {
    element.removeAttribute("data-highlight");
    element.classList.remove(
      "animate-pulse",
      "ring-2",
      "ring-ring",
      "ring-offset-2",
      "rounded"
    );
  }, duration);
};

export const navigateToTab = (tabValue: string) => {
  const tabTrigger = document.querySelector(
    `[role="tab"][value="${tabValue}"]`
  ) as HTMLElement;

  if (tabTrigger) {
    tabTrigger.click();
    
    // Wait for tab to render, then find and highlight the first actionable element
    setTimeout(() => {
      const targetElement = document.querySelector(
        `[role="tabpanel"][value="${tabValue}"] button, [role="tabpanel"][value="${tabValue}"] input`
      ) as HTMLElement;
      
      if (targetElement) {
        const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementTop - 100,
          behavior: "smooth",
        });
        highlightElement(targetElement);
      }
    }, 300);

    return true;
  }

  return false;
};

export const focusAndHighlight = (element: HTMLElement) => {
  element.focus();
  highlightElement(element);
};
