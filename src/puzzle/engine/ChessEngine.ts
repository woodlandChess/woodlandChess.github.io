import { Chess, type Square } from 'chess.js';
import type { Cell, Color, Coordinate } from '../types/chess';

/** Full rules facade for puzzle positions, including castling, en passant and promotion. */
export class ChessEngine {
  private game: Chess;

  constructor(fen: string) {
    this.game = new Chess(fen);
  }

  getCell(row: number, col: number): Cell {
    const piece = this.game.board()[row]?.[col];
    return piece ? { color: piece.color, type: piece.type.toUpperCase() as 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' } : null;
  }

  getLegalMoves(row: number, col: number): Coordinate[] {
    const square = ChessEngine.coordinateToSquare(row, col) as Square;
    return this.game.moves({ square, verbose: true }).map((move) => ChessEngine.squareToCoordinate(move.to));
  }

  isLegalDestination(from: Coordinate, to: Coordinate): boolean {
    return this.getLegalMoves(from.row, from.col).some((move) => move.row === to.row && move.col === to.col);
  }

  applyMove(from: Coordinate, to: Coordinate, promotion = 'q'): { captured: boolean; notation: string; uci: string } {
    const fromSquare = ChessEngine.coordinateToSquare(from.row, from.col) as Square;
    const toSquare = ChessEngine.coordinateToSquare(to.row, to.col) as Square;
    const move = this.game.move({ from: fromSquare, to: toSquare, promotion });
    return { captured: !!move.captured || move.flags.includes('e'), notation: move.san, uci: `${move.from}${move.to}${move.promotion ?? ''}` };
  }

  isInCheck(color: Color): boolean {
    return this.game.isCheck() && this.game.turn() === color;
  }

  isCheckmate(color: Color): boolean {
    return this.game.isCheckmate() && this.game.turn() === color;
  }

  isStalemate(color: Color): boolean {
    return this.game.isStalemate() && this.game.turn() === color;
  }

  static squareToCoordinate(square: string): Coordinate {
    return { row: 8 - Number(square[1]), col: square.charCodeAt(0) - 97 };
  }

  static coordinateToSquare(row: number, col: number): string {
    return `${String.fromCharCode(97 + col)}${8 - row}`;
  }
}
