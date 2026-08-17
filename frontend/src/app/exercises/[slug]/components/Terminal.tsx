'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, ChevronUp, Play } from 'lucide-react';

export interface TestCase {
  id: number;
  description: string;
  codeRun: string;
  expected: any;
  passed?: boolean;
}

interface TerminalProps {
  testCases: TestCase[];
  showTestPanel: boolean;
  onTogglePanel: (show: boolean) => void;
  userCode: string;
  signature?: any;
  onTestResults?: (results: { [key: number]: any }, testCases: TestCase[]) => void;
}

const TestScenario = forwardRef<
  { runTests: () => Promise<boolean> },
  TerminalProps
>(({
  testCases,
  showTestPanel,
  onTogglePanel,
  userCode,
  signature,
  onTestResults,
}: TerminalProps, ref) => {
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [testPanelHeight, setTestPanelHeight] = useState(250);
  const [testResults, setTestResults] = useState<{ [key: number]: any }>({});
  const [isRunning, setIsRunning] = useState(false);
  const testPanelRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    isResizing.current = true;
    setIsDragging(true);
  };

  // Expose runTests method to parent component via ref
  useImperativeHandle(ref, () => ({
    runTests: async () => {
      // Run tests and return whether all tests passed
      return await handleRunTest();
    },
  }));

  // Function to validate return type based on signature
  const validateReturnType = (result: any, returnTypeSpec: any[]): string | null => {
    if (!returnTypeSpec || returnTypeSpec.length === 0) return null;

    const expectedType = returnTypeSpec[0];

    // Validate array type
    if (expectedType.type === 'array') {
      if (!Array.isArray(result)) {
        return `Type Error: Expected return type 'array' but got '${typeof result}'`;
      }

      // Validate array item types
      if (expectedType.items) {
        const itemType = expectedType.items.type;
        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          if (typeof item !== itemType) {
            return `Type Error: Array item at index ${i} has type '${typeof item}' but expected '${itemType}'`;
          }
        }
      }
      return null;
    }

    // Validate primitive types
    if (typeof result !== expectedType.type) {
      return `Type Error: Expected return type '${expectedType.type}' but got '${typeof result}'`;
    }

    return null;
  };

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      const results: { [key: number]: any } = {};
      
      // Run all test cases
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        if (!testCase.codeRun) {
          results[i] = `Error: No code expression to run`;
          continue;
        }

        const result = await runCode(
          userCode,
          testCase.codeRun
        );
        results[i] = JSON.stringify(result);
      }
      
      console.log('All test results:', results);
      setTestResults(results);
      if (onTestResults) {
        onTestResults(results, testCases);
      }

      // Check if all tests passed
      let allPassed = false;
      if (testCases && testCases.length > 0) {
        allPassed = testCases.every((testCase, index) => {
          const hasResult = results[index] !== undefined;
          const expectedStr = typeof testCase.expected === 'string' 
            ? testCase.expected 
            : JSON.stringify(testCase.expected);
          const isTypeError = typeof results[index] === 'string' && results[index].startsWith('Type Error:');
          return hasResult && !isTypeError && results[index] === expectedStr;
        });
      }

      // Return whether all tests passed
      return allPassed;
    } catch (error) {
      console.error('Error running tests:', error);
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  // Function to run user code and capture output
  const runCode = async (userCode: string, testExpression: string) => {
    try {
      const wrapped = `
        return (async () => {
          ${userCode}
          return ${testExpression};
        })();
      `;

      const result = await new Function(wrapped)();

      // Validate return type if signature is available
      if (signature?.return_type) {
        const typeError = validateReturnType(result, signature.return_type);
        if (typeError) {
          return typeError;
        }
      }

      return result;
    } catch (error) {
      return `Error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !testPanelRef.current) return;

      const testPanel = testPanelRef.current;
      const containerParent = testPanel.parentElement;

      if (!containerParent) return;

      const containerRect = containerParent.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      const minHeight = window.innerHeight * 0.2;
      const maxHeight = window.innerHeight * 0.75;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setTestPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!showTestPanel) {
    return (
      <button
        onClick={() => onTogglePanel(true)}
        className="h-8 w-8 exercise-terminal-show-test-panel-button rounded-lg flex items-center justify-center transition-colors self-center"
        title="Show test panel"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-1 exercise-terminal-resize-handle cursor-row-resize transition-colors shrink-0 ${
          isDragging ? 'exercise-terminal-resize-handle-active' : ''
        }`} 
        title="Drag to resize panel"
      />
      <div
        ref={testPanelRef}
        className="exercise-terminal-test-panel rounded-lg flex flex-col overflow-hidden"
        style={{ height: `${testPanelHeight}px`, userSelect: isDragging ? 'none' : 'auto' }}
      >
        {/* Test Panel Header */}
        <div className="exercise-terminal-panel-header  px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold ">TEST SCENARIOS:</h2>
            {/* Test Cases Square Buttons */}
            <div className="flex gap-1">
              {testCases.map((testCase, index) => {
                const hasResult = testResults[index] !== undefined;
                const expectedStr = typeof testCase.expected === 'string' 
                  ? testCase.expected 
                  : JSON.stringify(testCase.expected);
                const isTypeError = typeof testResults[index] === 'string' && testResults[index].startsWith('Type Error:');
                const passed = hasResult && !isTypeError && testResults[index] === expectedStr;
                
                return (
                  
                  <button
                    key={testCase.id}
                    onClick={() => setSelectedTestCase(index)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-medium transition-colors ${
                      selectedTestCase === index
                        ? passed ? 'exercise-terminal-test-case-passed-active' : 'exercise-terminal-test-case-failed-active'
                        : hasResult
                        ? passed ? 
                        'exercise-terminal-test-case-passed' : 'exercise-terminal-test-case-failed'
                        : 'exercise-terminal-test-case-default'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="exercise-terminal-run-tests-button font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
              onClick={handleRunTest}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 exercise-terminal-run-test-spinner  rounded-full animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Test
                </>
              )}
            </button>
            <button
              onClick={() => onTogglePanel(false)}
              className="p-1 hover:bg-zinc-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Test Case Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          

          {testCases[selectedTestCase] && (
            <>
              {/* Scenario Description */}
              <div>
                <p className="text-xs uppercase tracking-wider exercise-terminal-scenario-description mb-2">
                  Scenario: {testCases[selectedTestCase].description}
                </p>
              </div>

              {/* Code Run */}
              <div>
                <p className="text-xs uppercase tracking-wider exercise-terminal-code-run-header mb-2">
                  Code Run
                </p>
                <div className="exercise-terminal-code-run rounded p-3 font-mono text-sm ">
                  {testCases[selectedTestCase].codeRun}
                </div>
              </div>

              {/* Expected Output */}
              <div>
                <p className="text-xs uppercase tracking-wider exercise-terminal-expected-output-header mb-2">
                  Expected 
                </p>
                <div className="exercise-terminal-expected-output rounded p-3 font-mono text-sm wrap-break-word">
                  {typeof testCases[selectedTestCase].expected === 'string' 
                    ? testCases[selectedTestCase].expected 
                    : JSON.stringify(testCases[selectedTestCase].expected)}
                </div>
              </div>

              {/* Output */}
              <div>
                <p className="text-xs uppercase tracking-wider exercise-terminal-output-header mb-2">
                  Output
                </p>
                <div className="exercise-terminal-output rounded p-3 font-mono text-sm  wrap-break-word whitespace-pre-wrap">
                  {testResults[selectedTestCase] !== undefined ? (() => {
                    const output = testResults[selectedTestCase];
                    const isTypeError = typeof output === 'string' && output.startsWith('Type Error:');
                    const expectedStr = typeof testCases[selectedTestCase].expected === 'string' 
                      ? testCases[selectedTestCase].expected 
                      : JSON.stringify(testCases[selectedTestCase].expected);
                    const isMatch = !isTypeError && output === expectedStr;
                    return (
                      <span className={isTypeError ? 'exercise-terminal-output-mismatch' : isMatch ? 'exercise-terminal-output-match' : 'exercise-terminal-output-mismatch'}>
                        {String(output)}
                      </span>
                    );
                  })() : (
                    '—'
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
});

export default TestScenario;
