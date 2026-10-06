// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { completeCharacterModels, agentCharacterModel, readAgentCharacterModels, saveAgentCharacterModel } from './character-models.ts'

const storage = new Map<string, string>()
const localStorageStub = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value) },
  clear: () => storage.clear(),
}
Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageStub })
afterEach(() => localStorageStub.clear())

describe('character models', () => {

  it('includes only directories with both required assets', () => {
    expect(completeCharacterModels({
      '/models/Aster/profile-picture.jpg': 'image-a',
      '/models/Aster/model.glb': 'model-a',
      '/models/Bramble/profile-picture.jpg': 'image-b',
      '/models/Cinder/model.glb': 'model-c',
    }, {
      '/models/Aster/model.glb': 'model-a',
      '/models/Cinder/model.glb': 'model-c',
    })).toEqual([{ id: 'Aster', name: 'Aster', imageUrl: 'image-a', modelUrl: 'model-a' }])
  })

  it('notifies mounted views when a character selection changes', () => {
    const listener = vi.fn()
    window.addEventListener('agent-character-model-change', listener)
    saveAgentCharacterModel('default', 'Frieren')
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener('agent-character-model-change', listener)
  })

  it('stores choices independently for each agent and clears to the fallback', () => {
    saveAgentCharacterModel('default', 'Frieren')
    saveAgentCharacterModel('coder', 'Fern')
    expect(readAgentCharacterModels()).toEqual({ default: 'Frieren', coder: 'Fern' })
    expect(agentCharacterModel('default', [{ id: 'Frieren', name: 'Frieren', imageUrl: '/frieren.jpg', modelUrl: '/frieren.glb' }])?.id).toBe('Frieren')
    expect(agentCharacterModel('coder', [{ id: 'Frieren', name: 'Frieren', imageUrl: '/frieren.jpg', modelUrl: '/frieren.glb' }])).toBeUndefined()
    saveAgentCharacterModel('default', '')
    expect(readAgentCharacterModels()).toEqual({ coder: 'Fern' })
  })

  it('ignores malformed and non-object storage values', () => {
    localStorage.setItem('mc.agent-character-models', '{')
    expect(readAgentCharacterModels()).toEqual({})
    localStorage.setItem('mc.agent-character-models', '[]')
    expect(readAgentCharacterModels()).toEqual({})
    localStorage.setItem('mc.agent-character-models', JSON.stringify({ '': 'Frieren', valid: 7, other: ' Fern ' }))
    expect(readAgentCharacterModels()).toEqual({ other: 'Fern' })
  })
})
