'use client'

import { useRef, useEffect, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { matchArcs, matchPoints, type GlobeArc, type GlobePoint } from '@/lib/utils/geoHash'
import type { MatchSummary } from '@/lib/models/match'

interface Props {
  matches: MatchSummary[]
  onMatchSelect: (matchId: string | null) => void
  selectedMatchId: string | null
}

export function GlobeInner({ matches, onMatchSelect, selectedMatchId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [dims, setDims] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 800, h: typeof window !== 'undefined' ? window.innerHeight - 64 : 600 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4
    controls.enableDamping = true
  }, [dims.w])

  const arcs = matchArcs(matches)
  const points = matchPoints(matches)

  return (
    <div ref={containerRef} className="w-full h-full" aria-label="Interactive 3D globe showing ongoing chess games">
      {dims.w > 0 && (
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#5b8dd9"
          atmosphereAltitude={0.18}
          arcsData={arcs}
          arcStartLat={(d: object) => (d as GlobeArc).startLat}
          arcStartLng={(d: object) => (d as GlobeArc).startLng}
          arcEndLat={(d: object) => (d as GlobeArc).endLat}
          arcEndLng={(d: object) => (d as GlobeArc).endLng}
          arcColor={(d: object) => {
            const arc = d as GlobeArc
            if (arc.matchId === selectedMatchId) return ['rgba(255,200,50,0.4)', 'rgba(255,200,50,1)']
            return ['rgba(91,141,217,0.3)', 'rgba(91,141,217,1)']
          }}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          arcStroke={(d: object) => ((d as GlobeArc).matchId === selectedMatchId ? 1.2 : 0.5)}
          arcAltitudeAutoScale={0.4}
          onArcClick={(arc: object) => {
            const a = arc as GlobeArc
            onMatchSelect(a.matchId === selectedMatchId ? null : a.matchId)
          }}
          pointsData={points}
          pointLat={(d: object) => (d as GlobePoint).lat}
          pointLng={(d: object) => (d as GlobePoint).lng}
          pointColor={(d: object) => {
            const p = d as GlobePoint
            return p.matchId === selectedMatchId ? '#ffc832' : '#5b8dd9'
          }}
          pointAltitude={0.02}
          pointRadius={(d: object) => ((d as GlobePoint).matchId === selectedMatchId ? 0.7 : 0.4)}
          pointsMerge={false}
          onPointClick={(point: object) => {
            const p = point as GlobePoint
            onMatchSelect(p.matchId === selectedMatchId ? null : p.matchId)
          }}
          enablePointerInteraction
        />
      )}
    </div>
  )
}
