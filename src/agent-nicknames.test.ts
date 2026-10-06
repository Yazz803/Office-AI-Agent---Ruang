// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAgentNickname, readAgentNicknames, saveAgentNickname } from './agent-nicknames.ts'

const storage = new Map<string, string>()
const localStorageStub = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value) },
  clear: () => storage.clear(),
}
Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageStub })

afterEach(() => localStorageStub.clear())

describe('agent nicknames', () => {
  it('notifies mounted views when a nickname changes', () => {
    const listener = vi.fn()
    window.addEventListener('agent-nickname-change', listener)
    saveAgentNickname('coder', 'Scribe')
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener('agent-nickname-change', listener)
  })

  it('saves and reads a trimmed nickname keyed by profile id', () => {
    saveAgentNickname('coder', '  Scribe  ')
    expect(readAgentNicknames()).toEqual({ coder: 'Scribe' })
  })

  it('removes a nickname when it is cleared', () => {
    saveAgentNickname('coder', 'Scribe')
    clearAgentNickname('coder')
    expect(readAgentNicknames()).toEqual({})
  })
})
