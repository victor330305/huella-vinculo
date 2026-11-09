'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewBehaviorLogForm } from '@/components/portal/NewBehaviorLogForm';
import { formatDateTime } from '@/lib/utils';

interface BehaviorLog {
  id: string;
  date: Date | string;
  location: string | null;
  situation: string;
  stimulus: string | null;
  distance: string | null;
  behavior: string;
  ownerResponse: string | null;
  recoveryTime: string | null;
  comments: string | null;
}

export function DiarioClient({
  dogId,
  logs,
}: {
  dogId: string;
  logs: BehaviorLog[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Button / form toggle */}
      {showForm ? (
        <div className="rounded-xl border border-primary-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary-700">Nueva entrada</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
          <NewBehaviorLogForm dogId={dogId} onSuccess={handleSuccess} />
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            + Nueva entrada
          </button>
        </div>
      )}

      {/* Log list */}
      {logs.length === 0 ? (
        <p className="text-center text-primary-500 py-6">
          Todavía no hay entradas en el diario.
        </p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-gray-400 mb-2">{formatDateTime(log.date)}</p>

              <dl className="space-y-2">
                {log.location && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Lugar</dt>
                    <dd className="text-sm text-gray-700">{log.location}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Situación</dt>
                  <dd className="text-sm text-gray-700 whitespace-pre-wrap">{log.situation}</dd>
                </div>

                {log.stimulus && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Estímulo</dt>
                    <dd className="text-sm text-gray-700">{log.stimulus}</dd>
                  </div>
                )}

                {log.distance && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Distancia</dt>
                    <dd className="text-sm text-gray-700">{log.distance}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide">Comportamiento</dt>
                  <dd className="text-sm text-gray-700 whitespace-pre-wrap">{log.behavior}</dd>
                </div>

                {log.ownerResponse && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">
                      Respuesta del propietario
                    </dt>
                    <dd className="text-sm text-gray-700">{log.ownerResponse}</dd>
                  </div>
                )}

                {log.recoveryTime && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">
                      Tiempo de recuperación
                    </dt>
                    <dd className="text-sm text-gray-700">{log.recoveryTime}</dd>
                  </div>
                )}

                {log.comments && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Comentarios</dt>
                    <dd className="text-sm text-gray-700 whitespace-pre-wrap">{log.comments}</dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
