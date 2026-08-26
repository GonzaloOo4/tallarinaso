export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const jsonResponse = <T>(data: T, init?: ResponseInit) =>
  Response.json(data, {
    headers: { 'Cache-Control': 'no-store' },
    ...init,
  });
