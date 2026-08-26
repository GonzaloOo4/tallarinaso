export interface CollectionMeta {
  version: number;
  lastModified: string;
  description: string;
}

export interface CollectionFile<T> {
  _meta: CollectionMeta;
  records: T[];
}

export interface ApiError {
  error: string;
  details?: unknown;
}
