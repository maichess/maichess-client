'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { AnalysisConfig, AnalysisGameDetail, AnalysisLine } from '@/lib/models/analysis'
import { useAnalysisSocket } from './useAnalysisSocket'

export interface AnalysisState {
  activeSessionId: string | null
  currentIndex: number
  currentFen: string
  whatifMoves: string[]
  analysisRunning: boolean
  analysisComplete: boolean
  analysisError: string | null
  currentLines: AnalysisLine[]
  currentDepth: number
  botId: string
  lineCount: number
}

type Action =
  | { type: 'SESSION_CREATED'; sessionId: string; fen: string; index: number }
  | { type: 'ANALYSIS_STARTED' }
  | { type: 'ANALYSIS_UPDATE'; depth: number; lines: AnalysisLine[] }
  | { type: 'ANALYSIS_COMPLETE' }
  | { type: 'ANALYSIS_ERROR'; message: string }
  | { type: 'NAVIGATED'; index: number; fen: string }
  | { type: 'WHATIF_PLAYED'; move: string; fen: string }
  | { type: 'WHATIF_UNDONE'; fen: string }
  | { type: 'WHATIF_RESET'; fen: string }
  | { type: 'SETTINGS_CHANGED'; botId: string; lineCount: number }

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case 'SESSION_CREATED':
      return { ...state, activeSessionId: action.sessionId, currentFen: action.fen, currentIndex: action.index }
    case 'ANALYSIS_STARTED':
      return { ...state, analysisRunning: true, analysisComplete: false, analysisError: null, currentLines: [], currentDepth: 0 }
    case 'ANALYSIS_UPDATE':
      return { ...state, currentDepth: action.depth, currentLines: action.lines }
    case 'ANALYSIS_COMPLETE':
      return { ...state, analysisRunning: false, analysisComplete: true }
    case 'ANALYSIS_ERROR':
      return { ...state, analysisRunning: false, analysisError: action.message }
    case 'NAVIGATED':
      return {
        ...state,
        currentIndex: action.index,
        currentFen: action.fen,
        whatifMoves: [],
        currentLines: [],
        currentDepth: 0,
        analysisComplete: false,
        analysisError: null,
        // navigation always restarts analysis server-side
        analysisRunning: true,
      }
    case 'WHATIF_PLAYED':
      return {
        ...state,
        whatifMoves: [...state.whatifMoves, action.move],
        currentFen: action.fen,
        currentLines: [],
        currentDepth: 0,
        analysisComplete: false,
        analysisError: null,
        analysisRunning: true,
      }
    case 'WHATIF_UNDONE':
      return {
        ...state,
        whatifMoves: state.whatifMoves.slice(0, -1),
        currentFen: action.fen,
        currentLines: [],
        currentDepth: 0,
        analysisComplete: false,
        analysisError: null,
        analysisRunning: true,
      }
    case 'WHATIF_RESET':
      return {
        ...state,
        whatifMoves: [],
        currentFen: action.fen,
        currentLines: [],
        currentDepth: 0,
        analysisComplete: false,
        analysisError: null,
        analysisRunning: true,
      }
    case 'SETTINGS_CHANGED':
      return {
        ...state,
        botId: action.botId,
        lineCount: action.lineCount,
        currentLines: [],
        currentDepth: 0,
        analysisComplete: false,
        analysisError: null,
        analysisRunning: true,
      }
    default:
      return state
  }
}

export function useAnalysisSession(game: AnalysisGameDetail, config: AnalysisConfig) {
  const [state, dispatch] = useReducer(reducer, {
    activeSessionId: null,
    currentIndex: 0,
    currentFen: game.starting_fen,
    whatifMoves: [],
    analysisRunning: false,
    analysisComplete: false,
    analysisError: null,
    currentLines: [],
    currentDepth: 0,
    botId: config.default_bot_id,
    lineCount: config.default_line_count,
  })

  const sessionIdRef = useRef<string | null>(null)
  const botIdRef = useRef(config.default_bot_id)
  const lineCountRef = useRef(config.default_line_count)

  // Keep refs in sync with state so a re-init (new game) reads the latest settings.
  // Synced in an effect rather than during render (writing a ref during render is unsafe).
  useEffect(() => {
    botIdRef.current = state.botId
    lineCountRef.current = state.lineCount
  })

  const onUpdate = useCallback((depth: number, lines: AnalysisLine[]) => {
    dispatch({ type: 'ANALYSIS_UPDATE', depth, lines })
  }, [])
  const onComplete = useCallback(() => dispatch({ type: 'ANALYSIS_COMPLETE' }), [])
  const onError = useCallback((message: string) => dispatch({ type: 'ANALYSIS_ERROR', message }), [])

  useAnalysisSocket(state.activeSessionId, onUpdate, onComplete, onError)

  // Create session and auto-start analysis on mount
  useEffect(() => {
    let mounted = true

    async function init() {
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          bot_id: botIdRef.current,
          line_count: lineCountRef.current,
        }),
      })
      if (!sessionRes.ok || !mounted) return
      const sessionData = await sessionRes.json()
      const sid: string = sessionData.session_id
      sessionIdRef.current = sid
      dispatch({ type: 'SESSION_CREATED', sessionId: sid, fen: sessionData.current_fen, index: sessionData.current_index })

      await fetch(`/api/sessions/${sid}/analysis`, { method: 'POST' })
      if (mounted) dispatch({ type: 'ANALYSIS_STARTED' })
    }

    init()

    return () => {
      mounted = false
      const sid = sessionIdRef.current
      if (sid) {
        // keepalive ensures the request completes even during page unload
        fetch(`/api/sessions/${sid}`, { method: 'DELETE', keepalive: true }).catch(() => {})
        sessionIdRef.current = null
      }
    }
  }, [game.id])

  const navigate = useCallback(async (index: number) => {
    const sid = sessionIdRef.current
    if (!sid) return
    const res = await fetch(`/api/sessions/${sid}/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    })
    if (!res.ok) return
    const data = await res.json()
    dispatch({ type: 'NAVIGATED', index: data.current_index, fen: data.current_fen })
  }, [])

  const playWhatif = useCallback(async (move: string): Promise<boolean> => {
    const sid = sessionIdRef.current
    if (!sid) return false
    const res = await fetch(`/api/sessions/${sid}/whatif`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ move }),
    })
    if (!res.ok) return false
    const data = await res.json()
    dispatch({ type: 'WHATIF_PLAYED', move, fen: data.current_fen })
    return true
  }, [])

  const undoWhatif = useCallback(async () => {
    const sid = sessionIdRef.current
    if (!sid) return
    const res = await fetch(`/api/sessions/${sid}/whatif/last`, { method: 'DELETE' })
    if (!res.ok) return
    const data = await res.json()
    dispatch({ type: 'WHATIF_UNDONE', fen: data.current_fen })
  }, [])

  const resetWhatif = useCallback(async () => {
    const sid = sessionIdRef.current
    if (!sid) return
    const res = await fetch(`/api/sessions/${sid}/whatif`, { method: 'DELETE' })
    if (!res.ok) return
    const data = await res.json()
    dispatch({ type: 'WHATIF_RESET', fen: data.current_fen })
  }, [])

  const exportWhatifPgn = useCallback(async (): Promise<string | null> => {
    const sid = sessionIdRef.current
    if (!sid) return null
    const res = await fetch(`/api/sessions/${sid}/whatif/pgn`)
    if (!res.ok) return null
    const data = await res.json()
    return data.pgn ?? null
  }, [])

  const changeSettings = useCallback(async (botId: string, lineCount: number) => {
    const sid = sessionIdRef.current
    if (!sid) return
    await fetch(`/api/sessions/${sid}/analysis`, { method: 'DELETE' })
    await fetch(`/api/sessions/${sid}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_id: botId, line_count: lineCount }),
    })
    dispatch({ type: 'SETTINGS_CHANGED', botId, lineCount })
  }, [])

  return { state, navigate, playWhatif, undoWhatif, resetWhatif, exportWhatifPgn, changeSettings }
}
