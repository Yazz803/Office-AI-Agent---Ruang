import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CommandAuditDetail } from './Logs.tsx'
import type { CommandLogEntry } from '../types.ts'

describe('CommandAuditDetail', () => {
  it('shows all audit entry fields in an accessible dialog', () => {
    const entry: CommandLogEntry = { at: '2026-10-07T10:00:00.000Z', command: 'hermes logs', ok: false, durationMs: 42, error: 'permission denied' }
    const markup = renderToStaticMarkup(<CommandAuditDetail entry={entry} onClose={vi.fn()}/> )

    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('hermes logs')
    expect(markup).toContain('permission denied')
    expect(markup).toContain('42 ms')
  })
})