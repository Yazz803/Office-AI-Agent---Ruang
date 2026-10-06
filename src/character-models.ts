/// <reference types="vite/client" />
import { useCallback, useEffect, useState } from 'react'

export interface CharacterModel { id: string; name: string; imageUrl: string; modelUrl: string }

const STORAGE_KEY = 'mc.agent-character-models'
const images = import.meta.glob('/models/*/profile-picture.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const models = import.meta.glob('/models/*/model.glb', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export function completeCharacterModels(imageAssets: Record<string, string>, modelAssets: Record<string, string>): CharacterModel[] {
  const ids = new Set(Object.keys(imageAssets).flatMap((path) => {
    const match = path.match(/^\/models\/([^/]+)\/profile-picture\.jpg$/)
    return match ? [match[1]] : []
  }))
  return [...ids].flatMap((id) => {
    const imagePath = `/models/${id}/profile-picture.jpg`
    const modelPath = `/models/${id}/model.glb`
    const imageUrl = imageAssets[imagePath]
    const modelUrl = modelAssets[modelPath]
    return imageUrl && modelUrl ? [{ id, name: id, imageUrl, modelUrl }] : []
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export const CHARACTER_MODELS = completeCharacterModels(images, models)

export function readAgentCharacterModels(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter(([agent, character]) => agent.length > 0 && typeof character === 'string' && character.trim().length > 0).map(([agent, character]) => [agent, (character as string).trim()]))
  } catch { return {} }
}

export function agentCharacterModel(agentId: string, catalog: CharacterModel[] = CHARACTER_MODELS): CharacterModel | undefined {
  const characterId = readAgentCharacterModels()[agentId]
  return catalog.find((character) => character.id === characterId)
}

export function saveAgentCharacterModel(agentId: string, characterId: string): void {
  if (!agentId) return
  const selections = readAgentCharacterModels()
  if (characterId.trim()) selections[agentId] = characterId.trim()
  else delete selections[agentId]
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections)) } catch { /* storage may be blocked */ }
  window.dispatchEvent(new Event('agent-character-model-change'))
}

export function useAgentCharacterModel(agentId: string): [CharacterModel | undefined, () => void] {
  const [selection, setSelection] = useState(() => agentCharacterModel(agentId))
  const refresh = useCallback(() => setSelection(agentCharacterModel(agentId)), [agentId])
  useEffect(refresh, [refresh])
  useEffect(() => {
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) refresh() }
    const onCharacterChange = () => refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener('agent-character-model-change', onCharacterChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('agent-character-model-change', onCharacterChange)
    }
  }, [refresh])
  return [selection, refresh]
}
