import type { HTMLAttributes } from 'react';

export const ColorableName = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span className="colorable-name" {...props} />
);
