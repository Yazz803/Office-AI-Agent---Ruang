import { useEffect, useState } from 'react'
import { agentLook } from './agents.ts'
import { useAgentCharacterModel } from './character-models.ts'
import type { CSSProperties } from 'react'

export function PixelCharacter({ agent }: { agent: string }) {
  const look = agentLook(agent)
  const style = { '--hair': look.hair, '--skin': look.skin, '--shirt': look.shirt, '--pants': look.pants } as CSSProperties
  return <span className="pixel-character" style={style} aria-hidden="true"><span className="character-hair"/><span className="character-head"><i/><b/></span><span className="character-torso"/><span className="character-arm left"/><span className="character-arm right"/><span className="character-leg left"/><span className="character-leg right"/></span>
}

export function AgentCharacterAvatar({ agent }: { agent: string }) {
  const [model] = useAgentCharacterModel(agent)
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [model?.id])
  return model && !failed
    ? <img className="character-profile-image" src={model.imageUrl} alt="" onError={() => setFailed(true)}/>
    : <PixelCharacter agent={agent}/>
}
