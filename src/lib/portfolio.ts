import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CuadroCollectionSchema, type Cuadro } from '@data/_schema/cuadro.schema';
import { HabilidadCollectionSchema, type Habilidad } from '@data/_schema/habilidad.schema';
import { SitioCollectionSchema, type Sitio } from '@data/_schema/sitio.schema';

const readDataFile = async (fileName: string) => {
  const filePath = path.join(process.cwd(), 'data', fileName);
  return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
};

export const getSitio = async (): Promise<Sitio> => {
  const collection = SitioCollectionSchema.parse(await readDataFile('sitio.json'));
  const record = collection.records[0];
  if (!record) throw new Error('Falta el contenido del sitio.');
  return record.data;
};

export const getHabilidades = async (): Promise<Habilidad[]> => {
  const collection = HabilidadCollectionSchema.parse(await readDataFile('habilidad.json'));
  return collection.records.map(({ data }) => data);
};

export const getCuadrosPublicados = async (): Promise<Cuadro[]> => {
  const collection = CuadroCollectionSchema.parse(await readDataFile('cuadro.json'));
  return collection.records
    .map(({ data }) => data)
    .filter((cuadro) => cuadro.publicado)
    .sort((first, second) => (first.orden ?? Number(first.numero)) - (second.orden ?? Number(second.numero)));
};