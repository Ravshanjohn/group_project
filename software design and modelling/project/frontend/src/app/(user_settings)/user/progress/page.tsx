'use client'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Lightbulb, ChevronRight, Code, Database, FileCode } from 'lucide-react'

type Language = 'javascript' | 'typescript' | 'sql'

interface SkillItem {
  label: string
  level: number
  detail: string
}

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface LanguageData {
  icon: typeof Code
  color: string
  strengths: SkillItem[]
  weaknesses: SkillItem[]
  recommendations: Recommendation[]
}

const languageData: Record<Language, LanguageData> = {
  javascript: {
    icon: FileCode,
    color: '#f7df1e',
    strengths: [
      { label: 'Algorithm Design', level: 82, detail: 'Strong grasp of sorting, searching, and recursion patterns' },
      { label: 'Code Structure', level: 76, detail: 'Clean separation of concerns and modular functions' },
      { label: 'Array Methods', level: 90, detail: 'Excellent use of map, filter, reduce, and chaining' },
      { label: 'Async Patterns', level: 68, detail: 'Good understanding of Promises and async/await' },
    ],
    weaknesses: [
      { label: 'Critical Thinking', level: 35, detail: 'Needs more practice analyzing edge cases before coding' },
      { label: 'Error Handling', level: 42, detail: 'Often skips try/catch and input validation' },
      { label: 'Time Complexity', level: 38, detail: 'Solutions work but could be more efficient' },
    ],
    recommendations: [
      { title: 'Practice DSA Fundamentals', description: 'Focus on linked lists, trees, and graph traversal to build stronger algorithmic thinking', priority: 'high' },
      { title: 'Build REST APIs', description: 'Create a small Express project to practice error handling and middleware patterns', priority: 'high' },
      { title: 'Solve Edge Case Exercises', description: 'Pick exercises that test boundary conditions — empty arrays, null inputs, overflow', priority: 'medium' },
      { title: 'Study Big-O Notation', description: 'Review time and space complexity for common operations before optimizing solutions', priority: 'low' },
    ],
  },
  typescript: {
    icon: FileCode,
    color: '#3178c6',
    strengths: [
      { label: 'Type Annotations', level: 74, detail: 'Consistent use of explicit types for function signatures' },
      { label: 'Interface Design', level: 70, detail: 'Good modeling of data shapes with interfaces' },
      { label: 'Code Readability', level: 85, detail: 'Clear naming conventions and well-typed code' },
    ],
    weaknesses: [
      { label: 'Generics', level: 30, detail: 'Struggles with generic type parameters and constraints' },
      { label: 'Utility Types', level: 28, detail: 'Rarely uses Partial, Pick, Omit, or mapped types' },
      { label: 'Type Narrowing', level: 40, detail: 'Tends to use type assertions instead of proper guards' },
      { label: 'Union Handling', level: 44, detail: 'Discriminated unions and exhaustive checks need work' },
    ],
    recommendations: [
      { title: 'Master Generics', description: 'Start with simple generic functions, then progress to constrained generics and conditional types', priority: 'high' },
      { title: 'Explore Utility Types', description: 'Refactor existing code using Partial, Required, Pick, and Record to build muscle memory', priority: 'high' },
      { title: 'Practice Type Guards', description: 'Replace type assertions with user-defined type guards and discriminated unions', priority: 'medium' },
      { title: 'Read the TypeScript Handbook', description: 'Work through the advanced types section to solidify narrowing and inference', priority: 'low' },
    ],
  },
  sql: {
    icon: Database,
    color: '#336791',
    strengths: [
      { label: 'Basic Queries', level: 88, detail: 'Strong SELECT, WHERE, and ORDER BY fundamentals' },
      { label: 'Filtering & Sorting', level: 80, detail: 'Good use of comparison operators, LIKE, and IN clauses' },
      { label: 'Table Design', level: 65, detail: 'Reasonable normalization and primary key choices' },
    ],
    weaknesses: [
      { label: 'JOIN Operations', level: 34, detail: 'Confuses INNER, LEFT, and CROSS joins in multi-table queries' },
      { label: 'Subqueries', level: 30, detail: 'Avoids correlated subqueries and CTEs' },
      { label: 'Aggregation', level: 42, detail: 'GROUP BY with HAVING and window functions need practice' },
      { label: 'Query Optimization', level: 25, detail: 'No indexing strategy or EXPLAIN usage' },
    ],
    recommendations: [
      { title: 'Master JOINs', description: 'Practice LEFT, RIGHT, INNER, and FULL OUTER joins with real multi-table datasets', priority: 'high' },
      { title: 'Learn Window Functions', description: 'Study ROW_NUMBER, RANK, LAG, and LEAD for analytics-style queries', priority: 'high' },
      { title: 'Write Complex Queries', description: 'Use CTEs and subqueries to solve multi-step problems instead of multiple simple queries', priority: 'medium' },
      { title: 'Study Query Plans', description: 'Use EXPLAIN ANALYZE to understand how the database executes your queries', priority: 'low' },
    ],
  },
}

const languageTabs: { key: Language; label: string }[] = [
  { key: 'javascript', label: 'JavaScript' },
  { key: 'typescript', label: 'TypeScript' },
  { key: 'sql', label: 'SQL' },
]

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--red_400)', label: 'High' },
  medium: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', label: 'Medium' },
  low: { bg: 'rgba(34, 197, 94, 0.15)', text: 'var(--green)', label: 'Low' },
}

function SkillBar({ item, variant }: { item: SkillItem; variant: 'strength' | 'weakness' }) {
  const barColor = variant === 'strength' ? 'var(--emerald_400)' : 'var(--red_400)'
  const trackColor = 'var(--zinc_800)'

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{ backgroundColor: 'var(--zinc_900)', border: '1px solid var(--zinc_800)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm" style={{ color: 'var(--zinc_200)' }}>
          {item.label}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: variant === 'strength' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            color: barColor,
          }}
        >
          {item.level}%
        </span>
      </div>

      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${item.level}%`, backgroundColor: barColor }}
        />
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--zinc_500)' }}>
        {item.detail}
      </p>
    </div>
  )
}

const UserProgressPage = () => {
  const [activeLang, setActiveLang] = useState<Language>('javascript')
  const data = languageData[activeLang]

  return (
    <div className="max-w-4xl pb-20 cursor-default" style={{ color: 'var(--user-settings-profile-header-text-color)' }}>
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">Progress</h2>
        <p className="text-sm" style={{ color: 'var(--zinc_500)' }}>
          Track your strengths, identify weaknesses, and follow recommendations to level up.
        </p>
      </div>

      {/* Language Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-10 w-fit"
        style={{ backgroundColor: 'var(--zinc_900)', border: '1px solid var(--zinc_800)' }}
      >
        {languageTabs.map((tab) => {
          const isActive = activeLang === tab.key
          const langColor = languageData[tab.key].color
          return (
            <button
              key={tab.key}
              onClick={() => setActiveLang(tab.key)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: isActive ? 'var(--zinc_800)' : 'transparent',
                color: isActive ? 'var(--white)' : 'var(--zinc_500)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isActive ? langColor : 'var(--zinc_700)' }}
              />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Strengths */}
      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
            <TrendingUp size={18} style={{ color: 'var(--emerald_400)' }} />
          </div>
          <h3 className="text-lg font-semibold">Strengths</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.strengths.map((item) => (
            <SkillBar key={item.label} item={item} variant="strength" />
          ))}
        </div>
      </section>

      {/* Weaknesses */}
      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)' }}>
            <TrendingDown size={18} style={{ color: 'var(--red_400)' }} />
          </div>
          <h3 className="text-lg font-semibold">Needs Improvement</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.weaknesses.map((item) => (
            <SkillBar key={item.label} item={item} variant="weakness" />
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)' }}>
            <Lightbulb size={18} style={{ color: 'var(--blue_400)' }} />
          </div>
          <h3 className="text-lg font-semibold">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {data.recommendations.map((rec) => {
            const ps = priorityStyles[rec.priority]
            return (
              <div
                key={rec.title}
                className="flex items-center gap-4 rounded-xl p-4 transition-colors group"
                style={{ backgroundColor: 'var(--zinc_900)', border: '1px solid var(--zinc_800)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--zinc_200)' }}>
                      {rec.title}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: ps.bg, color: ps.text }}
                    >
                      {ps.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--zinc_500)' }}>
                    {rec.description}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: 'var(--zinc_600)' }}
                />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default UserProgressPage
