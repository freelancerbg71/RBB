export async function GET() {
  const body = [
    'User-agent: *',
    // Allow crawling so search engines can see the on-page noindex on /go/*.
    // These pages are intentionally excluded from the sitemap.
    'Disallow:',
    '',
    'Sitemap: https://readbetweenbets.com/sitemap-index.xml',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
