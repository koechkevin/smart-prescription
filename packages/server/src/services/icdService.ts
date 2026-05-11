import { config } from '../config.js';

interface ICD11Result {
  code: string;
  title: string;
  chapter: string;
  score: number;
}

export async function searchICD11(query: string): Promise<ICD11Result[]> {
  const url = `${config.icd.baseUrl}/search?q=${encodeURIComponent(query)}`;
  const chapters = '10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;01;02;03;04;05;06;07;08;09;X;';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'API-Version': 'v2',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flatResults: true,
      includeKeywordResult: true,
      useFlexisearch: false,
      highlightingEnabled: false,
      chapterFilter: chapters,
      includePostcoordination: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`ICD-11 API returned ${response.status}`);
  }

  const data = await response.json();
  const destinationEntities = data.destinationEntities || [];

  return destinationEntities.map((entity: any) => ({
    code: entity.theCode || extractCodeFromId(entity.id),
    title: stripTags(entity.title || ''),
    chapter: entity.chapter || '',
    score: entity.score || 0,
  }));
}

function extractCodeFromId(id: string): string {
  if (!id) return '';
  const parts = id.split('/');
  return parts[parts.length - 1] || '';
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
