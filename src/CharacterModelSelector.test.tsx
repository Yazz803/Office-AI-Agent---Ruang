// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { CharacterModelSelector } from './CharacterModelSelector.tsx'

const values = new Map<string, string>()
Object.defineProperty(window, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
  removeItem: (key: string) => { values.delete(key) },
  clear: () => values.clear(),
} })

afterEach(() => values.clear())

describe('CharacterModelSelector', () => {
  it('lists characters, saves selection for its agent, and resets to fallback', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = createRoot(host)
    await act(async () => { root.render(<CharacterModelSelector agentId="coder"/>); await Promise.resolve() })
    const select = host.querySelector('select')!
    expect(select).not.toBeNull()
    expect([...select.options].map((option) => option.textContent)).toEqual(['Default character', 'Frieren'])
    await act(async () => { select.value = 'Frieren'; select.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(JSON.parse(values.get('mc.agent-character-models')!)).toEqual({ coder: 'Frieren' })
    await act(async () => { select.value = ''; select.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(JSON.parse(values.get('mc.agent-character-models')!)).toEqual({})
    await act(async () => root.unmount())
    host.remove()
  })
})
