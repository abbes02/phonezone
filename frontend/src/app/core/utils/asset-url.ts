import { environment } from '../../../environments/environment';

const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

export function assetUrl(url?: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin}/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
}
