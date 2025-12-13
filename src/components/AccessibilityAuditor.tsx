import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

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

interface AccessibilityAuditorProps {
  elementSelector?: string;
  autoRun?: boolean;
  onIssuesFound?: (issues: AccessibilityIssue[]) => void;
  showDetails?: boolean;
  className?: string;
}

const wcagAuditor = {
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

  // Check for color contrast (basic check)
  checkColorContrast: (container: HTMLElement): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    // Basic heuristic: flag very light text on light backgrounds
    const elementsWithStyle = Array.from(container.querySelectorAll('[style]'));
    let lowContrastCount = 0;

    elementsWithStyle.forEach((element) => {
      const style = window.getComputedStyle(element as HTMLElement);
      // This is a simplified check - real WCAG contrast checking is more complex
      const bgColor = style.backgroundColor;
      const color = style.color;

      // Check if both are light colors (very basic heuristic)
      if (bgColor === 'rgb(255, 255, 255)' && color === 'rgb(200, 200, 200)') {
        lowContrastCount++;
      }
    });

    if (lowContrastCount > 0) {
      issues.push({
        id: '1.4.3-contrast',
        level: 'warning',
        title: 'Low color contrast detected',
        description: `${lowContrastCount} element(s) may have insufficient color contrast`,
        wcagCriteria: '1.4.3 Contrast (Minimum)',
        suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)',
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

const IssueIcon: React.FC<{ level: 'error' | 'warning' | 'info' }> = ({ level }) => {
  switch (level) {
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
  }
};

const IssueCard: React.FC<{
  issue: AccessibilityIssue;
  showDetails: boolean;
}> = ({ issue, showDetails }) => {
  const bgClasses = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={cn('p-4 rounded-lg border', bgClasses[issue.level])}>
      <div className="flex items-start gap-3">
        <IssueIcon level={issue.level} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{issue.title}</h4>
          <p className="text-sm text-gray-700 mb-2">{issue.description}</p>

          {showDetails && (
            <>
              {issue.wcagCriteria && (
                <p className="text-xs text-gray-600 mb-2">
                  <strong>WCAG:</strong> {issue.wcagCriteria}
                </p>
              )}
              <p className="text-xs bg-white/50 p-2 rounded border-l-2 border-gray-300">
                <strong>Fix:</strong> {issue.suggestion}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const AccessibilityAuditor: React.FC<AccessibilityAuditorProps> = ({
  elementSelector,
  autoRun = true,
  onIssuesFound,
  showDetails = true,
  className,
}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAudit = () => {
    setIsRunning(true);
    try {
      const target = elementSelector
        ? document.querySelector(elementSelector)
        : document.body;

      if (target instanceof HTMLElement) {
        const foundIssues = wcagAuditor.auditElement(target);
        setIssues(foundIssues);
        onIssuesFound?.(foundIssues);
      }
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (autoRun) {
      runAudit();
    }
  }, [elementSelector, autoRun]);

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warningCount = issues.filter((i) => i.level === 'warning').length;
  const infoCount = issues.filter((i) => i.level === 'info').length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Accessibility Audit</h2>
          <button
            onClick={runAudit}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
            aria-label="Run accessibility audit"
          >
            {isRunning ? 'Running...' : 'Run Audit'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-700">Errors</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-yellow-700">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            <div className="text-sm text-blue-700">Info</div>
          </div>
        </div>

        {issues.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gray-600">
            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
            <span className="font-medium">No accessibility issues found!</span>
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <div className="space-y-3">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              showDetails={showDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { wcagAuditor };
export default AccessibilityAuditor;
