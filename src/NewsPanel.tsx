import { useEffect, useRef, useState } from 'react'
import type { SelectedCountry } from './types'
import './NewsPanel.css'

function ExternalIcon() {
  return (
    <svg className="news-external" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M18 19H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H7v10h10v-4a1 1 0 0 1 2 0v5a1 1 0 0 1-1 1ZM14 4a1 1 0 0 1 1-1h5v5a1 1 0 0 1-2 0V6.41l-9.3 9.29a1 1 0 0 1-1.42-1.42L17.59 5H15a1 1 0 0 1-1-1Z"
      />
    </svg>
  )
}

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
  if (diff < 60) return 'Just now'
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
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    // iso2 of "-99" means the GeoJSON feature has no valid country code
    if (!API_KEY) {
      setState({ kind: 'error', message: 'no-key' })
      return
    }

    setState({ kind: 'loading' })
    let cancelled = false

    // /everything?q= works for any country name; /top-headlines?country= only
    // supports ~55 country codes so many valid clicks would return zero results.
    fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(country.name)}&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`,
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
    <div
      className="news-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-panel-country-title"
    >
      <div className="news-panel-header">
        <div className="news-panel-title-block">
          <h2 id="news-panel-country-title">{country.name}</h2>
          <p className="news-panel-sub">Headlines</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          className="news-panel-close"
          onClick={onClose}
          aria-label="Close news panel"
        >
          ×
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

        {state.kind === 'error' && state.message === 'cors-block' && (
          <p className="news-empty">
            NewsAPI blocks browser requests from non-localhost origins on the free tier. Run the app
            locally or upgrade your plan.
          </p>
        )}

        {state.kind === 'error' &&
          !['no-key', 'cors-block'].includes(state.message) && (
            <p className="news-empty">Could not load news ({state.message}).</p>
          )}

        {state.kind === 'ok' && state.articles.length === 0 && (
          <p className="news-empty">No headlines found for {country.name}.</p>
        )}

        {state.kind === 'ok' && state.articles.length > 0 && (
          <div className="news-articles">
            {state.articles.map((article, i) => (
              <a
                key={i}
                className="news-article"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="news-meta-row">
                  <span className="news-meta">
                    {article.source.name} · {relativeTime(article.publishedAt)}
                  </span>
                  <ExternalIcon />
                </div>
                <div className="news-title-row">
                  <span className="news-title">{article.title}</span>
                </div>
                {article.description && (
                  <span className="news-description">{article.description}</span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
