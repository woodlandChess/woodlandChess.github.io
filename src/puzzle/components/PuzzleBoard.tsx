import { useEffect, useRef, useState } from 'react';
import type { GameSnapshot } from '../core/GameEngine';
import { PIECE_SVGS } from '../../pieces';
import { useBoardFlip, type PieceGrid } from '../../boardAnimation';

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface PuzzleBoardProps {
  snapshot: GameSnapshot;
  onSelectSquare: (row: number, col: number) => void;
}

/**
 * Puzzle board. Renders the exact same markup and classes as the shared
 * ChessBoard (Computer / Online) - .board > button.square with in-square
 * rank/file labels, .target / .capture move markers - so all three modes
 * look and behave identically. Only puzzle-specific extras live here:
 * hint highlight, wrong-move shake and the checkmate overlay.
 */
export function PuzzleBoard({ snapshot, onSelectSquare }: PuzzleBoardProps) {
  const [shake, setShake] = useState(false);
  const animationRef = useBoardFlip(snapshot.board as PieceGrid, 'w');
  const dragRef = useRef<{ from: string; pointerId: number; image: HTMLImageElement; origin: DOMRect; pointerX: number; pointerY: number } | null>(null);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || snapshot.puzzleDone || snapshot.awaitingOpponent) return;
    const squareEl = (event.target as HTMLElement).closest<HTMLElement>('[data-square]');
    const from = squareEl?.dataset.square;
    if (!squareEl || !from) return;
    const row = 8 - Number(from[1]);
    const col = from.charCodeAt(0) - 97;
    const piece = snapshot.board[row]?.[col];
    if (!piece || piece.color !== snapshot.puzzle.turn) return;
    const image = squareEl.querySelector<HTMLImageElement>('.piece-svg');
    if (!image) return;
    dragRef.current = { from, pointerId: event.pointerId, image, origin: image.getBoundingClientRect(), pointerX: event.clientX, pointerY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || Math.hypot(event.clientX - drag.pointerX, event.clientY - drag.pointerY) < 6) return;
    event.preventDefault();
    const dx = event.clientX - drag.pointerX;
    const dy = event.clientY - drag.pointerY;
    Object.assign(drag.image.style, { position: 'fixed', left: `${drag.origin.left + dx}px`, top: `${drag.origin.top + dy}px`, width: `${drag.origin.width}px`, height: `${drag.origin.height}px`, zIndex: '10000', pointerEvents: 'none', transition: 'none', transform: 'scale(1.08)' });
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const moved = Math.hypot(event.clientX - drag.pointerX, event.clientY - drag.pointerY) >= 6;
    const target = moved ? document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]')?.dataset.square : undefined;
    Object.assign(drag.image.style, { position: '', left: '', top: '', width: '', height: '', zIndex: '', pointerEvents: '', transition: '', transform: '' });
    if (!target || target === drag.from) return;
    const parse = (s: string) => ({ row: 8 - Number(s[1]), col: s.charCodeAt(0) - 97 });
    const from = parse(drag.from);
    const to = parse(target);
    onSelectSquare(from.row, from.col);
    window.setTimeout(() => onSelectSquare(to.row, to.col), 0);
  }

  useEffect(() => {
    if (snapshot.feedback.type === 'wrong') {
      setShake(true);
      const t = window.setTimeout(() => setShake(false), 320);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [snapshot.feedback]);

  const isSelected = (r: number, c: number) =>
    snapshot.selected?.row === r && snapshot.selected?.col === c;
  const isPossible = (r: number, c: number) =>
    snapshot.legalDestinations.some((d) => d.row === r && d.col === c);
  const isHint = (r: number, c: number) =>
    snapshot.hintSquare?.row === r && snapshot.hintSquare?.col === c;

  return (
    <div className="board-wrap">
      <div
        ref={animationRef}
        className={`board${shake ? ' shake' : ''}`}
        role="grid"
        aria-label="Chess puzzle board"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((__, c) => {
            const cell = snapshot.board[r][c];
            const dark = (r + c) % 2 === 1;
            const squareName = `${FILE_LABELS[c]}${RANK_LABELS[r]}`;
            const classes = [
              'square',
              dark ? 'dark' : 'light',
              isSelected(r, c) ? 'selected' : '',
              isHint(r, c) ? 'hint-sq' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={squareName}
                type="button"
                role="gridcell"
                className={classes}
                data-square={squareName}
                aria-label={
                  cell
                    ? `${squareName} ${cell.color === 'w' ? 'white' : 'black'} ${cell.type.toLowerCase()}`
                    : squareName
                }
                onClick={() => onSelectSquare(r, c)}
              >
                {c === 0 && <small className="rank">{RANK_LABELS[r]}</small>}
                {r === 7 && <small className="file">{FILE_LABELS[c]}</small>}
                {cell && (
                  <img
                    className={`piece-svg piece-svg--${cell.color}`}
                    data-piece={`${cell.color}${cell.type.toLowerCase()}`}
                    src={PIECE_SVGS[cell.color][cell.type.toLowerCase()]}
                    alt={`${cell.color === 'w' ? 'white' : 'black'} ${cell.type.toLowerCase()}`}
                    draggable={false}
                  />
                )}
                {isPossible(r, c) && <span className={cell ? 'capture' : 'target'} />}
              </button>
            );
          }),
        )}
      </div>
      <div className={`mate-overlay${snapshot.puzzleDone ? ' show' : ''}`}>
        <div className="mate-overlay-inner">
          <div className="mate-overlay-icon">&#9812;</div>
          <div className="mate-overlay-text">Checkmate</div>
        </div>
      </div>
    </div>
  );
}
