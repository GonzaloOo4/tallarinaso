'use client';

import { startTransition, type FormEvent } from 'react';

// React 19 vacía el formulario después de cada envío con `action`. Si el servidor responde con
// un error, la persona perdería lo que escribió; enviando así se conserva (y se limpia a mano al
// terminar bien). El `action` del form se deja igual para que funcione sin JavaScript.
export const keepFormOnSubmit = (action: (formData: FormData) => void) => (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  startTransition(() => action(formData));
};
