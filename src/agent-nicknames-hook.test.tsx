// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { saveAgentNickname, useAgentNicknames } from './agent-nicknames.ts'

const values = new Map<string, string>()
Object.defineProperty(window, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
} })
afterEach(() => { values.clear(); document.body.replaceChildren() })

function NicknameProbe() {
  const nicknames = useAgentNicknames()
  return <span>{nicknames.coder ?? 'coder'}</span>
}

describe('useAgentNicknames', () => {
  it('updates mounted consumers when a nickname is saved', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = createRoot(host)
    await act(async () => { root.render(<NicknameProbe/>); await Promise.resolve() })
    expect(host.textContent).toBe('coder')
    await act(async () => { saveAgentNickname('coder', 'Scribe') })
    expect(host.textContent).toBe('Scribe')
    await act(async () => root.unmount())
  })
})
