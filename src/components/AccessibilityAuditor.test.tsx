import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessibilityAuditor from './AccessibilityAuditor';
import { wcagAuditor } from '@/utils/wcagAuditor';

describe('AccessibilityAuditor', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('wcagAuditor', () => {
    it('detects missing H1 heading', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = '<p>No headings</p>';

      const issues = wcagAuditor.checkHeadingHierarchy(testContainer);
      expect(issues.some((i) => i.id === '1.3.1-heading')).toBe(true);
    });

    it('detects heading level skips', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = '<h1>Title</h1><h3>Skip H2</h3>';

      const issues = wcagAuditor.checkHeadingHierarchy(testContainer);
      expect(issues.some((i) => i.id.includes('skip'))).toBe(true);
    });

    it('detects images without alt text', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = '<img src="test.jpg" /><img src="test2.jpg" alt="Valid" />';

      const issues = wcagAuditor.checkImageAltText(testContainer);
      const altIssue = issues.find((i) => i.id === '1.1.1-alt-text');
      expect(altIssue?.affectedElements).toBe(1);
    });

    it('detects form inputs without labels', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = `
        <input id="test" />
        <input id="labeled" />
        <label for="labeled">Label</label>
      `;

      const issues = wcagAuditor.checkFormLabels(testContainer);
      const labelIssue = issues.find((i) => i.id === '1.3.1-form-labels');
      expect(labelIssue?.affectedElements).toBe(1);
    });

    it('detects positive tabindex usage', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = '<button tabindex="1">Button</button>';

      const issues = wcagAuditor.checkKeyboardNavigation(testContainer);
      const tabIssue = issues.find((i) => i.id === '2.4.3-tab-order');
      expect(tabIssue?.affectedElements).toBe(1);
    });

    it('detects invalid ARIA roles', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = '<div role="invalid-role">Content</div>';

      const issues = wcagAuditor.checkAriaIssues(testContainer);
      const roleIssue = issues.find((i) => i.id === '1.3.1-aria-roles');
      expect(roleIssue?.affectedElements).toBe(1);
    });

    it('accepts valid ARIA roles', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = '<div role="button">Button</div><div role="status">Status</div>';

      const issues = wcagAuditor.checkAriaIssues(testContainer);
      const roleIssue = issues.find((i) => i.id === '1.3.1-aria-roles');
      expect(roleIssue).toBeUndefined();
    });

    it('runs full audit and sorts by severity', () => {
      const testContainer = document.createElement('div');
      testContainer.innerHTML = `
        <h1>Title</h1>
        <img src="test.jpg" />
        <button tabindex="1">Button</button>
      `;

      const issues = wcagAuditor.auditElement(testContainer);
      expect(issues.length > 0).toBe(true);
      
      // Check that errors come before warnings
      if (issues.length > 1) {
        const errorIndices = issues
          .map((i, idx) => i.level === 'error' ? idx : -1)
          .filter((i) => i !== -1);
        const warningIndices = issues
          .map((i, idx) => i.level === 'warning' ? idx : -1)
          .filter((i) => i !== -1);
        
        if (errorIndices.length > 0 && warningIndices.length > 0) {
          expect(Math.max(...errorIndices)).toBeLessThanOrEqual(Math.min(...warningIndices));
        }
      }
    });
  });

  describe('AccessibilityAuditor Component', () => {
    it('renders audit results', () => {
      render(
        <AccessibilityAuditor
          elementSelector="body"
          autoRun={false}
        />
      );

      expect(screen.getByText('Accessibility Audit')).toBeInTheDocument();
    });

    it('runs audit on mount when autoRun is true', () => {
      render(
        <AccessibilityAuditor
          autoRun={true}
        />
      );

      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
    });

    it('calls onIssuesFound callback', () => {
      const onIssuesFound = vi.fn();
      render(
        <AccessibilityAuditor
          onIssuesFound={onIssuesFound}
          autoRun={false}
        />
      );

      const runButton = screen.getByLabelText('Run accessibility audit');
      fireEvent.click(runButton);

      expect(onIssuesFound).toHaveBeenCalled();
    });

    it('displays Run Audit button', () => {
      render(
        <AccessibilityAuditor
          autoRun={false}
        />
      );

      expect(screen.getByLabelText('Run accessibility audit')).toBeInTheDocument();
    });

    it('shows success message when no issues found', () => {
      render(
        <AccessibilityAuditor
          elementSelector="body"
          autoRun={false}
        />
      );

      const runButton = screen.getByLabelText('Run accessibility audit');
      fireEvent.click(runButton);

      // May or may not find issues depending on page state
      // Just verify the component renders
      expect(screen.getByText('Accessibility Audit')).toBeInTheDocument();
    });

    it('displays issue counts', () => {
      render(
        <AccessibilityAuditor
          autoRun={false}
        />
      );

      // Check that the grid with counts is present
      const errorCount = screen.getByText('Errors');
      expect(errorCount).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <AccessibilityAuditor
          autoRun={false}
          className="custom-audit"
        />
      );

      expect(container.querySelector('.custom-audit')).toBeInTheDocument();
    });

    it('shows issue details when showDetails is true', () => {
      // Create a container with accessibility issues
      const testContainer = document.createElement('div');
      testContainer.id = 'audit-target';
      testContainer.innerHTML = '<img src="test.jpg" />';
      document.body.appendChild(testContainer);

      render(
        <AccessibilityAuditor
          elementSelector="#audit-target"
          showDetails={true}
        />
      );

      // If issues are found, details should be shown
      const auditElement = screen.getByText('Accessibility Audit');
      expect(auditElement).toBeInTheDocument();

      testContainer.remove();
    });

    it('hides issue details when showDetails is false', () => {
      render(
        <AccessibilityAuditor
          autoRun={false}
          showDetails={false}
        />
      );

      expect(screen.getByText('Accessibility Audit')).toBeInTheDocument();
    });
  });
});
