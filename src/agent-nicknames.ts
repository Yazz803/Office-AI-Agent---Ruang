import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mc.agent-nicknames'

export function readAgentNicknames(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter(([key, nickname]) => key.length > 0 && typeof nickname === 'string' && nickname.trim().length > 0).map(([key, nickname]) => [key, (nickname as string).trim()]))
  } catch {
    return {}
  }
}

export function saveAgentNickname(profileId: string, nickname: string): void {
  const nicknames = readAgentNicknames()
  const trimmed = nickname.trim()
  if (trimmed) nicknames[profileId] = trimmed
  else delete nicknames[profileId]
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nicknames)) } catch { /* storage may be blocked */ }
  window.dispatchEvent(new Event('agent-nickname-change'))
}

export function clearAgentNickname(profileId: string): void {
  saveAgentNickname(profileId, '')
}

export function useAgentNicknames(): Record<string, string> {
  const [nicknames, setNicknames] = useState(readAgentNicknames)
  useEffect(() => {
    const refresh = () => setNicknames(readAgentNicknames())
    window.addEventListener('agent-nickname-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('agent-nickname-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return nicknames
}
