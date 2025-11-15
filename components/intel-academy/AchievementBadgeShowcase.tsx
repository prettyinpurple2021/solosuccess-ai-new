'use client';

import { Skeleton } from '@/components/ui/Skeleton';

interface Achievement {
  id: string;
  achievementId: string;
  achievementName: string;
  achievementType: string;
  description: string | null;
  badgeUrl: string | null;
  earnedAt: string;
}

interface AchievementBadgeShowcaseProps {
  achievements?: Achievement[];
  onRefresh?: () => void;
}

export function AchievementBadgeShowcase({ achievements, onRefresh }: AchievementBadgeShowcaseProps) {
  const isLoading = achievements === undefined;

  // Format earned date
  const formatEarnedDate = (dateString: string) => {
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
        <Skeleton variant="text" height={20} width="50%" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton 
              key={i} 
              variant="rectangular" 
              className="aspect-square rounded-lg" 
            />
          ))}
        </div>
      </div>
    );
  }

  // Show only recent achievements, limit to 6
  const recentAchievements = achievements ? achievements.slice(0, 6) : [];

  // Empty state
  if (recentAchievements.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white">Recent Achievements</h4>
        <div className="text-center py-8 px-4 rounded-lg bg-white/5 border border-white/10">
          <svg
            className="w-12 h-12 text-gray-500 mx-auto mb-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <p className="text-sm text-gray-400 mb-1">No achievements yet</p>
          <p className="text-xs text-gray-500">
            Complete courses and challenges to earn badges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white">Recent Achievements</h4>
      
      <div className="grid grid-cols-3 gap-3">
        {recentAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="group relative"
          >
            <div className="aspect-square rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer">
              {achievement.badgeUrl ? (
                <img
                  src={achievement.badgeUrl}
                  alt={achievement.achievementName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            
            {/* Tooltip with description and earned date */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal z-10 max-w-[200px] shadow-xl">
              <div className="font-semibold mb-1">{achievement.achievementName}</div>
              {achievement.description && (
                <div className="text-gray-300 mb-1">{achievement.description}</div>
              )}
              <div className="text-gray-400 text-[10px]">
                Earned {formatEarnedDate(achievement.earnedAt)}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        ))}
      </div>

      {achievements && achievements.length > 6 && (
        <a
          href="/intel-academy/achievements"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
        >
          View all {achievements.length} achievements
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
