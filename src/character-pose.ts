export interface CharacterPose { rotationX: number; positionY: number }

export function characterPose({ lying, onFloor, seated, height, talk, breathe }: { lying: boolean; onFloor: boolean; seated: boolean; height?: number; talk: number; breathe: number }): CharacterPose {
  return {
    rotationX: lying ? -Math.PI / 2 : 0,
    positionY: lying ? (height ?? 0.5) + 0.16 + breathe : (onFloor ? -0.5 : seated ? -0.14 : 0) + talk + breathe,
  }
}
