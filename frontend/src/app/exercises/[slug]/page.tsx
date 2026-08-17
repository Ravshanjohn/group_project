'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { exercises_store } from '@/src/stores/exercises.store';
import ResetConfirmationModal from '@/src/app/exercises/[slug]/components/ResetConfirmationModal';
import { X, ChevronRight, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import ResizableSidebar from './components/ResizableSidebar';
import TestScenario, { TestCase } from './components/Terminal';
import { user_exercise_store } from '@/src/stores/user.exercise.store';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useUIStore } from '@/src/stores/ui.store';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

interface Exercise {
  id: number;
  name: string;
  slug: string;
  difficulty?: string;
  description?: string;
  instructions?: string;
  icon?: string;
  media_url?: string;
  estimated_time?: number;
  estimated_time_unit?: string;
  title?: string;
  [key: string]: any;
}

const ExercisePage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const [code, setCode] = useState<string>('// Start coding here...');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [showTestPanel, setShowTestPanel] = useState(true);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<number>(1);
  const [languages, setLanguages] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: number]: any }>({});
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [lastTestedCode, setLastTestedCode] = useState<string>('');
  const testScenarioRef = useRef<{ runTests: () => Promise<boolean> }>(null);
  const { getExerciseBySlug, getTestCase, getExerciseSignature, getInitialCode, getExerciseLanguages, handleExerciseEvent  } = exercises_store();
  const { saveUserCode,  getUserCode,  setUserExerciseCompleted } = user_exercise_store();

  const hasCodeChanges = allTestsPassed && code !== lastTestedCode;

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    // Track code changes in history
    setCodeHistory(prev => [...prev, newCode]);
  };

  const handleSaveCode = async () => {
    try {
      await saveUserCode(slug, code, selectedLanguage);
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  const handleCompleteExercise = async () => {
    try {
      // Run tests once more to verify code hasn't changed and works for all scenarios
      let allTestsPassed = false;
      if (testScenarioRef.current) {
        allTestsPassed = await testScenarioRef.current.runTests();
      }
      
      // Only mark exercise as completed if all tests passed
      if (allTestsPassed) {
        await setUserExerciseCompleted(slug);
        // Also record the completion event
        await saveUserCode(slug, code, selectedLanguage);
        await handleExerciseEvent(slug, selectedLanguage, 'completed', code);
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
    }
  };

  const handleTestResults = (results: { [key: number]: any }, testCasesData: any[]) => {
    setTestResults(results);
    
    // Check if all tests have passed
    if (testCasesData && testCasesData.length > 0) {
      const allPassed = testCasesData.every((testCase, index) => {
        const hasResult = results[index] !== undefined;
        const expectedStr = typeof testCase.expected === 'string' 
          ? testCase.expected 
          : JSON.stringify(testCase.expected);
        const isTypeError = typeof results[index] === 'string' && results[index].startsWith('Type Error:');
        return hasResult && !isTypeError && results[index] === expectedStr;
      });
      setAllTestsPassed(allPassed);
      
      // Save the current code as the last tested code if all tests passed
      if (allPassed) {
        setLastTestedCode(code);
      }
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const languageId = parseInt(e.target.value);
    setSelectedLanguage(languageId);
    
    try {
      // Fetch user code for the selected language
      await getUserCode(slug, languageId);
      const userCodeData = exercises_store.getState().exercise?.user_code;
      if (userCodeData) {
        setCode(userCodeData);
        setCodeHistory([userCodeData]);
      }
    } catch (error) {
      console.error('Error fetching code for language:', error);
    }
  };

  const handleReset = () => {
    // Show confirmation modal
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    try {
      // Record reset event only after user confirms
      await handleExerciseEvent(slug, selectedLanguage, 'restart', code);
      
      await getInitialCode(slug, selectedLanguage);
      const initialCodeData = exercises_store.getState().exercise?.initial_code;
      if (initialCodeData) {
        // Save the reset code to database
        await saveUserCode(slug, initialCodeData, selectedLanguage);
        setCode(initialCodeData);
        setCodeHistory([initialCodeData]);
      }
    } catch (error) {
      console.error('Error resetting to initial code:', error);
    } finally {
      setShowResetModal(false);
    }
  };

  const cancelReset = () => {
    setShowResetModal(false);
  };

  // Keyboard shortcut listener for Ctrl+S and Ctrl+R
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveCode();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleReset();
      }
      console.log(exercise)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slug, code, selectedLanguage]);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        await getExerciseBySlug(slug);
        const exerciseState = exercises_store.getState();
        const exerciseData = exerciseState.exercise.data;
        console.log('Exercise data:', exerciseData);
        setExercise(exerciseData);
        
        // Fetch user code (or initial code if user hasn't saved any)
        try {
          await getUserCode(slug, selectedLanguage);
          const userCodeData = exercises_store.getState().exercise?.user_code;
          if (userCodeData) {
            setCode(userCodeData);
            setCodeHistory([userCodeData]);
            saveUserCode(slug, userCodeData, selectedLanguage); // Save initial code to history
          }
        } catch (error) {
          console.error('Error fetching user code:', error);
        }

        // Fetch exercise signature to show required function signature
        try {
          await getExerciseSignature(slug);
        } catch (error) {
          console.error('Error fetching exercise signature:', error);
        }

        // Fetch available languages for this exercise
        try {
          await getExerciseLanguages(slug);
          const languagesData = exercises_store.getState().exercise?.languages;
          if (languagesData && Array.isArray(languagesData)) {
            setLanguages(languagesData);
            // Set the first language as default if available
            if (languagesData.length > 0) {
              setSelectedLanguage(languagesData[0].id);
            }
          }
          console.log('Available languages for this exercise:', languagesData);
        } catch (error) {
          console.error('Error fetching exercise languages:', error);
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        useUIStore.getState().setLoading('exercises', false);
      }
    };

    if (slug) {
      fetchExercise();
    }
  }, [slug, getExerciseBySlug, getUserCode, getExerciseSignature, getExerciseLanguages]);

  // Fetch test cases dynamically
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        await getTestCase(slug);
        const storeState = exercises_store.getState();
        const testCasesData = storeState.testCases;
        
        if (!testCasesData || !Array.isArray(testCasesData)) {
          console.error('No test cases found');
          return;
        }
        
        // Transform API response to TestCase format
        const transformedTestCases: TestCase[] = testCasesData.map((testCase: any) => ({
          id: testCase.pos,
          codeRun: testCase.input_display,
          description: testCase.scenario,
          expected: (() => {
            try {
              // Check if expected_output_json is already an object or needs parsing
              if (typeof testCase.expected_output_json === 'string') {
                return JSON.parse(testCase.expected_output_json);
              } else if (testCase.expected_output_json?.value) {
                return testCase.expected_output_json.value;
              }
              return testCase.expected_output_json;
            } catch (error) {
              return `Error parsing expected output: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          })(),
        }));
        
        console.log('Transformed test cases:', transformedTestCases);
        setTestCases(transformedTestCases);
      } catch (error) {
        console.error('Error fetching test cases:', error);
      }
    };

    if (slug) {
      fetchTestCases();
    }
  }, [slug, getTestCase]);

  if (useUIStore((state) => state.loading.exercises)) {
    return <LoadingSpinner />;
  }

  if (!exercise) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="mb-4 text-4xl"
            style={{
              color: "var(--exercise-not-found-text)"
            }}
          >Exercise not found</p>
          <Link href="/" className="exercise-go-back-button">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    
    <div className="flex h-screen w-full overflow-hidden">
      {/* Resizable Left Sidebar */}
      {sidebarOpen && (
        <ResizableSidebar
          width={sidebarWidth}
          onResize={setSidebarWidth}
          exercise={exercise}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-surface px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 exercise-sidebar-open-button rounded-lg transition-colors"
                title="Open sidebar" 
              >
                <ChevronRight className="w-5 h-5 exercise-sidebar-open-button" />
              </button>
            )}
            <select
            // className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              value={selectedLanguage} 
              onChange={handleLanguageChange} 
              className="px-4 py-2 exercise-header-language-select-button  rounded-lg  font-medium cursor-pointer"
              title="Select programming language"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border exercise-header-reset-button  rounded-lg transition-colors font-medium"
              title="Reset to initial code (Ctrl+R)"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSaveCode}
              className="flex items-center gap-2 px-4 py-2 border exercise-header-save-button  rounded-lg transition-colors font-medium"
              title="Save code (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCompleteExercise}
              disabled={!allTestsPassed || testCases.length === 0 || hasCodeChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors exercise-header-complete-exercise-button-text font-medium ${
                allTestsPassed && testCases.length > 0 && !hasCodeChanges
                  ? 'exercise-header-complete-exercise-button-border'
                  : 'exercise-header-complete-exercise-button-disabled'
              }`}
              title={
                !allTestsPassed || testCases.length === 0
                  ? 'Complete all tests to finish'
                  : hasCodeChanges
                  ? 'Code has changed - run tests again'
                  : 'Mark exercise as completed'
              }
            >
              complete exercise
            </button>
            <Link href="/">
              <button className="p-2 exercise-header-exit-exercise-button rounded-lg transition-colors">
                <X className="w-5 h-5 exercise-header-exit-exercise-button " />
              </button>
            </Link>
          </div>
        </div>

        {/* Editor and Test Scenarios */}
        <div className="flex-1 flex flex-col overflow-hidden gap-1 p-1 relative">
          <div className="flex flex-col gap-1 h-full">
            {/* Code Editor */}
            <div className="flex-1 rounded-lg overflow-hidden ">
              <Editor
                height="100%"
                width="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                options={{
                  fontSize: 12
                }}
                theme="vs-dark"
              />
            </div>

            {/* Test Scenarios Panel Component */}
            <div>
              <TestScenario
                ref={testScenarioRef}
                testCases={testCases}
                showTestPanel={showTestPanel}
                onTogglePanel={setShowTestPanel}
                userCode={code}
                signature={exercise?.signature}
                onTestResults={handleTestResults}
              />
            </div>
          </div>

          
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={showResetModal}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
    </div>
  );
};

export default ExercisePage;
