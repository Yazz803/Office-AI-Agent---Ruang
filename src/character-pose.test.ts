import { describe, expect, it } from 'vitest'
import { characterPose } from './character-pose.ts'

describe('character pose', () => {
  it('keeps lying and seated offsets local to the character body', () => {
    expect(characterPose({ lying: true, onFloor: false, seated: false, height: 0.5, talk: 0, breathe: 0 })).toEqual({ rotationX: -Math.PI / 2, positionY: 0.66 })
    expect(characterPose({ lying: false, onFloor: false, seated: true, talk: 0, breathe: 0 })).toEqual({ rotationX: 0, positionY: -0.14 })
    expect(characterPose({ lying: false, onFloor: true, seated: true, talk: 0.03, breathe: 0.01 })).toMatchObject({ rotationX: 0 })
    expect(characterPose({ lying: false, onFloor: true, seated: true, talk: 0.03, breathe: 0.01 }).positionY).toBeCloseTo(-0.46)
  })
})
