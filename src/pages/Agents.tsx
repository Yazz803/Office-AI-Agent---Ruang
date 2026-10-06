import { useState } from 'react'
import { agentLabel } from '../format.ts'
import { saveAgentNickname, useAgentNicknames } from '../agent-nicknames.ts'
import type { OfficeSnapshot, RuntimeSnapshot } from '../types.ts'
import { usePolling } from '../polling.ts'
import { EmptyState, LoadingState, PageTitle, RuntimeBadge } from '../ui.tsx'
import { AgentCharacterAvatar } from '../AgentCharacterAvatar.tsx'
import { CharacterModelSelector } from '../CharacterModelSelector.tsx'

/** Every Hermes profile on this machine is an agent, plus OpenCode when it is installed. */
export function Agents({ runtime, pending = false }: { runtime: RuntimeSnapshot | null; pending?: boolean }) {
  const office = usePolling<OfficeSnapshot>('/api/office', 15_000)
  const nicknames = useAgentNicknames()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  if (pending) return <><PageTitle eyebrow="CREW" title="Agents"/><LoadingState message="Reading runtime details..."/></>
  if (!runtime || runtime.profiles.availability === 'unavailable') return <><PageTitle eyebrow="CREW" title="Agents"/><EmptyState title="Not Available">The Hermes profile list could not be read. Is <code>hermes</code> on the PATH of the server?</EmptyState></>
  const states = new Map(office.status === 'ready' ? office.data.stations.map((station) => [station.id, station]) : [])
  const openCode = runtime.openCode.availability === 'available' ? runtime.openCode.data : undefined
  const cards = [
    ...runtime.profiles.data.map((profile) => ({ id: profile.name, kind: 'Hermes profile', model: profile.model, gateway: profile.gateway })),
    ...(openCode ? [{ id: 'opencode', kind: 'OpenCode (CLI tool)', model: openCode, gateway: undefined }] : []),
  ]
  return <><PageTitle eyebrow="CREW" title="Agents">Every Hermes profile on this machine (from <code>hermes profile list</code>) is an agent{openCode ? ', plus OpenCode' : ''}. Nothing is configured by hand: new profiles appear here and in the office automatically.</PageTitle>
    <section className="agent-grid">{cards.map((card) => {
      const station = states.get(card.id)
      return <article className="agent-card" key={card.id}>
        <span className="folder-glyph"><AgentCharacterAvatar agent={card.id}/></span>
        <div className="agent-card-body">
          <h2>{station?.privacy === 'locked' ? '🔒 ' : ''}{nicknames[card.id] || agentLabel(card.id)}</h2>
          {card.kind === 'Hermes profile' && (editing === card.id ? <form className="agent-nickname-form" onSubmit={(event) => {
            event.preventDefault()
            saveAgentNickname(card.id, draft)
            setEditing(null)
          }}>
            <label>Nickname for {card.id}<input autoFocus maxLength={40} value={draft} onChange={(event) => setDraft(event.target.value)}/></label>
            <button type="submit">Save nickname</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </form> : <button type="button" className="text-button" aria-label={`Edit nickname for ${card.id}`} onClick={() => { setDraft(nicknames[card.id] ?? ''); setEditing(card.id) }}>Edit nickname</button>)}
          <p className="muted">{card.kind}</p>
          <CharacterModelSelector agentId={card.id}/>
          <dl>
            <div><dt>Model</dt><dd>{card.model}</dd></div>
            <div><dt>Gateway</dt><dd>{card.gateway ? <RuntimeBadge source={{ availability: 'available', data: card.gateway }}/> : <span className="muted">None (CLI tool)</span>}</dd></div>
            <div><dt>In the office</dt><dd>{station ? `${station.state}${station.activity ? ` · ${station.activity}` : ''}` : '—'}</dd></div>
          </dl>
        </div>
      </article>
    })}</section>
  </>
}
