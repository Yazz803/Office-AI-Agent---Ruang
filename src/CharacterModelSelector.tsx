import { useAgentCharacterModel, CHARACTER_MODELS, saveAgentCharacterModel } from './character-models.ts'

export function CharacterModelSelector({ agentId, onChange }: { agentId: string; onChange?: () => void }) {
  const [model] = useAgentCharacterModel(agentId)
  const selection = model?.id ?? ''
  return <label className="character-model-selector">Character
    <select aria-label={`Character for ${agentId}`} value={selection} onChange={(event) => {
      saveAgentCharacterModel(agentId, event.target.value)
      onChange?.()
    }}>
      <option value="">Default character</option>
      {CHARACTER_MODELS.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
    </select>
  </label>
}
