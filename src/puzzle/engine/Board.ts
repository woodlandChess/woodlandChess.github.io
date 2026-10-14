import type { BoardMatrix, Cell, Color, Coordinate, Piece } from '../types/chess';

export const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

/**
 * Board is a lightweight, immutable-friendly wrapper around an 8x8 matrix
 * of chess pieces. It knows how to parse itself from FEN, clone itself for
 * speculative move testing, and translate between algebraic squares
 * (e.g. "e4") and internal [row, col] coordinates.
 */
export class Board {
  private readonly matrix: BoardMatrix;

  constructor(matrix: BoardMatrix) {
    this.matrix = matrix;
  }

  static fromFEN(fen: string): Board {
    const matrix: BoardMatrix = Array.from({ length: 8 }, () => Array(8).fill(null) as Cell[]);
    const placement = fen.split(' ')[0];
    const rows = placement.split('/');

    rows.forEach((row, r) => {
      let c = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) {
          c += parseInt(ch, 10);
        } else {
          const color: Color = ch === ch.toUpperCase() ? 'w' : 'b';
          const type = ch.toUpperCase() as Piece['type'];
          matrix[r][c] = { color, type };
          c += 1;
        }
      }
    });

    return new Board(matrix);
  }

  static algebraicToCoordinate(square: string): Coordinate {
    const col = FILE_LABELS.indexOf(square[0] as (typeof FILE_LABELS)[number]);
    const row = 8 - parseInt(square[1], 10);
    return { row, col };
  }

  static coordinateToAlgebraic(row: number, col: number): string {
    return `${FILE_LABELS[col]}${8 - row}`;
  }

  static isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  get(row: number, col: number): Cell {
    return this.matrix[row][col];
  }

  set(row: number, col: number, piece: Cell): void {
    this.matrix[row][col] = piece;
  }

  clone(): Board {
    const copy: BoardMatrix = this.matrix.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
    return new Board(copy);
  }

  findKing(color: Color): Coordinate | null {
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = this.matrix[r][c];
        if (piece && piece.color === color && piece.type === 'K') {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  forEachPiece(callback: (piece: Piece, row: number, col: number) => void): void {
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = this.matrix[r][c];
        if (piece) callback(piece, r, c);
      }
    }
  }

  hasClearPath(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const dr = Math.sign(toRow - fromRow);
    const dc = Math.sign(toCol - fromCol);
    let r = fromRow + dr;
    let c = fromCol + dc;
    while (r !== toRow || c !== toCol) {
      if (this.matrix[r][c]) return false;
      r += dr;
      c += dc;
    }
    return true;
  }
}
