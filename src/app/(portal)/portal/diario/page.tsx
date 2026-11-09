import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OwnerNotFoundScreen } from '@/components/portal/OwnerNotFoundScreen';
import { DogSelector } from '@/components/portal/DogSelector';
import { DiarioClient } from '@/components/portal/DiarioClient';

export const dynamic = 'force-dynamic';

export default async function DiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ dogId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'OWNER') redirect('/portal/login');

  const { dogId } = await searchParams;

  const owner = await prisma.owner.findUnique({
    where: { userId: session.id },
    include: { dogs: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  });
  if (!owner) return <OwnerNotFoundScreen />;

  // IDOR: restringir dogId a los perros activos del owner
  const activeDogId =
    owner.dogs.find((d) => d.id === dogId)?.id ?? owner.dogs[0]?.id ?? null;

  const logs = activeDogId
    ? await prisma.behaviorLog.findMany({
        where: { dogId: activeDogId, ownerId: owner.id },
        orderBy: { date: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-700">Diario de comportamiento</h1>
      </div>

      {owner.dogs.length > 1 && (
        <DogSelector dogs={owner.dogs} value={activeDogId} basePath="/portal/diario" />
      )}

      {activeDogId && (
        <DiarioClient dogId={activeDogId} logs={logs} />
      )}

      {owner.dogs.length === 0 && (
        <p className="text-primary-500">Aún no tenés perros asignados.</p>
      )}
    </div>
  );
}
