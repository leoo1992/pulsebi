export function GET() {
  return Response.json({
    status: 'ok',
    service: 'pulsebi-revenue-intelligence',
    timestamp: new Date().toISOString(),
  });
}
