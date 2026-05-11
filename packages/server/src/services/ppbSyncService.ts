import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';

const prisma = new PrismaClient();

async function getOAuthToken(): Promise<string> {
  const { tokenUrl, clientId, clientSecret } = config.ppb;
  if (!clientId || !clientSecret) {
    throw new Error('PPB OAuth2 credentials not configured');
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain PPB OAuth token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchCatalogPage(token: string, page: number, limit: number): Promise<{ items: any[]; totalPages: number }> {
  const { catalogUrl } = config.ppb;
  const url = `${catalogUrl}/catalog?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`PPB catalog fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const catalog = data.Data?.catalog || data.catalog || (Array.isArray(data) ? data : []);
  const totalPages = data.Data?.pages || 0;
  return { items: catalog, totalPages };
}

function cleanWhitespace(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

export async function syncPPBCatalog(maxPages = 100): Promise<{ added: number; updated: number; pages: number }> {
  const token = await getOAuthToken();
  let added = 0;
  let updated = 0;
  let currentPage = 1;
  let emptyPages = 0;
  const seenCodes = new Set<string>();
  const pageSize = 500;

  while (currentPage <= maxPages) {
    const { items: products, totalPages } = await fetchCatalogPage(token, currentPage, pageSize);
    if (!products.length) {
      emptyPages++;
      if (emptyPages >= 2) break;
      currentPage++;
      continue;
    }
    emptyPages = 0;

    for (const product of products) {
      const genericConceptCode = cleanWhitespace(product.generic_concept_code)?.toUpperCase();
      const genericName = cleanWhitespace(product.generic_name || product.generic_display_name)?.toUpperCase();
      if (!genericConceptCode || !genericName) continue;

      // Only process first occurrence of each generic — skip brand/package variants
      if (seenCodes.has(genericConceptCode)) continue;
      seenCodes.add(genericConceptCode);

      const strength = cleanWhitespace(product.strength_display_name);
      const route = cleanWhitespace(product.route_description);
      const rawForm = product.form_description;
      const dosageForm = typeof rawForm === 'object' ? cleanWhitespace(rawForm?.name) : cleanWhitespace(rawForm);
      const shelfLife = product.shelf_life_months ? parseInt(product.shelf_life_months) || null : null;

      const existing = await prisma.drugCatalog.findUnique({
        where: { genericConceptCode },
      });

      if (existing) {
        await prisma.drugCatalog.update({
          where: { genericConceptCode },
          data: { genericName, strength, route, dosageForm, shelfLife, syncedAt: new Date() },
        });
        updated++;
      } else {
        await prisma.drugCatalog.create({
          data: { genericConceptCode, genericName, strength, route, dosageForm, shelfLife },
        });
        added++;
      }
    }

    // Stop early if we've passed the total pages
    if (totalPages && currentPage >= totalPages) break;
    currentPage++;
  }

  return { added, updated, pages: currentPage };
}
