import type { Color, PieceSymbol } from 'chess.js'
import { PIECE_SVGS } from '../pieces'

export interface AvatarPiece { color: Color; type: PieceSymbol }

/**
 * Player avatar drawn with the board's own piece artwork (same vector, same
 * ivory / steel tint). Replaces text glyphs like ♟ / ♛, whose shape and width
 * depend on whichever fallback font a device picks.
 */
export function PieceAvatar({ piece }: { piece: AvatarPiece }) {
  return (
    <img
      className={`piece-avatar piece-avatar--${piece.color}`}
      src={PIECE_SVGS[piece.color][piece.type]}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  )
}
