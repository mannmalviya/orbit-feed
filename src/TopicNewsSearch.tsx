import { useState, type FormEvent } from 'react'
import './TopicNewsSearch.css'

type Props = {
  onSearchCountry: (query: string) => void
  searchStatus:
    | { kind: 'idle' }
    | { kind: 'searching'; query: string }
    | { kind: 'found'; name: string }
    | { kind: 'not-found'; query: string }
}

function IconChevronDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TopicNewsSearch({ onSearchCountry, searchStatus }: Props) {
  const [panelOpen, setPanelOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    onSearchCountry(q)
  }
  const statusLine =
    searchStatus.kind === 'searching'
      ? `Searching for "${searchStatus.query}"...`
      : searchStatus.kind === 'found'
        ? `Centered on ${searchStatus.name}.`
        : searchStatus.kind === 'not-found'
          ? `Could not find "${searchStatus.query}". Try an official country name.`
          : 'Type a country name and press Enter to fly the globe there.'

  if (!panelOpen) {
    const hint =
      searchStatus.kind === 'found'
        ? `Found: ${searchStatus.name}`
        : searchStatus.kind === 'not-found'
          ? 'Country not found'
          : 'Country search'

    return (
      <div className="topic-search-collapsed">
        <button
          type="button"
          className="topic-search-expand-btn"
          onClick={() => setPanelOpen(true)}
          aria-expanded="false"
          aria-controls="topic-search-panel"
          title="Open topic search"
        >
          <span className="topic-search-expand-icon" aria-hidden>
            <IconChevronDown />
          </span>
          <span className="topic-search-expand-label">{hint}</span>
        </button>
      </div>
    )
  }

  return (
    <section
      id="topic-search-panel"
      className="topic-search"
      aria-label="Country search"
    >
      <div className="topic-search-header">
        <span className="topic-search-header-title" id="topic-search-heading">
          Find country
        </span>
        <button
          type="button"
          className="topic-search-minimize"
          onClick={() => setPanelOpen(false)}
          aria-label="Minimize topic search"
          title="Minimize"
        >
          <IconChevronUp />
        </button>
      </div>

      <form className="topic-search-form" onSubmit={onSubmit} aria-labelledby="topic-search-heading">
        <label htmlFor="topic-search-input" className="topic-search-label visually-hidden">
          Country name
        </label>
        <div className="topic-search-row">
          <input
            id="topic-search-input"
            type="search"
            className="topic-search-input"
            placeholder="e.g. India, Brazil, South Korea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="submit"
            className="topic-search-submit"
            disabled={searchStatus.kind === 'searching'}
          >
            {searchStatus.kind === 'searching' ? 'Finding...' : 'Find'}
          </button>
        </div>
      </form>

      <div
        className="topic-search-results"
        role="status"
        aria-live="polite"
        aria-busy={searchStatus.kind === 'searching'}
      >
        <p
          className={
            searchStatus.kind === 'not-found' ? 'topic-search-error' : 'topic-search-placeholder'
          }
        >
          {statusLine}
        </p>
      </div>
    </section>
  )
}
