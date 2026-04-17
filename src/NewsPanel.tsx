import { useEffect, useState } from 'react'
import type { SelectedCountry } from './types'
import './NewsPanel.css'

type Article = {
  title: string
  description: string | null
  url: string
  source: { name: string }
  publishedAt: string
}

type NewsAPIResponse = {
  status: 'ok' | 'error'
  articles: Article[]
  message?: string
}

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; articles: Article[] }
  | { kind: 'error'; message: string }

const API_KEY = import.meta.env.VITE_NEWS_API_KEY

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86_400)}d ago`
}

type Props = {
  country: SelectedCountry
  onClose: () => void
}

export default function NewsPanel({ country, onClose }: Props) {
  const [state, setState] = useState<FetchState>({ kind: 'idle' })

  useEffect(() => {
    // iso2 of "-99" means the GeoJSON feature has no valid country code
    if (!API_KEY) {
      setState({ kind: 'error', message: 'no-key' })
      return
    }
    if (!country.iso2 || country.iso2 === '-99' || country.iso2.length !== 2) {
      setState({ kind: 'error', message: 'no-code' })
      return
    }

    setState({ kind: 'loading' })
    let cancelled = false

    fetch(
      `https://newsapi.org/v2/top-headlines?country=${country.iso2.toLowerCase()}&apiKey=${API_KEY}&pageSize=10`,
    )
      .then((r) => {
        if (r.status === 426) throw new Error('cors-block')
        if (!r.ok) throw new Error(`api-error-${r.status}`)
        return r.json() as Promise<NewsAPIResponse>
      })
      .then((data) => {
        if (cancelled) return
        if (data.status === 'error') {
          setState({ kind: 'error', message: data.message ?? 'api-error' })
          return
        }
        const clean = data.articles.filter(
          (a) => a.title && a.title !== '[Removed]',
        )
        setState({ kind: 'ok', articles: clean })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ kind: 'error', message: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [country])

  return (
    <div className="news-panel">
      <div className="news-panel-header">
        <h2>{country.name}</h2>
        <button className="news-panel-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="news-panel-body">
        {state.kind === 'loading' && (
          <div className="news-skeletons">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="news-skeleton" />
            ))}
          </div>
        )}

        {state.kind === 'error' && state.message === 'no-key' && (
          <p className="news-empty">
            Add <code>VITE_NEWS_API_KEY=your_key</code> to <code>.env.local</code> and restart the
            dev server.
            <br />
            <br />
            Get a free key at{' '}
            <a href="https://newsapi.org" target="_blank" rel="noreferrer">
              newsapi.org
            </a>
            .
          </p>
        )}

        {state.kind === 'error' && state.message === 'no-code' && (
          <p className="news-empty">No news available for this region.</p>
        )}

        {state.kind === 'error' && state.message === 'cors-block' && (
          <p className="news-empty">
            NewsAPI blocks browser requests from non-localhost origins on the free tier. Run the app
            locally or upgrade your plan.
          </p>
        )}

        {state.kind === 'error' &&
          !['no-key', 'no-code', 'cors-block'].includes(state.message) && (
            <p className="news-empty">Could not load news ({state.message}).</p>
          )}

        {state.kind === 'ok' && state.articles.length === 0 && (
          <p className="news-empty">No headlines found for {country.name}.</p>
        )}

        {state.kind === 'ok' &&
          state.articles.map((article, i) => (
            <a
              key={i}
              className="news-article"
              href={article.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="news-meta">
                {article.source.name} · {relativeTime(article.publishedAt)}
              </span>
              <span className="news-title">{article.title}</span>
              {article.description && (
                <span className="news-description">{article.description}</span>
              )}
            </a>
          ))}
      </div>
    </div>
  )
}
