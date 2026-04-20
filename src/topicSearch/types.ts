export type TopicArticle = {
  id: string
  title: string
  sourceName: string
  publishedAt: string
  country: string
  url: string
}

/** Minimal fields for country inference (NewsAPI rows or tests). */
export type ArticleCountryHint = {
  title: string
  description: string
  sourceName: string
  country?: string
}
