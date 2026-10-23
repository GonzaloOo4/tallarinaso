import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // El contenido vive en data/*.json y se lee en tiempo de ejecución (ISR, server actions, API):
  // hay que incluirlo en las funciones del servidor o en Vercel no existe.
  outputFileTracingIncludes: {
    '/': ['./data/*.json'],
    '/**': ['./data/*.json'],
  },
};

export default nextConfig;
