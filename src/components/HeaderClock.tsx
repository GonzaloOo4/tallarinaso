'use client';

import { useEffect, useState } from 'react';

const format = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit' });

// Hora local de la ciudad; se pinta solo en el navegador para no desfasar el HTML del servidor.
export const HeaderClock = ({ ciudad }: { ciudad: string }) => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="header-clock">
      <span className="header-clock-dot" aria-hidden="true" />
      <span className="sr-only">Hora local en </span>
      {ciudad}
      <span aria-hidden="true"> · </span>
      <time dateTime={now?.toISOString()}>{now ? format.format(now) : ' '}</time>
    </p>
  );
};
