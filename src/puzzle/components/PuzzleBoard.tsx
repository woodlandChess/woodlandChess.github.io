import { useEffect, useRef, useState } from 'react';
import type { GameSnapshot } from '../core/GameEngine';
import { PIECE_SVGS } from '../../pieces';
import { suppressNextBoardAnimation, useBoardFlip, type PieceGrid } from '../../boardAnimation';
import { sound } from '../../sound';

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface PuzzleBoardProps {
  snapshot: GameSnapshot;
  onSelectSquare: (row: number, col: number) => void;
  onMoveSquares: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
  getLegalMoves: (row: number, col: number) => { row: number; col: number }[];
}

/**
 * Puzzle board. Renders the exact same markup and classes as the shared
 * ChessBoard (Computer / Online) - .board > button.square with in-square
 * rank/file labels, .target / .capture move markers - so all three modes
 * look and behave identically. Only puzzle-specific extras live here:
 * hint highlight, wrong-move shake and the checkmate overlay.
 */
export function PuzzleBoard({ snapshot, onSelectSquare, onMoveSquares, getLegalMoves }: PuzzleBoardProps) {
  const [shake, setShake] = useState(false);
  const animationRef = useBoardFlip(snapshot.board as PieceGrid, 'w');
  const dragRef = useRef<{ from: string; pointerId: number; image: HTMLImageElement; origin: DOMRect; pointerX: number; pointerY: number } | null>(null);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);   // true only once the piece really leaves its square
  const suppressClick = useRef(false);
  const dragTargets = dragFrom ? getLegalMoves(8 - Number(dragFrom[1]), dragFrom.charCodeAt(0) - 97) : [];

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || snapshot.puzzleDone || snapshot.awaitingOpponent) return;
    void sound.unlock();
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
    setDragFrom(from);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || Math.hypot(event.clientX - drag.pointerX, event.clientY - drag.pointerY) < 6) return;
    event.preventDefault();
    if (!dragMoved) setDragMoved(true);
    const dx = event.clientX - drag.pointerX;
    const dy = event.clientY - drag.pointerY;
    Object.assign(drag.image.style, { position: 'fixed', left: `${drag.origin.left + dx}px`, top: `${drag.origin.top + dy}px`, width: `${drag.origin.width}px`, height: `${drag.origin.height}px`, zIndex: '10000', pointerEvents: 'none', transition: 'none', transform: 'scale(1.08)' });
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const moved = Math.hypot(event.clientX - drag.pointerX, event.clientY - drag.pointerY) >= 6;
    const rect = animationRef.current?.getBoundingClientRect();
    const inside = !!rect && event.clientX >= rect.left && event.clientX < rect.right && event.clientY >= rect.top && event.clientY < rect.bottom;
    const target = moved && inside && rect
      ? `${FILE_LABELS[Math.min(7, Math.floor((event.clientX - rect.left) / (rect.width / 8)))]}${RANK_LABELS[Math.min(7, Math.floor((event.clientY - rect.top) / (rect.height / 8)))]}`
      : undefined;
    setDragFrom(null);
    setDragMoved(false);
    if (moved) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
    if (!target || target === drag.from) {
      Object.assign(drag.image.style, { position: '', left: '', top: '', width: '', height: '', zIndex: '', pointerEvents: '', transition: '', transform: '' });
      return;
    }
    const parse = (s: string) => ({ row: 8 - Number(s[1]), col: s.charCodeAt(0) - 97 });
    const from = parse(drag.from);
    const to = parse(target);
    suppressNextBoardAnimation(animationRef.current);
    onMoveSquares(from, to);
    Object.assign(drag.image.style, { position: '', left: '', top: '', width: '', height: '', zIndex: '', pointerEvents: '', transition: '', transform: '' });
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
        onContextMenu={e => e.preventDefault()}
        aria-label="Chess puzzle board"
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
              cell ? `has-piece piece-t-${cell.type.toLowerCase()}` : '',
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
                data-dragging={dragMoved && dragFrom === squareName ? '' : undefined}
                aria-label={
                  cell
                    ? `${squareName} ${cell.color === 'w' ? 'white' : 'black'} ${cell.type.toLowerCase()}`
                    : squareName
                }
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } void sound.unlock(); onSelectSquare(r, c); }}
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
                    decoding="sync"
                  />
                )}
                {(isPossible(r, c) || dragTargets.some(d => d.row === r && d.col === c)) && <span className={cell ? 'capture' : 'target'} />}
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
