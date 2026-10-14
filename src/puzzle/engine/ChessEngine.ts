import { Board } from './Board';
import { MoveGenerator } from './MoveGenerator';
import type { Cell, Color, Coordinate } from '../types/chess';

/**
 * ChessEngine is the public facade over the rules engine. Every legality
 * decision the UI makes (which squares are selectable, which destinations
 * are valid, whether a move delivers checkmate) is delegated here. Puzzle
 * data never determines legality by itself, it only determines whether a
 * legal move happens to match the intended solution line.
 */
export class ChessEngine {
  private board: Board;

  constructor(fen: string) {
    this.board = Board.fromFEN(fen);
  }

  getCell(row: number, col: number): Cell {
    return this.board.get(row, col);
  }

  getLegalMoves(row: number, col: number): Coordinate[] {
    return MoveGenerator.legalMoves(this.board, { row, col });
  }

  isLegalDestination(from: Coordinate, to: Coordinate): boolean {
    return this.getLegalMoves(from.row, from.col).some((m) => m.row === to.row && m.col === to.col);
  }

  applyMove(from: Coordinate, to: Coordinate): { captured: boolean } {
    const piece = this.board.get(from.row, from.col);
    const captured = !!this.board.get(to.row, to.col);
    this.board.set(to.row, to.col, piece);
    this.board.set(from.row, from.col, null);
    return { captured };
  }

  isInCheck(color: Color): boolean {
    return MoveGenerator.isInCheck(this.board, color);
  }

  isCheckmate(color: Color): boolean {
    return MoveGenerator.isCheckmate(this.board, color);
  }

  isStalemate(color: Color): boolean {
    return MoveGenerator.isStalemate(this.board, color);
  }

  static squareToCoordinate(square: string): Coordinate {
    return Board.algebraicToCoordinate(square);
  }

  static coordinateToSquare(row: number, col: number): string {
    return Board.coordinateToAlgebraic(row, col);
  }
}
