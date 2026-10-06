# Per-Agent Character Models Design

## Goal

Let users choose a visual character independently for every agent in Ruang, with the same selection represented in both office views: a profile image in 2D and a GLB model in 3D.

## Agreed requirements

- Character assets are organized under `models/<CharacterName>/`.
- Each available character has `profile-picture.jpg` for 2D and `model.glb` for 3D.
- Users can change an agent's character from both the Agents page and that agent's Office detail dialog.
- Selections are independent per agent and persisted in the current browser, consistent with existing local preference patterns. They do not change Hermes profile configuration or the AI model used by the agent.
- If an agent has no explicit selection, or its saved character is no longer available, retain the existing generated character as fallback.
- Existing office behavior and agent identity/state remain unchanged.

## Architecture

Discover character pairs from `models/<CharacterName>/profile-picture.jpg` and `models/<CharacterName>/model.glb` at build time, expose their emitted URLs through a small typed catalog module, and ship those assets with the built UI. Only complete pairs are selectable. Character names are treated as asset identifiers, not filesystem paths supplied by users.

Store a validated `Record<agentId, characterId>` in browser localStorage. A shared selector/persistence module provides catalog lookup, selection lookup, and save/reset operations, so both entry points and renderers agree. Invalid or unavailable saved ids resolve to the existing procedural fallback rather than breaking rendering.

## Rendering and selection UI

- 2D agent representations use the selected character's `profile-picture.jpg` in place of the generated pixel character; without a valid selection, continue rendering the existing pixel character.
- 3D office characters load the selected `model.glb`; without a valid selection, continue rendering the existing procedural Three.js character.
- Keep current station animation, movement, selection, privacy behavior, and clickable interaction intact around the chosen 3D asset. Normalize model scale/orientation within the character wrapper rather than changing office layout.
- Add an accessible character selector and a reset-to-default choice on the Agents card and Office detail dialog. A change is immediately reflected in both views in the same browser.

## Asset loading and failure behavior

The build catalog includes only character directories containing both required files. Missing files are not selectable. If a GLB fails to load at runtime, render the existing procedural 3D character for that agent and allow the rest of the office to continue. Image load failure similarly falls back to the generated 2D character. Unknown/corrupt localStorage data is ignored safely. Large GLB files are emitted as static build assets and loaded only when needed by the selected 3D character; do not inline them into application code.

## Testing and acceptance

- Unit tests cover catalog completeness, selection persistence per agent, invalid/stale selections, reset behavior, and fallback resolution.
- Component tests verify selectors are available from both entry points and updating a choice persists the agent-specific value.
- Rendering tests verify 2D selected-image/fallback behavior and 3D selected-model/fallback behavior without requiring WebGL in unit tests.
- `npm run test`, `npm run lint`, and `npm run build` pass. Inspect build output to confirm model/image assets are emitted and the catalog references those assets.

## Scope and constraints

This feature changes visual representation only. It does not alter agent identity, nickname, runtime AI model, profile settings, privacy rules, or server API. Preferences remain per-browser rather than synchronized across browsers. Current generated character rendering remains the fallback. No new runtime dependency is required; use the existing Three.js and React Three Fiber stack.
