import { securityTxt } from '../../lib/security';

export function GET() {
  return new Response(securityTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
