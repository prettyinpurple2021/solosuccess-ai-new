'use client';

interface EnrollmentStatusIndicatorProps {
  status: string;
}

export function EnrollmentStatusIndicator({ status }: EnrollmentStatusIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          dotColor: 'bg-green-500',
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          dotColor: 'bg-yellow-500',
        };
      case 'error':
        return {
          label: 'Sync Error',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          dotColor: 'bg-red-500',
        };
      case 'disconnected':
        return {
          label: 'Disconnected',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          dotColor: 'bg-gray-500',
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          dotColor: 'bg-gray-500',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bgColor}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`}></div>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
