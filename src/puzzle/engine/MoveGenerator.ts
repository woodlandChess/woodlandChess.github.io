import { Board } from './Board';
import type { Color, Coordinate, Piece } from '../types/chess';

const KNIGHT_DELTAS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const ROOK_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const QUEEN_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];

/**
 * MoveGenerator encapsulates all chess movement rules: pseudo-legal move
 * generation per piece type, square-attack detection, and full legal-move
 * filtering (moves that would leave the mover's own king in check are
 * discarded). This is the single source of truth the UI consults, so a
 * player can never attempt an illegal move on the board.
 */
export class MoveGenerator {
  static pieceAttacksSquare(board: Board, from: Coordinate, piece: Piece, to: Coordinate): boolean {
    const dr = to.row - from.row;
    const dc = to.col - from.col;

    switch (piece.type) {
      case 'P': {
        const dir = piece.color === 'w' ? -1 : 1;
        return dr === dir && Math.abs(dc) === 1;
      }
      case 'N': {
        const adr = Math.abs(dr);
        const adc = Math.abs(dc);
        return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
      }
      case 'K':
        return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
      case 'R':
        if (dr !== 0 && dc !== 0) return false;
        return board.hasClearPath(from.row, from.col, to.row, to.col);
      case 'B':
        if (Math.abs(dr) !== Math.abs(dc)) return false;
        return board.hasClearPath(from.row, from.col, to.row, to.col);
      case 'Q':
        if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
        return board.hasClearPath(from.row, from.col, to.row, to.col);
      default:
        return false;
    }
  }

  static isSquareAttacked(board: Board, square: Coordinate, byColor: Color): boolean {
    let attacked = false;
    board.forEachPiece((piece, row, col) => {
      if (attacked || piece.color !== byColor) return;
      if (this.pieceAttacksSquare(board, { row, col }, piece, square)) {
        attacked = true;
      }
    });
    return attacked;
  }

  static pseudoLegalMoves(board: Board, from: Coordinate): Coordinate[] {
    const piece = board.get(from.row, from.col);
    if (!piece) return [];

    const moves: Coordinate[] = [];

    const tryStep = (row: number, col: number, captureOnly = false, quietOnly = false): boolean => {
      if (!Board.isInBounds(row, col)) return false;
      const target = board.get(row, col);
      if (target && target.color === piece.color) return false;
      if (captureOnly && !target) return false;
      if (quietOnly && target) return false;
      moves.push({ row, col });
      return !target;
    };

    switch (piece.type) {
      case 'P': {
        const dir = piece.color === 'w' ? -1 : 1;
        const startRank = piece.color === 'w' ? 6 : 1;
        if (Board.isInBounds(from.row + dir, from.col) && !board.get(from.row + dir, from.col)) {
          tryStep(from.row + dir, from.col, false, true);
          if (from.row === startRank && !board.get(from.row + 2 * dir, from.col)) {
            tryStep(from.row + 2 * dir, from.col, false, true);
          }
        }
        for (const dc of [-1, 1]) {
          const row = from.row + dir;
          const col = from.col + dc;
          if (Board.isInBounds(row, col) && board.get(row, col) && board.get(row, col)!.color !== piece.color) {
            tryStep(row, col, true, false);
          }
        }
        break;
      }
      case 'N':
        for (const [dr, dc] of KNIGHT_DELTAS) tryStep(from.row + dr, from.col + dc);
        break;
      case 'K':
        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) {
            if (dr === 0 && dc === 0) continue;
            tryStep(from.row + dr, from.col + dc);
          }
        }
        break;
      case 'R':
      case 'B':
      case 'Q': {
        const directions = piece.type === 'R' ? ROOK_DIRECTIONS : piece.type === 'B' ? BISHOP_DIRECTIONS : QUEEN_DIRECTIONS;
        for (const [dr, dc] of directions) {
          let row = from.row + dr;
          let col = from.col + dc;
          while (Board.isInBounds(row, col)) {
            const canContinue = tryStep(row, col);
            if (!canContinue) break;
            row += dr;
            col += dc;
          }
        }
        break;
      }
      default:
        break;
    }

    return moves;
  }

  static legalMoves(board: Board, from: Coordinate): Coordinate[] {
    const piece = board.get(from.row, from.col);
    if (!piece) return [];

    return this.pseudoLegalMoves(board, from).filter((to) => {
      const testBoard = board.clone();
      testBoard.set(to.row, to.col, testBoard.get(from.row, from.col));
      testBoard.set(from.row, from.col, null);

      const kingPos = piece.type === 'K' ? to : testBoard.findKing(piece.color);
      if (!kingPos) return true;

      const opponent: Color = piece.color === 'w' ? 'b' : 'w';
      return !this.isSquareAttacked(testBoard, kingPos, opponent);
    });
  }

  static isInCheck(board: Board, color: Color): boolean {
    const king = board.findKing(color);
    if (!king) return false;
    const opponent: Color = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(board, king, opponent);
  }

  static hasAnyLegalMove(board: Board, color: Color): boolean {
    let found = false;
    board.forEachPiece((piece, row, col) => {
      if (found || piece.color !== color) return;
      if (this.legalMoves(board, { row, col }).length > 0) found = true;
    });
    return found;
  }

  static isCheckmate(board: Board, color: Color): boolean {
    return this.isInCheck(board, color) && !this.hasAnyLegalMove(board, color);
  }

  static isStalemate(board: Board, color: Color): boolean {
    return !this.isInCheck(board, color) && !this.hasAnyLegalMove(board, color);
  }
}
