import 'server-only';
import { getToken } from '@vercel/connect';

// Correo vía Resend con la clave gestionada por Vercel Connect: no hay API key en el código
// ni en las variables de entorno. En Vercel se autentica con OIDC automáticamente.
const CONNECTOR = process.env.CONTACT_RESEND_CONNECTOR ?? 'resend/tallarinaso0o567';
// Mientras no haya un dominio verificado en Resend, el remitente de pruebas es onboarding@resend.dev.
const FROM = process.env.CONTACT_FROM ?? 'Portafolio Gonzalo <onboarding@resend.dev>';
// Con onboarding@resend.dev, Resend solo entrega al correo dueño de la cuenta de Resend.
// Para usar otro destinatario hay que verificar un dominio propio en resend.com/domains.
const TO = process.env.CONTACT_TO ?? 'gonzalo.zuniga01@usa.edu.co';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export type ContactEmail = { nombre: string; correo: string; mensaje: string };

export const sendContactEmail = async ({ nombre, correo, mensaje }: ContactEmail) => {
  const token = await getToken(CONNECTOR, { subject: { type: 'app' } });
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: correo,
      subject: `Nuevo mensaje del portafolio — ${nombre}`,
      text: `${nombre} <${correo}> escribió desde el portafolio:\n\n${mensaje}`,
      html: `<p><strong>${escapeHtml(nombre)}</strong> &lt;${escapeHtml(correo)}&gt; escribió desde el portafolio:</p><p style="white-space:pre-wrap">${escapeHtml(mensaje)}</p><p style="color:#888;font-size:12px">Responde a este correo para contestarle directamente.</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend respondió ${response.status}: ${(await response.text()).slice(0, 200)}`);
};
