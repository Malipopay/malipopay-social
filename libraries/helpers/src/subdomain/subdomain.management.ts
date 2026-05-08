import { parse } from 'tldts';

export function getCookieUrlFromDomain(domain: string) {
  // allowPrivateDomains makes tldts recognize Public-Suffix-List "private"
  // suffixes (e.g. ngrok-free.app, vercel.app, github.io). Without this,
  // tldts returns ".ngrok-free.app" as the cookie domain, but browsers
  // silently reject Set-Cookie on a PSL entry because it would let one
  // tenant set cookies for siblings. With allowPrivateDomains:true, the
  // cookie is scoped to the actual hostname's registrable domain.
  const url = parse(domain, { allowPrivateDomains: true });
  return url.domain! ? '.' + url.domain! : url.hostname!;
}
