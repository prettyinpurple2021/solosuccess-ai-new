import { CompetitorDetail } from '@/components/competitor-stalker/CompetitorDetail';

export default function CompetitorDetailPage({
  params,
}: {
  params: { competitorId: string };
}) {
  return (
    <div className="min-h-screen p-6">
      <CompetitorDetail competitorId={params.competitorId} />
    </div>
  );
}
