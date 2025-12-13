export interface AccessibilityIssue {
  id: string;
  level: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  wcagCriteria?: string;
  suggestion: string;
  elementSelector?: string;
  affectedElements?: number;
}

export const wcagAuditor = {
  // Check for proper heading hierarchy
  checkHeadingHierarchy: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    if (headings.length === 0) {
      issues.push({
        id: '1.3.1-heading',
        level: 'warning',
        title: 'No page headings found',
        description: 'Pages should have at least one H1 heading for structure',
        wcagCriteria: '1.3.1 Info and Relationships',
        suggestion: 'Add a main H1 heading describing the page purpose',
        affectedElements: 0,
      });
    } else {
      let previousLevel = 1;
      headings.forEach((heading, index) => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (index > 0 && currentLevel - previousLevel > 1) {
          issues.push({
            id: `1.3.1-skip-${index}`,
            level: 'warning',
            title: 'Heading level skip detected',
            description: `Heading jumps from H${previousLevel} to H${currentLevel}`,
            wcagCriteria: '1.3.1 Info and Relationships',
            suggestion: 'Maintain sequential heading levels for proper document structure',
            elementSelector: heading.tagName,
          });
        }
        previousLevel = currentLevel;
      });
    }

    return issues;
  },

  // Check for images without alt text
  checkImageAltText: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const images = Array.from(container.querySelectorAll('img'));

    const imagesWithoutAlt = images.filter(
      (img) => !img.getAttribute('alt') || img.getAttribute('alt')?.trim() === ''
    );

    if (imagesWithoutAlt.length > 0) {
      issues.push({
        id: '1.1.1-alt-text',
        level: 'error',
        title: 'Images missing alt text',
        description: `${imagesWithoutAlt.length} image(s) found without alternative text`,
        wcagCriteria: '1.1.1 Non-text Content',
        suggestion: 'Provide descriptive alt text for all images',
        affectedElements: imagesWithoutAlt.length,
      });
    }

    return issues;
  },

  // Check for form labels
  checkFormLabels: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const inputs = Array.from(container.querySelectorAll('input, textarea, select'));

    const inputsWithoutLabels = inputs.filter((input) => {
      const inputId = input.getAttribute('id');
      if (!inputId) return true;

      const label = container.querySelector(`label[for="${inputId}"]`);
      const ariaLabel = input.getAttribute('aria-label');

      return !label && !ariaLabel;
    });

    if (inputsWithoutLabels.length > 0) {
      issues.push({
        id: '1.3.1-form-labels',
        level: 'error',
        title: 'Form inputs without labels',
        description: `${inputsWithoutLabels.length} form input(s) found without associated labels`,
        wcagCriteria: '1.3.1 Info and Relationships',
        suggestion: 'Associate labels with all form inputs using <label> or aria-label',
        affectedElements: inputsWithoutLabels.length,
      });
    }

    return issues;
  },

  // Check for color contrast using WCAG relative luminance formula
  checkColorContrast: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    // Calculate relative luminance per WCAG 2.0
    const getRelativeLuminance = (rgb: string): number => {
      const match = rgb.match(/\d+/g);
      if (!match || match.length < 3) return 0;

      const [r, g, b] = match.map((val) => {
        const v = parseInt(val) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    // Calculate contrast ratio per WCAG 2.0
    const getContrastRatio = (color1: string, color2: string): number => {
      const l1 = getRelativeLuminance(color1);
      const l2 = getRelativeLuminance(color2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const elementsWithStyle = Array.from(container.querySelectorAll('[style]'));
    let lowContrastCount = 0;

    elementsWithStyle.forEach((element) => {
      const style = window.getComputedStyle(element as HTMLElement);
      const bgColor = style.backgroundColor;
      const color = style.color;

      // Skip if colors are transparent or not properly set
      if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || !color || color === 'rgba(0, 0, 0, 0)') {
        return;
      }

      const ratio = getContrastRatio(bgColor, color);
      // WCAG AA requires 4.5:1 for normal text
      if (ratio < 4.5) {
        lowContrastCount++;
      }
    });

    if (lowContrastCount > 0) {
      issues.push({
        id: '1.4.3-contrast',
        level: 'warning',
        title: 'Low color contrast detected',
        description: `${lowContrastCount} element(s) have insufficient color contrast`,
        wcagCriteria: '1.4.3 Contrast (Minimum)',
        suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
        affectedElements: lowContrastCount,
      });
    }

    return issues;
  },

  // Check for keyboard navigation
  checkKeyboardNavigation: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    const focusableElements = Array.from(
      container.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    );

    const elementsWithPositiveTabindex = focusableElements.filter((el) => {
      const tabindex = (el as HTMLElement).getAttribute('tabindex');
      return tabindex && parseInt(tabindex) > 0;
    });

    if (elementsWithPositiveTabindex.length > 0) {
      issues.push({
        id: '2.4.3-tab-order',
        level: 'warning',
        title: 'Positive tabindex values found',
        description: `${elementsWithPositiveTabindex.length} element(s) use positive tabindex`,
        wcagCriteria: '2.4.3 Focus Order',
        suggestion: 'Avoid using positive tabindex values; rely on source order instead',
        affectedElements: elementsWithPositiveTabindex.length,
      });
    }

    if (focusableElements.length === 0) {
      issues.push({
        id: '2.1.1-keyboard-access',
        level: 'info',
        title: 'No keyboard-accessible elements found',
        description: 'Page contains no focusable interactive elements',
        wcagCriteria: '2.1.1 Keyboard',
        suggestion: 'Add interactive elements (buttons, links, inputs) or use tabindex',
      });
    }

    return issues;
  },

  // Check for ARIA issues
  checkAriaIssues: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    // Check for invalid ARIA roles
    const elementsWithRole = Array.from(container.querySelectorAll('[role]'));
    const validRoles = new Set([
      'application', 'banner', 'complementary', 'contentinfo', 'definition',
      'dialog', 'document', 'feed', 'figure', 'form', 'group', 'heading',
      'img', 'list', 'listitem', 'main', 'navigation', 'none', 'note',
      'presentation', 'region', 'search', 'status', 'tab', 'tablist',
      'tabpanel', 'term', 'tooltip', 'button', 'checkbox', 'link',
      'menuitem', 'option', 'radio', 'menuitemcheckbox', 'menuitemradio'
    ]);

    const elementsWithInvalidRole = elementsWithRole.filter((el) => {
      const role = (el as HTMLElement).getAttribute('role');
      return role && !validRoles.has(role);
    });

    if (elementsWithInvalidRole.length > 0) {
      issues.push({
        id: '1.3.1-aria-roles',
        level: 'error',
        title: 'Invalid ARIA roles found',
        description: `${elementsWithInvalidRole.length} element(s) have invalid ARIA roles`,
        wcagCriteria: '1.3.1 Info and Relationships',
        suggestion: 'Use only valid ARIA role values',
        affectedElements: elementsWithInvalidRole.length,
      });
    }

    return issues;
  },

  // Run all checks
  auditElement: (container: HTMLElement): AccessibilityIssue[] => {
    const allIssues = [
      ...wcagAuditor.checkHeadingHierarchy(container),
      ...wcagAuditor.checkImageAltText(container),
      ...wcagAuditor.checkFormLabels(container),
      ...wcagAuditor.checkColorContrast(container),
      ...wcagAuditor.checkKeyboardNavigation(container),
      ...wcagAuditor.checkAriaIssues(container),
    ];

    // Remove duplicates
    const uniqueIssues = Array.from(
      new Map(allIssues.map((issue) => [issue.id, issue])).values()
    );

    return uniqueIssues.sort((a, b) => {
      const levelOrder = { error: 0, warning: 1, info: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    });
  },
};
