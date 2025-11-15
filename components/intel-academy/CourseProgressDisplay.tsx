'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Course {
  id: string;
  courseId: string;
  courseName: string;
  courseDescription: string | null;
  thumbnailUrl: string | null;
  progress: number;
  status: string;
  lastAccessedAt: string | null;
}

interface CourseProgressDisplayProps {
  courses?: Course[];
  onRefresh?: () => void;
}

export function CourseProgressDisplay({ courses, onRefresh }: CourseProgressDisplayProps) {
  const isLoading = courses === undefined;

  // Format last accessed date
  const formatLastAccessed = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" height={20} width="40%" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" height={16} width="70%" />
                  <Skeleton variant="text" height={12} width="40%" />
                  <Skeleton variant="rectangular" height={6} className="mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter to show only active/in-progress courses, limit to 3
  const activeCourses = courses
    ? courses
        .filter((c) => c.status === 'in_progress' || c.status === 'enrolled')
        .slice(0, 3)
    : [];

  // Empty state
  if (activeCourses.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white">Active Courses</h4>
        <div className="text-center py-8 px-4 rounded-lg bg-white/5 border border-white/10">
          <svg
            className="w-12 h-12 text-gray-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-sm text-gray-400 mb-1">No active courses</p>
          <p className="text-xs text-gray-500">
            Enroll in courses on Intel Academy to see your progress here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white">Active Courses</h4>
      
      <div className="space-y-3">
        {activeCourses.map((course) => (
          <div
            key={course.id}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.courseName}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-white truncate" title={course.courseName}>
                  {course.courseName}
                </h5>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last accessed: {formatLastAccessed(course.lastAccessedAt)}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <ProgressBar value={course.progress} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses && courses.length > 3 && (
        <a
          href="/intel-academy/courses"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
        >
          View all {courses.length} courses
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      )}
    </div>
  );
}
