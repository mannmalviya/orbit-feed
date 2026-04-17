import type { Controls } from './types'
import './ControlPanel.css'

type Props = {
  controls: Controls
  onChange: (patch: Partial<Controls>) => void
}

export default function ControlPanel({ controls, onChange }: Props) {
  return (
    <div className="cp">
      <button
        className={`cp-btn ${controls.autoSpin ? 'cp-btn--on' : ''}`}
        onClick={() => onChange({ autoSpin: !controls.autoSpin })}
        title="Toggle auto-spin"
      >
        ↺ Spin
      </button>

      <div className={`cp-slider ${controls.autoSpin ? '' : 'cp-slider--hidden'}`}>
        <span className="cp-label">Speed</span>
        <input
          type="range"
          min={0.1}
          max={2.0}
          step={0.1}
          value={controls.spinSpeed}
          onChange={(e) => onChange({ spinSpeed: parseFloat(e.target.value) })}
        />
      </div>

      <div className="cp-divider" />

      <button
        className={`cp-btn ${controls.showDayNight ? 'cp-btn--on' : ''}`}
        onClick={() => onChange({ showDayNight: !controls.showDayNight })}
        title="Toggle live day/night"
      >
        ☀ Day/Night
      </button>

      <button
        className={`cp-btn ${controls.showClouds ? 'cp-btn--on' : ''}`}
        onClick={() => onChange({ showClouds: !controls.showClouds })}
        title="Toggle cloud layer"
      >
        ☁ Weather
      </button>
    </div>
  )
}
