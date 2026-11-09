import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OwnerNotFoundScreen } from '@/components/portal/OwnerNotFoundScreen';
import { PortalDogTabs } from '@/components/portal/PortalDogTabs';
import { calculateAge, getInitials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const validTabs = ['expediente', 'ejercicios', 'sesiones', 'turnos'] as const;

export default async function PortalPerroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'OWNER') redirect('/portal/login');

  const { id } = await params;
  const { tab } = await searchParams;

  const owner = await prisma.owner.findUnique({ where: { userId: session.id } });
  if (!owner) return <OwnerNotFoundScreen />;

  const dog = await prisma.dog.findUnique({
    where: { id },
    include: {
      profile: true,
      sessions: {
        orderBy: { date: 'desc' },
        take: 20,
        include: { professional: { select: { name: true } } },
      },
      exercises: { orderBy: { assignedAt: 'desc' } },
      appointments: {
        where: {
          date: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { date: 'asc' },
      },
      reports: {
        where: { isVisibleToOwner: true },
        orderBy: { generatedAt: 'desc' },
      },
    },
  });

  if (!dog || !dog.isActive) notFound();
  if (dog.ownerId !== owner.id) notFound();

  const initialTab =
    typeof tab === 'string' && (validTabs as readonly string[]).includes(tab)
      ? tab
      : 'expediente';

  const age = dog.birthDate ? calculateAge(dog.birthDate) : dog.approximateAge ?? 'Desconocida';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {dog.profilePhotoUrl ? (
          <img src={dog.profilePhotoUrl} alt={dog.name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
            {getInitials(dog.name)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-primary-700">{dog.name}</h1>
          <p className="text-primary-500">{dog.breed} · {age}</p>
        </div>
      </div>
      <PortalDogTabs dog={dog} initialTab={initialTab} />
    </div>
  );
}
