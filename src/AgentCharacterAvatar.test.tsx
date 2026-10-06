// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { AgentCharacterAvatar } from './AgentCharacterAvatar.tsx'

const values = new Map<string, string>()
Object.defineProperty(window, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
} })

afterEach(() => values.clear())

describe('AgentCharacterAvatar', () => {
  it('renders the selected profile image and falls back to pixels when it errors', async () => {
    values.set('mc.agent-character-models', JSON.stringify({ default: 'Frieren' }))
    const host = document.body.appendChild(document.createElement('div'))
    const root = createRoot(host)
    await act(async () => { root.render(<AgentCharacterAvatar agent="default"/>); await Promise.resolve() })
    const image = host.querySelector<HTMLImageElement>('img')!
    expect(image.getAttribute('src')).toMatch(/profile-picture\.jpg/)
    await act(async () => { image.dispatchEvent(new Event('error')) })
    expect(host.querySelector('.pixel-character')).not.toBeNull()
    await act(async () => root.unmount())
    host.remove()
  })
})
