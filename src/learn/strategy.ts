/**
 * Strategy guides for the Learn tab. This is the outline for a section that will
 * be written out in full in later sessions, so every guide is marked as a preview.
 */
export type GuideLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Guide {
  id: string
  title: string
  blurb: string
  level: GuideLevel
}

export const GUIDES: Guide[] = [
  { id: 'centre',      title: 'Control the centre',        blurb: 'Why the four middle squares matter, and how pawns and pieces fight for them.', level: 'Beginner' },
  { id: 'development', title: 'Develop with a purpose',    blurb: 'Bring every piece into the game quickly, and avoid moving the same piece twice.', level: 'Beginner' },
  { id: 'king-safety', title: 'King safety and castling',  blurb: 'When to castle, which side to choose, and how to spot a weakened king.', level: 'Beginner' },
  { id: 'structure',   title: 'Pawn structure',            blurb: 'Isolated, doubled, backward and passed pawns, and what each one means for your plans.', level: 'Intermediate' },
  { id: 'activity',    title: 'Piece activity and outposts', blurb: 'Put knights on strong squares, open lines for bishops and rooks, and avoid passive pieces.', level: 'Intermediate' },
  { id: 'files',       title: 'Open files and the seventh rank', blurb: 'How rooks take over the board once the pawns clear away.', level: 'Intermediate' },
  { id: 'planning',    title: 'How to find a plan',        blurb: 'A simple routine for quiet positions: weaknesses, improvements and your opponent\'s ideas.', level: 'Advanced' },
  { id: 'endgames',    title: 'Endgame essentials',        blurb: 'King activity, the opposition and the key pawn endings every player should know.', level: 'Intermediate' },
  { id: 'converting',  title: 'Converting an advantage',   blurb: 'How to turn a better position into a win without giving the opponent counterplay.', level: 'Advanced' },
]

/** The guide that has a worked preview in the mock-up. */
export const FEATURED_GUIDE = {
  id: 'centre',
  fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  marks: { d4: 'target', e4: 'target', d5: 'target', e5: 'target' } as Record<string, 'target'>,
  outline: [
    'Why the centre matters: pieces placed there reach more squares.',
    'Two ways to fight for it: occupy with pawns, or control from a distance.',
    'Common mistakes: grabbing the centre too early, or ignoring it altogether.',
  ],
} as const
