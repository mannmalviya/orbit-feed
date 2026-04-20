import { resolveArticleCountry } from './resolveCountry'
import type { TopicArticle } from './types'

const API_KEY = import.meta.env.VITE_NEWS_API_KEY as string | undefined

type NewsAPIArticle = {
  title: string | null
  description: string | null
  url: string | null
  source: { name?: string } | null
  publishedAt: string
}

type NewsAPIResponse = {
  status: 'ok' | 'error'
  articles?: NewsAPIArticle[]
  message?: string
}

export type TopicSearchFailureCode = 'no-key' | 'cors-block' | 'api-error'

export class TopicSearchError extends Error {
  readonly code: TopicSearchFailureCode

  constructor(message: string, code: TopicSearchFailureCode) {
    super(message)
    this.name = 'TopicSearchError'
    this.code = code
  }
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s)
}

/**
 * Topic search uses the same NewsAPI `everything` feed as country headlines,
 * so each result opens the publisher URL returned by the API (`article.url`).
 */
export async function searchTopic(keyword: string): Promise<TopicArticle[]> {
  const q = keyword.trim()
  if (!q) return []

  if (!API_KEY) {
    throw new TopicSearchError(
      'Add VITE_NEWS_API_KEY to your .env.local file (same key as the globe news panel) to search topics and open articles.',
      'no-key',
    )
  }

  const res = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=15&apiKey=${API_KEY}`,
  )

  if (res.status === 426) {
    throw new TopicSearchError(
      'NewsAPI blocks browser requests from this origin on the free tier. Run the app locally or use a paid plan / backend proxy.',
      'cors-block',
    )
  }

  if (!res.ok) {
    throw new TopicSearchError(`News request failed (${res.status}).`, 'api-error')
  }

  const data = (await res.json()) as NewsAPIResponse

  if (data.status === 'error') {
    throw new TopicSearchError(data.message ?? 'NewsAPI returned an error.', 'api-error')
  }

  const rows = data.articles ?? []

  return rows
    .filter(
      (a) =>
        a.title &&
        a.title !== '[Removed]' &&
        a.url &&
        isHttpUrl(a.url),
    )
    .map((a, i) => ({
      id: `${i}-${a.publishedAt}-${a.url}`,
      title: a.title as string,
      sourceName: a.source?.name?.trim() || 'Unknown',
      publishedAt: a.publishedAt,
      country: resolveArticleCountry({
        title: a.title as string,
        description: a.description ?? '',
        sourceName: a.source?.name ?? '',
      }),
      url: a.url as string,
    }))
}
