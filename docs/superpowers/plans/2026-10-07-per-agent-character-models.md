# Per-Agent Character Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow each agent to select a character independently, represented by its profile image in 2D and GLB model in 3D.

**Architecture:** Build a typed catalog from complete `models/<CharacterName>/` asset pairs and emit them as static assets. Store validated per-agent character ids in localStorage, expose one shared selector in both Agents and Office detail, and preserve existing procedural characters as runtime and missing-selection fallbacks.

**Tech Stack:** TypeScript, React, Vite, Three.js, React Three Fiber, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-07-per-agent-character-models-design.md`

## Global Constraints

- Use `models/<CharacterName>/profile-picture.jpg` and `models/<CharacterName>/model.glb` as the complete selectable pair.
- Selection is visual-only, per-agent, per-browser; it does not change Hermes configuration or AI model.
- Preserve existing procedural pixel and Three.js characters as fallbacks.
- Preserve movement, selection, state, privacy behavior, and agent identity.
- Add no runtime dependencies.

## Review Focus

- Character directory names containing spaces or punctuation: catalog ids and URLs remain valid and safe.
- Incomplete asset pairs: they are excluded without breaking the build/catalog.
- Malformed localStorage and stale character ids: ignored and fallback is used.
- GLB decode/load failure for one agent: only that agent falls back; the scene remains usable.
- Multiple agents using one character and switching 2D/3D: assets load and both views stay consistent without unnecessary repeated loading.

---

### Task 1: Build-time character catalog and selection persistence

**Files:**
- Create: `src/character-models.ts`
- Test: `src/character-models.test.ts`
- Modify: `vite.config.ts` only if asset discovery requires a narrowly scoped plugin/configuration change.
- Test/config: `vite.config.ts` or a focused build-catalog helper test, as dictated by Vite's supported asset glob behavior.

**Interfaces:**
- Produces `CharacterModel` with `id`, `name`, `imageUrl`, and `modelUrl` string fields.
- Produces `CHARACTER_MODELS: CharacterModel[]` from complete pairs only.
- Produces `readAgentCharacterModels(): Record<string, string>`, `agentCharacterModel(agentId: string): CharacterModel | undefined`, and `saveAgentCharacterModel(agentId: string, characterId: string): void`; empty character id clears the agent choice.
- Provides a safe lookup for any requested agent and character id; do not treat browser values as paths.

- [ ] **Step 1: Write failing tests** for catalog complete-pair inclusion and incomplete-pair exclusion using the actual `models/` fixture layout; selection defaults, isolation between two agent ids, valid save, reset, unknown id, malformed JSON, non-object data, and unavailable saved character.
- [ ] **Step 2: Run** `npx vitest run src/character-models.test.ts` and verify the tests fail because the module/API is absent.
- [ ] **Step 3: Implement** a Vite-supported static asset catalog for `models/*/profile-picture.jpg` and `models/*/model.glb`; intersect by directory id, derive display name from the directory basename, and export emitted URLs. Implement resilient localStorage parsing/writes using the `mc.agent-nicknames` conventions.
- [ ] **Step 4: Run** `npx vitest run src/character-models.test.ts`; verify all catalog/persistence cases pass. If Vite glob discovery cannot be isolated under Vitest, extract pure validation/resolution helpers and test those while verifying actual output in Task 5.
- [ ] **Step 5: Commit** this task's source and test files with message `feat: add character model catalog and preferences`.

### Task 2: Shared character selector on Agents and Office detail

**Files:**
- Create: `src/CharacterModelSelector.tsx`
- Test: `src/CharacterModelSelector.test.tsx`
- Modify: `src/pages/Agents.tsx`
- Modify: `src/pages/Office.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- `CharacterModelSelector` accepts `agentId: string` and optional `onChange?: () => void`; it reads the shared catalog/preference and persists changes.
- Selector offers a default/fallback option and every complete character pair.

- [ ] **Step 1: Write failing component tests** verifying option labels, saved selection initialization, selecting a character saves only that agent, and choosing fallback clears the choice.
- [ ] **Step 2: Run** `npx vitest run src/CharacterModelSelector.test.tsx`; verify failure before implementation.
- [ ] **Step 3: Implement** the accessible native `<label>`/`<select>` component, including clear/reset option and optional change notification for immediate refresh of consumers.
- [ ] **Step 4: Add the selector** to every agent card in `Agents.tsx` and the Overview tab of `OfficeDetail` in `Office.tsx`. Refresh local display state after changes without affecting nickname editing or locked-agent data.
- [ ] **Step 5: Add** focused styles consistent with current form/card controls; avoid layout changes unrelated to the selector.
- [ ] **Step 6: Run** `npx vitest run src/CharacterModelSelector.test.tsx src/office-detail.test.tsx src/office-dialog-focus.test.tsx`; verify selectors render in both entry points and existing dialog behavior passes.
- [ ] **Step 7: Commit** with message `feat: add per-agent character selector`.

### Task 3: Use selected images in 2D and GLB models in 3D

**Files:**
- Modify: `src/pages/Office.tsx`
- Modify: `src/pages/Office3D.tsx`
- Test: `src/office-detail.test.tsx`
- Test: focused renderer/helper tests as needed (for example `src/character-rendering.test.tsx`).

**Interfaces:**
- Reuse Task 1 `agentCharacterModel(agentId)` and `CharacterModel`.
- Keep `PixelCharacter` exported and unchanged as the fallback for current call sites/tests.

- [ ] **Step 1: Write failing renderer tests** for selected 2D image URL and error-to-pixel fallback; selected 3D asset resolution and loader-error-to-procedural fallback, using mocked loaders/components without WebGL.
- [ ] **Step 2: Run** the focused renderer tests and verify they fail before the renderer integration.
- [ ] **Step 3: Update 2D rendering** to show a labelled/accessible image for a valid selection and preserve `PixelCharacter` when selection is absent, invalid, or the image errors.
- [ ] **Step 4: Update 3D `Character`** to conditionally load the selected GLB using existing Three.js/R3F APIs. Keep the movement/root group and click interaction around the loaded scene; apply a local normalization wrapper based on loaded model bounds so varying model scales fit the existing character footprint. Do not alter office placements.
- [ ] **Step 5: Handle GLB loader errors per character** by switching only that character to the existing procedural mesh. Ensure loaded resources follow existing component lifecycle/disposal conventions and avoid mutating shared cached source scenes.
- [ ] **Step 6: Run** focused renderer tests and `npx vitest run src/office-detail.test.tsx src/office-dialog-focus.test.tsx`; verify fallback, interactions, and detail behavior.
- [ ] **Step 7: Commit** with message `feat: render selected characters in both office views`.

### Task 4: End-to-end validation and documentation

**Files:**
- Modify: `README.md` only if model directory conventions need user-facing documentation.
- Existing code/tests as required by actual test failures.

- [ ] **Step 1: Run** `npm run test`; fix only regressions caused by this feature and rerun.
- [ ] **Step 2: Run** `npm run lint`; resolve feature-related lint findings and rerun.
- [ ] **Step 3: Run** `npm run build`; verify Vite emits `profile-picture.jpg` and `model.glb` assets and catalog URLs reference emitted files.
- [ ] **Step 4: Inspect** the build manifest/output without committing generated build artifacts unless repository conventions require them.
- [ ] **Step 5: Commit** any documentation/verification-driven source changes with message `docs: document character model assets` when documentation changed.

## Self-review

- Spec coverage: asset discovery/complete pairs and emitted URLs (Task 1); local persistence and validation (Task 1); both selector entry points and reset (Task 2); image/GLB rendering and runtime failures (Task 3); no changes to agent identity/state/privacy (Tasks 2–3); complete test/lint/build verification (Task 4).
- Step scan: each step names a test, implementation boundary, command, or independently meaningful commit.
- Type consistency: Task 1 exports `CharacterModel`, `CHARACTER_MODELS`, `agentCharacterModel`, `readAgentCharacterModels`, and `saveAgentCharacterModel`; Task 2 selector receives `agentId`; Task 3 consumes `agentCharacterModel`.
- Review focus: directory URL encoding and completeness validated in Task 1; storage failures/staleness in Task 1; loading failure isolation in Task 3; shared selection and lazy model loading exercised in Tasks 2–3 and verified in Task 4.
- Proportion: four tasks split catalog/state, entry points, rendering, and final quality gates; no unrelated subsystems are introduced.
