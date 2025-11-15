'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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

export function CourseProgressDisplay() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/intel-academy/courses');
      const data = await response.json();
      
      if (data.success) {
        // Show only active/in-progress courses, limit to 3
        const activeCourses = data.courses
          .filter((c: Course) => c.status === 'in_progress' || c.status === 'enrolled')
          .slice(0, 3);
        setCourses(activeCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">No active courses</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white">Active Courses</h4>
      
      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.courseName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-white truncate">
                  {course.courseName}
                </h5>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <ProgressBar value={course.progress} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/intel-academy/courses"
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
      >
        View all courses
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
    </div>
  );
}
