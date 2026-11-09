import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DogSelector } from '@/components/portal/DogSelector';
import { OwnerNotFoundScreen } from '@/components/portal/OwnerNotFoundScreen';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ dogId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'OWNER') redirect('/portal/login');

  const { dogId } = await searchParams;

  const owner = await prisma.owner.findUnique({
    where: { userId: session.id },
    include: {
      dogs: { where: { isActive: true }, orderBy: { name: 'asc' } },
    },
  });
  if (!owner) return <OwnerNotFoundScreen />;

  // Validar dogId contra los perros activos del owner
  const activeDogId =
    owner.dogs.find((d) => d.id === dogId)?.id ?? owner.dogs[0]?.id ?? null;

  // Próximos turnos
  const appointments = activeDogId
    ? await prisma.appointment.findMany({
        where: {
          ownerId: owner.id,
          date: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { date: 'asc' },
        take: 5,
        include: { dog: { select: { name: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-700">Hola, {owner.firstName}</h1>

      {owner.dogs.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-primary-600 mb-1">Tu perro</label>
          <DogSelector dogs={owner.dogs} value={activeDogId} basePath="/portal" />
        </div>
      )}

      {owner.dogs.length === 0 && (
        <p className="text-primary-500">Aún no tenés perros asignados.</p>
      )}

      {activeDogId && (
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/portal/perro/${activeDogId}`}
            className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-primary-700">🐾 Mi perro</h2>
            <p className="text-sm text-primary-500 mt-1">Ver expediente completo</p>
          </Link>

          <Link
            href={`/portal/perro/${activeDogId}?tab=ejercicios`}
            className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-primary-700">🏋️ Ejercicios</h2>
            <p className="text-sm text-primary-500 mt-1">Practicar y registrar notas</p>
          </Link>

          <Link
            href={`/portal/diario?dogId=${activeDogId}`}
            className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-primary-700">📓 Diario</h2>
            <p className="text-sm text-primary-500 mt-1">Registrar comportamientos</p>
          </Link>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-primary-700 mb-2">📅 Turnos</h2>
            {appointments.length === 0 ? (
              <p className="text-sm text-primary-400">Sin próximos turnos</p>
            ) : (
              <ul className="space-y-1">
                {appointments.map((apt) => (
                  <li key={apt.id} className="text-sm text-primary-600">
                    {formatDate(apt.date)} — {apt.serviceType} ({apt.dog.name})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
