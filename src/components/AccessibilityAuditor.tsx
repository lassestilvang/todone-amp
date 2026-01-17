import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { wcagAuditor, type AccessibilityIssue } from '@/utils/wcagAuditor';

interface AccessibilityAuditorProps {
  elementSelector?: string;
  autoRun?: boolean;
  onIssuesFound?: (issues: AccessibilityIssue[]) => void;
  showDetails?: boolean;
  className?: string;
}



const IssueIcon: React.FC<{ level: 'error' | 'warning' | 'info' }> = ({ level }) => {
  switch (level) {
    case 'error':
      return <XCircle className="w-5 h-5 text-semantic-error" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-semantic-warning" />;
    case 'info':
      return <Info className="w-5 h-5 text-icon-info" />;
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
          <p className="text-sm text-content-secondary mb-2">{issue.description}</p>

          {showDetails && (
            <>
              {issue.wcagCriteria && (
                <p className="text-xs text-content-secondary mb-2">
                  <strong>WCAG:</strong> {issue.wcagCriteria}
                </p>
              )}
              <p className="text-xs bg-surface-secondary p-2 rounded border-l-2 border-border">
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

  const runAudit = React.useCallback(() => {
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
  }, [elementSelector, onIssuesFound]);

  useEffect(() => {
    if (autoRun) {
      runAudit();
    }
  }, [autoRun, runAudit]);

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warningCount = issues.filter((i) => i.level === 'warning').length;
  const infoCount = issues.filter((i) => i.level === 'info').length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="bg-surface-primary rounded-lg border border-border p-4">
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
            <div className="text-2xl font-bold text-semantic-error">{errorCount}</div>
            <div className="text-sm text-semantic-error">Errors</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-semantic-warning">{warningCount}</div>
            <div className="text-sm text-semantic-warning">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-semantic-info">{infoCount}</div>
            <div className="text-sm text-semantic-info">Info</div>
          </div>
        </div>

        {issues.length === 0 && (
          <div className="flex items-center justify-center py-8 text-content-secondary">
            <CheckCircle className="w-6 h-6 mr-2 text-icon-success" />
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

export default AccessibilityAuditor;
