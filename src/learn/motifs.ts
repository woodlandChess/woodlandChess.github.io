import type { Mark } from './MiniBoard'

/**
 * Tactics, mating patterns, traps and master games for the Learn tab.
 * Every diagram is checked by motifs.test.ts: the position is legal, every move of
 * every line is legal, and the claimed result (check, mate, material won, forced reply) is true.
 */
export type MotifGroup = 'core' | 'combo' | 'sacrifice' | 'endgame' | 'mate' | 'trap' | 'game'

/** Label of a move: its move number plus w (White) or b (Black), for example "17b" is 17...Be6. */
export interface Note { at: string; text: string }

export interface Motif {
  id: string
  name: string
  group: MotifGroup
  /** Another common name for the same pattern. */
  aka?: string
  /** One line a beginner can hold on to. */
  idea: string
  /** What to look for and why it works. */
  detail: string
  /** Start position of the diagram. Omitted for concept cards that have no diagram. */
  fen?: string
  /** Moves played from `fen`, in SAN. One move for a quick tactic, a whole line for a trap or a game. */
  line?: string[]
  /** Shown beside the board once the line is complete (or always, for a static diagram). */
  result?: string
  marks?: Record<string, Mark>
  arrows?: [string, string][]
  /** A diagram with nothing to play. */
  kind?: 'static'
  /** For concept cards: what to look for in your own games. */
  spot?: string[]
  /** For concept cards: where to see the idea in a diagram or game. */
  see?: string
  /** Who played it, where and when. */
  credit?: string
  /** Comments shown while stepping through a line. */
  notes?: Note[]
}

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const GROUPS: { id: MotifGroup; label: string; blurb: string }[] = [
  { id: 'core', label: 'Core tactics', blurb: 'The basic ways to attack two things at once or win loose material.' },
  { id: 'combo', label: 'Combinations', blurb: 'Forcing ideas that combine checks, captures and sacrifices.' },
  { id: 'sacrifice', label: 'Sacrifices', blurb: 'When giving up material is the strongest move.' },
  { id: 'endgame', label: 'Endgame tactics', blurb: 'Basic mates, stalemate, opposition and promotion tricks.' },
  { id: 'mate', label: 'Mating patterns', blurb: 'Named checkmates that every player should recognise.' },
  { id: 'trap', label: 'Opening traps', blurb: 'Short sequences where a natural move loses.' },
  { id: 'game', label: 'Master games', blurb: 'Famous games, played move by move with comments.' },
]

export const MOTIFS: Motif[] = [
 {
  "id": "fork",
  "name": "Fork",
  "group": "core",
  "idea": "One piece attacks two targets, and only one can be saved.",
  "detail": "Knights fork best because nothing can block their jump. Look for a safe square that touches the king and something valuable.",
  "fen": "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
  "result": "The knight checks the king and eyes the rook on a8. After the king steps away, Nxa8 wins it.",
  "marks": {
   "a8": "target",
   "e8": "target"
  },
  "arrows": [
   [
    "d5",
    "c7"
   ]
  ],
  "line": [
   "Nc7+"
  ]
 },
 {
  "id": "pin",
  "name": "Pin",
  "group": "core",
  "idea": "A piece cannot move because something worth more stands behind it.",
  "detail": "Against the king the pin is absolute: the pinned piece may not move at all. Attack it again and it usually falls.",
  "fen": "4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1",
  "result": "The pinned knight could not run or recapture, so the bishop simply takes it, with check.",
  "marks": {
   "c6": "pinned",
   "e8": "target"
  },
  "arrows": [
   [
    "b5",
    "e8"
   ]
  ],
  "line": [
   "Bxc6+"
  ]
 },
 {
  "id": "skewer",
  "name": "Skewer",
  "group": "core",
  "idea": "A pin in reverse: the valuable piece is in front and must step aside.",
  "detail": "Long-range pieces do the work. Force the front piece to move and take whatever stood behind it.",
  "fen": "r7/8/8/k7/8/8/8/1R2K3 w - - 0 1",
  "result": "The king must leave the a-file, and the rook on a8 is left with nothing to protect it.",
  "marks": {
   "a5": "target",
   "a8": "target"
  },
  "arrows": [
   [
    "b1",
    "a1"
   ]
  ],
  "line": [
   "Ra1+"
  ]
 },
 {
  "id": "discovery",
  "name": "Discovered attack",
  "group": "core",
  "idea": "Move one piece and a second one, hidden behind it, strikes.",
  "detail": "The moving piece can capture or threaten while the piece behind it gives check. The opponent can only answer one of them.",
  "fen": "3k4/5ppp/2q5/8/3N4/8/5PPP/3RK3 w - - 0 1",
  "result": "The knight takes the queen and uncovers the rook on the d-file: a double check, so the king has to move.",
  "marks": {
   "c6": "target",
   "d8": "target"
  },
  "arrows": [
   [
    "d4",
    "c6"
   ]
  ],
  "line": [
   "Nxc6+"
  ]
 },
 {
  "id": "double-check",
  "name": "Double check",
  "group": "core",
  "idea": "Two pieces give check at once, so the only answer is a king move.",
  "detail": "You cannot block or capture two checking pieces with one move. That makes a double check the most forcing move in chess, and it often decides the game.",
  "fen": "4k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1",
  "result": "The knight lands on d6 and uncovers the rook on the e-file. Nothing can capture or block both, so the king must run.",
  "marks": {
   "e8": "target"
  },
  "arrows": [
   [
    "e4",
    "d6"
   ],
   [
    "e1",
    "e8"
   ]
  ],
  "line": [
   "Nd6+"
  ]
 },
 {
  "id": "discovered-check",
  "name": "Discovered check",
  "group": "core",
  "idea": "A piece moves away and the one behind it gives check, while the mover does something else.",
  "detail": "The moving piece is free to capture or threaten anything, because the opponent must answer the check first. Queens are the usual victims.",
  "fen": "q3k3/8/8/8/4B3/8/8/4R1K1 w - - 0 1",
  "result": "The bishop takes the queen and the rook on the e-file gives check. Black must save the king, and the queen is already gone.",
  "marks": {
   "a8": "target",
   "e8": "target"
  },
  "arrows": [
   [
    "e4",
    "a8"
   ],
   [
    "e1",
    "e8"
   ]
  ],
  "line": [
   "Bxa8+"
  ]
 },
 {
  "id": "hanging",
  "name": "Hanging piece",
  "group": "core",
  "idea": "A piece with no defender can simply be taken.",
  "detail": "Before every move, ask what is unprotected on both sides. Loose pieces are the most common source of lost games below master level.",
  "fen": "3k4/8/8/4n3/8/8/4Q3/4K3 w - - 0 1",
  "line": [
   "Qxe5"
  ],
  "result": "The knight on e5 had no defender, so the queen simply takes it. Always check what is unprotected before you move.",
  "marks": {
   "e5": "target"
  },
  "arrows": [
   [
    "e2",
    "e5"
   ]
  ]
 },
 {
  "id": "double-attack",
  "name": "Double attack with a pawn",
  "group": "core",
  "idea": "A pawn move that attacks two pieces at once.",
  "detail": "Pawns are the cheapest forkers, because the opponent cannot answer by capturing a more valuable piece. Look for a pawn move that lands between two enemy pieces.",
  "fen": "4k3/8/3b1n2/8/4P3/3N4/8/4K3 w - - 0 1",
  "line": [
   "e5"
  ],
  "result": "The pawn attacks the bishop on d6 and the knight on f6, and the knight on d3 guards it. If Bxe5 Nxe5, White has won a bishop for a pawn.",
  "marks": {
   "d6": "target",
   "f6": "target"
  },
  "arrows": [
   [
    "e4",
    "e5"
   ]
  ]
 },
 {
  "id": "trapped-piece",
  "name": "Trapped piece",
  "group": "core",
  "idea": "A piece that is attacked and has no safe square is lost.",
  "detail": "Pieces on the rim, or ones that have grabbed a pawn deep in enemy territory, can run out of squares. Often the winning move is a quiet pawn move that takes away the last exit.",
  "spot": [
   "Count the safe squares of an enemy piece that is already attacked.",
   "Look for a pawn push that covers its last retreat.",
   "Beware of your own greedy captures, such as a bishop taking a rook pawn on the edge."
  ],
  "see": "The Noah's Ark trap in Opening traps is the classic example."
 },
 {
  "id": "xray",
  "name": "X-ray attack",
  "group": "core",
  "idea": "A piece attacks or defends a square through an enemy piece.",
  "detail": "A rook behind a queen on the same file still counts in an exchange. When the front piece moves or is traded, the piece behind it suddenly attacks the target. X-rays decide many exchanges.",
  "spot": [
   "Look behind the first piece on a file or diagonal.",
   "Count attackers and defenders including pieces standing behind others.",
   "A queen behind a rook, or two rooks doubled, is a battery."
  ],
  "see": "Windmill in the combinations group uses a bishop x-raying through its own rook."
 },
 {
  "id": "decoy",
  "name": "Decoy (attraction)",
  "group": "combo",
  "idea": "Lure an enemy piece to a square where it ruins its own position.",
  "detail": "A decoy is usually a sacrifice that the opponent must accept. The capturing piece ends up on a bad square, for example in front of its own king, and a second piece finishes the job.",
  "fen": "5r1k/6pp/8/3Q2N1/2B5/8/8/6K1 w - - 0 1",
  "line": [
   "Qg8+",
   "Rxg8",
   "Nf7#"
  ],
  "result": "The queen goes to g8 and Black must take it. The rook now fills g8, the knight arrives on f7, and the king is smothered. This is Philidor's legacy.",
  "marks": {
   "g8": "target",
   "h8": "target"
  },
  "arrows": [
   [
    "d5",
    "g8"
   ],
   [
    "g5",
    "f7"
   ]
  ],
  "aka": "Attraction"
 },
 {
  "id": "fork-check",
  "name": "Fork with check",
  "group": "combo",
  "idea": "A fork where one of the two targets is the king, so the other cannot be saved.",
  "detail": "Because the king must answer the check, the second target is lost for free. Queens and knights are the most common forkers.",
  "fen": "r5k1/6pp/8/8/8/8/8/3Q2K1 w - - 0 1",
  "result": "The queen checks the king on g8 and attacks the rook on a8 along the other diagonal. After the king moves, Qxa8 wins the rook.",
  "marks": {
   "g8": "target",
   "a8": "target"
  },
  "arrows": [
   [
    "d1",
    "d5"
   ]
  ],
  "line": [
   "Qd5+"
  ]
 },
 {
  "id": "pin-check",
  "name": "Pin with check",
  "group": "combo",
  "idea": "A check that leaves any blocker pinned to the king.",
  "detail": "When the only way to answer a check is to block, the blocker is instantly pinned along the same line. If your own pieces already attack the blocking square, it falls.",
  "fen": "4k3/8/2b5/8/8/8/3N4/R5K1 w - - 0 1",
  "result": "If Black blocks with Be4 the bishop is pinned to the king, and Nxe4 simply wins it. Black has to move the king instead.",
  "marks": {
   "e8": "target",
   "c6": "target"
  },
  "arrows": [
   [
    "a1",
    "e1"
   ]
  ],
  "line": [
   "Re1+"
  ]
 },
 {
  "id": "skewer-check",
  "name": "Skewer with check",
  "group": "combo",
  "idea": "The king is in front, so it must move, and the piece behind it is taken.",
  "detail": "A check that is also a skewer is hard to refuse: the king has to leave the line, and the piece it was shielding is exposed.",
  "fen": "4q3/3k4/8/8/8/8/8/5BK1 w - - 0 1",
  "result": "The bishop checks the king on d7 and the queen on e8 stands behind it. Whatever the king does, Bxe8 wins the queen for a bishop.",
  "marks": {
   "d7": "target",
   "e8": "target"
  },
  "arrows": [
   [
    "f1",
    "b5"
   ]
  ],
  "line": [
   "Bb5+"
  ]
 },
 {
  "id": "cross-check",
  "name": "Cross-check",
  "group": "combo",
  "idea": "Black answers a check by blocking with a check of its own.",
  "detail": "The blocking piece attacks the other king, so the first check loses its force. Look for it whenever you give a check along a line your opponent can reach.",
  "fen": "4k3/8/8/2np4/8/8/5K2/R7 w - - 0 1",
  "result": "Black blocks with Ne4+, a check of its own. The d5 pawn guards the knight, so Rxe4 dxe4 would lose the exchange and White has to move the king.",
  "marks": {
   "e8": "target",
   "f2": "target"
  },
  "arrows": [
   [
    "a1",
    "e1"
   ]
  ],
  "line": [
   "Re1+"
  ]
 },
 {
  "id": "windmill",
  "name": "Windmill",
  "group": "combo",
  "idea": "A rook and a bishop take turns giving discovered check and eating material.",
  "detail": "The rook sits next to the enemy king, protected by the bishop. Each time it steps away it uncovers a check, and each time it comes back it checks again. Row after row of pawns falls.",
  "fen": "5n1k/1p1p1pR1/8/8/8/8/1B6/K7 w - - 0 1",
  "result": "The rook takes f7 with a discovered check from the bishop. After Kg8, Rg7+ Kh8 repeats the pattern, and Rxd7+ and Rxb7+ follow.",
  "marks": {
   "h8": "target",
   "f7": "target"
  },
  "arrows": [
   [
    "b2",
    "h8"
   ],
   [
    "g7",
    "f7"
   ]
  ],
  "line": [
   "Rxf7+"
  ]
 },
 {
  "id": "perpetual",
  "name": "Perpetual check",
  "group": "combo",
  "idea": "A side that is losing can force a draw by checking forever.",
  "detail": "If the king has no shelter and the checks never run out, the position repeats and the game is drawn. It is the most important defensive resource in chess.",
  "fen": "7k/5Q2/5p1p/8/3r4/8/8/7K w - - 0 1",
  "result": "Black is up a rook, but the queen checks from f8, then f7, then f8 again. The king has only one square each time, so the position repeats and the game is drawn.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "f7",
    "f8"
   ]
  ],
  "line": [
   "Qf8+"
  ]
 },
 {
  "id": "mating-net",
  "name": "Mating net",
  "group": "combo",
  "idea": "A quiet move that leaves the king nowhere to go, so mate cannot be stopped.",
  "detail": "The key move is often not a check. It takes away the last escape squares and threatens mate in one, and every defence fails.",
  "fen": "5k2/8/5p1p/8/8/4R3/2Q5/7K w - - 0 1",
  "result": "Qg6 is not a check, but it traps the king on f8. Whether Black plays ...f5 or ...h5, Re8 is checkmate.",
  "marks": {
   "f8": "target"
  },
  "arrows": [
   [
    "c2",
    "g6"
   ]
  ],
  "line": [
   "Qg6"
  ]
 },
 {
  "id": "deflection",
  "name": "Deflection",
  "group": "combo",
  "idea": "Force a defender away from the job it is doing.",
  "detail": "The defender may be guarding a piece, a square, a back rank or a promotion square. Attack it or give it something it must capture, and the thing it protected falls.",
  "spot": [
   "Find the key defender of a target or a mating square.",
   "Ask what that piece must do if you attack it or offer it material.",
   "The sacrifice can be a pawn, a piece or even the queen."
  ],
  "see": "See Morphy's Opera Game, where Black's knights are pulled to the wrong squares."
 },
 {
  "id": "overloading",
  "name": "Overloading",
  "group": "combo",
  "idea": "A piece with two jobs cannot do both.",
  "detail": "If one piece defends two things, attack one of them, or capture one and recapture. The defender can only keep one promise.",
  "spot": [
   "List what each defender protects. Any piece with two duties is a candidate.",
   "Attack the first duty with a piece that forces the defender to react.",
   "Exchange pieces to remove the second defender."
  ],
  "see": "The back rank is the classic place to look for an overloaded rook or queen."
 },
 {
  "id": "remove-defender",
  "name": "Removing the defender",
  "group": "combo",
  "idea": "Take or trade the piece that protects your target.",
  "detail": "Instead of attacking the target again, capture the guard. If the guard cannot be taken, attack it so that it must move.",
  "spot": [
   "Identify which single piece defends the target.",
   "Exchange it, capture it, or chase it away.",
   "Then take the target, which is now loose."
  ],
  "see": "See the Opera Game: 13.Rxd7 removes a key defender with a deadly follow-up.",
  "aka": "Capturing the defender"
 },
 {
  "id": "interference",
  "name": "Interference",
  "group": "combo",
  "idea": "Put a piece on a line between two enemy pieces so they stop defending each other.",
  "detail": "The interposed piece cuts communication along a rank, file or diagonal. It works best when the piece is protected or when it comes with a threat.",
  "spot": [
   "Look for two enemy pieces that defend each other along a line.",
   "Find a square on that line where your piece is safe.",
   "Interference often adds to a pin or a mating threat."
  ],
  "see": "It is a common finishing blow against rooks that guard a back rank together."
 },
 {
  "id": "clearance",
  "name": "Clearance",
  "group": "combo",
  "idea": "Move a piece out of the way, often with tempo, so another piece can use the square or line.",
  "detail": "A clearance sacrifice removes your own piece from a key square or file. It is usually forcing, with a check or capture, so the opponent has no time to respond.",
  "spot": [
   "Find the square or line your attacking piece needs.",
   "Look for a forcing move that clears it.",
   "Check that the follow-up cannot be stopped."
  ],
  "see": "Discovered attacks are a special case of clearance."
 },
 {
  "id": "zwischenzug",
  "name": "Zwischenzug (intermezzo)",
  "group": "combo",
  "idea": "Insert a forcing move before making the expected recapture.",
  "detail": "Before recapturing or replying, ask whether a check, capture or threat first can improve the position. The opponent may have counted on the normal sequence.",
  "spot": [
   "Whenever the next move seems obvious, look for a check or a bigger threat first.",
   "Make sure the original capture or threat will still be there afterwards.",
   "Defenders use zwischenzugs too: check your opponent's in-between moves."
  ],
  "see": "See the Immortal Game, where White ignores material to keep making threats.",
  "aka": "In-between move"
 },
 {
  "id": "desperado",
  "name": "Desperado",
  "group": "combo",
  "idea": "A piece that is about to be lost captures as much as it can first.",
  "detail": "Both sides can use it. A doomed piece takes whatever is available before it dies, turning a lost piece into a trade or more. Count what each doomed piece can still capture.",
  "spot": [
   "Spot pieces that are attacked and cannot be saved.",
   "Look for captures available to them, even of protected pawns.",
   "Pick the capture that wins the most before the piece is lost."
  ]
 },
 {
  "id": "quiet-move",
  "name": "Quiet move",
  "group": "combo",
  "idea": "A move without check or capture that creates an unstoppable threat.",
  "detail": "Quiet moves are the hardest to see because they are not forcing. They often take away the last escape square or prepare a decisive follow-up that cannot be parried.",
  "spot": [
   "When you cannot find a forcing win, look for a move that improves a piece or takes away a square.",
   "Check every reply: if all lose, the quiet move is winning.",
   "A mating net is the classic quiet move."
  ],
  "see": "The Mating net card above is a quiet move that traps the king."
 },
 {
  "id": "attacking-f7",
  "name": "Attacking f2 and f7",
  "group": "combo",
  "idea": "The weakest points in the opening are defended only by the king.",
  "detail": "Before castling, f7 (for Black) and f2 (for White) have just one defender, the king. Early attacks by queen, bishop and knight aim there.",
  "spot": [
   "Watch the diagonal from c4 or b5 to f7 in the opening.",
   "A knight on g5 adds a second attacker.",
   "Do not go queen hunting without development, because the defender can win time."
  ],
  "see": "See Scholar's mate and Légal's trap for examples."
 },
 {
  "id": "greek-gift",
  "name": "Greek gift sacrifice",
  "group": "sacrifice",
  "idea": "Sacrifice a bishop on h7 to drag the king out and attack it.",
  "detail": "The idea works when a knight can follow to g5 with check and the queen can come to h5, and when Black has no knight on f6 to cover h7. Always calculate the defender's best replies before playing it.",
  "fen": "2r2rk1/pp1q1ppp/2n1pb2/3p4/8/3BPN2/PP3PPP/2RQ1RK1 w - - 0 1",
  "line": [],
  "result": "Typical setup: the bishop on d3 aims at h7, the knight on f3 can jump to g5, and the queen can reach h5. After Bxh7+ Kxh7 Ng5+ the king is exposed, but the bishop on f6 can still capture on g5, so here the idea needs careful calculation.",
  "marks": {
   "h7": "target",
   "g5": "target"
  },
  "arrows": [
   [
    "d3",
    "h7"
   ],
   [
    "f3",
    "g5"
   ]
  ],
  "aka": "Bxh7+ sacrifice",
  "kind": "static"
 },
 {
  "id": "queen-sacrifice",
  "name": "Queen sacrifice",
  "group": "sacrifice",
  "idea": "Give up the strongest piece to force a mate or win more material.",
  "detail": "Queen sacrifices are almost always forcing: each reply must be checked against the opponent's alternatives. They usually deflect a defender, smother the king, or open lines for a mating attack.",
  "spot": [
   "Count the forced replies. A true queen sacrifice leaves the opponent no real choice.",
   "Check that your remaining pieces can deliver mate or win back more.",
   "If any reply escapes, do not play it."
  ],
  "see": "See Philidor's legacy (Decoy), the Opera Game and the Réti-Tartakower game below."
 },
 {
  "id": "exchange-sacrifice",
  "name": "Exchange sacrifice",
  "group": "sacrifice",
  "idea": "Give up a rook for a minor piece to gain a lasting advantage.",
  "detail": "The rook is worth about two pawns more than a bishop or knight, so the player gives that up for something more valuable: a strong pawn structure, the initiative, or an attack. Petrosian made it a signature idea.",
  "spot": [
   "Ask whether a rook is blocked and a minor piece could take its place.",
   "Check whether the capture destroys the king shelter or pawn structure.",
   "Count your compensation: a pawn or two, and long-term pressure."
  ],
  "see": "See the Strategy tab guide on exchange sacrifices."
 },
 {
  "id": "positional-sacrifice",
  "name": "Pawn or piece sacrifice for the initiative",
  "group": "sacrifice",
  "idea": "Give up material for time, space and activity rather than a direct win.",
  "detail": "Gambits are the opening version. Positional sacrifices cost a pawn and buy a lead in development, open lines or a lasting pull. They are judged by what you get, not by an immediate forced line.",
  "spot": [
   "Compare activity, not only material.",
   "Make sure the opponent's king or pieces cannot easily consolidate.",
   "Return the material at the right moment if the initiative fades."
  ],
  "see": "See Anderssen's Immortal Game for an extreme example."
 },
 {
  "id": "kq-mate",
  "name": "Queen and king mate",
  "group": "endgame",
  "idea": "A queen and king drive the lone king to an edge and mate it.",
  "detail": "Use the queen to shrink the box, then bring the king up. Be careful of stalemate: always leave the enemy king at least one legal move before the final blow.",
  "fen": "7k/8/5K2/8/8/8/8/6Q1 w - - 0 1",
  "line": [
   "Qg7#"
  ],
  "result": "The king on f6 covers g6 and g7, and the queen mates on g7 with the king protecting her.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "g1",
    "g7"
   ]
  ]
 },
 {
  "id": "kr-mate",
  "name": "Rook and king mate",
  "group": "endgame",
  "idea": "A rook and king mate by cutting off the king rank by rank.",
  "detail": "The rook builds a wall, the king walks up to take the opposition, and the rook delivers the check along the edge.",
  "fen": "7k/8/6K1/8/8/8/8/R7 w - - 0 1",
  "line": [
   "Ra8#"
  ],
  "result": "The king on g6 takes away g7, g8 and h7, and the rook mates along the eighth rank.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "a1",
    "a8"
   ]
  ]
 },
 {
  "id": "kbb-mate",
  "name": "Two bishops mate",
  "group": "endgame",
  "idea": "Two bishops of opposite colours and a king can force mate.",
  "detail": "The bishops cut the board in halves, the king pushes the opponent to a corner, and one bishop delivers check along the long diagonal.",
  "fen": "7k/5K2/6B1/8/8/B7/8/8 w - - 0 1",
  "line": [
   "Bb2#"
  ],
  "result": "The bishop checks along the long diagonal, the other bishop covers h7, and the king covers g7 and g8.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "a3",
    "b2"
   ]
  ]
 },
 {
  "id": "kbn-mate",
  "name": "Bishop and knight mate",
  "group": "endgame",
  "idea": "The hardest basic mate: it must be done in the corner of the bishop's colour.",
  "detail": "It takes about thirty moves from a typical position. You have to drive the king into the right corner using the W manoeuvre of the knight. The final position looks like this.",
  "fen": "7k/5K2/8/6N1/8/B7/8/8 w - - 0 1",
  "line": [
   "Bb2#"
  ],
  "result": "The bishop checks on the long diagonal, the knight covers h7, and the king covers g7 and g8.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "a3",
    "b2"
   ]
  ]
 },
 {
  "id": "stalemate",
  "name": "Stalemate",
  "group": "endgame",
  "idea": "If the side to move has no legal move and is not in check, the game is drawn.",
  "detail": "Stalemate is the main defensive resource of a lost endgame, and the main way to throw away a won one. Here Black to move has no legal move: g7 and g8 are controlled and the king cannot move.",
  "fen": "7k/7P/6K1/8/8/8/8/8 b - - 0 1",
  "line": [],
  "marks": {
   "h8": "target"
  },
  "arrows": [],
  "kind": "static",
  "result": "Black to move has no legal move and is not in check, so the game is drawn."
 },
 {
  "id": "zugzwang",
  "name": "Zugzwang",
  "group": "endgame",
  "idea": "Every legal move makes your position worse, so the best move would be to pass.",
  "detail": "It is most common in king and pawn endings, but it also decides middlegames and rook endings. The side to move is forced to weaken something, give up the opposition or abandon a defended pawn.",
  "spot": [
   "Count the safe moves of the opponent. If every one loses something, a zugzwang is near.",
   "Use waiting moves and triangulation to pass the turn to the opponent.",
   "In pawn endings, the kings and the opposition usually decide who is in zugzwang."
  ],
  "see": "See the Strategy tab guides on the opposition and endgames.",
  "aka": "Mutual zugzwang"
 },
 {
  "id": "opposition",
  "name": "Opposition",
  "group": "endgame",
  "idea": "Kings facing each other with one square between them: the one who must move gives way.",
  "detail": "In king and pawn endings, taking the opposition lets your king step forward and escort the pawn. It is the basis of most pawn endgames.",
  "spot": [
   "Count the squares between the kings.",
   "If you can make the move that leaves an odd number between them, you have the opposition.",
   "The defender uses opposition to stay in front of the pawn."
  ],
  "aka": "Taking the opposition"
 },
 {
  "id": "underpromotion",
  "name": "Underpromotion",
  "group": "endgame",
  "idea": "Promote to a rook, bishop or knight when a queen would be worse.",
  "detail": "A queen can cause stalemate, and a knight can give check with a fork. Check every promotion piece before you choose.",
  "spot": [
   "Does a queen stalemate the opponent? Try a rook.",
   "Does a knight give check with a fork?",
   "Remember that the check from a knight cannot be blocked."
  ],
  "see": "See the Lasker trap in Opening traps for a knight promotion with check."
 },
 {
  "id": "back-rank",
  "name": "Back-rank mate",
  "group": "mate",
  "idea": "A king boxed in by its own pawns has no escape from a rook or queen.",
  "detail": "Before any trade, check whether your own back rank is covered. A single pawn move, a luft, removes the danger.",
  "fen": "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
  "result": "The rook reaches the back rank. The king cannot step forward through its own pawns.",
  "marks": {
   "g8": "target"
  },
  "arrows": [
   [
    "a1",
    "a8"
   ]
  ],
  "line": [
   "Ra8#"
  ]
 },
 {
  "id": "smothered",
  "name": "Smothered mate",
  "group": "mate",
  "idea": "The king is surrounded by its own pieces and a knight delivers the check.",
  "detail": "Knights are the only pieces that jump the cordon. Watch for a king in the corner hemmed in by a rook and pawns.",
  "fen": "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
  "result": "Every flight square holds a friendly piece and nothing can capture the knight.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "g5",
    "f7"
   ]
  ],
  "line": [
   "Nf7#"
  ]
 },
 {
  "id": "ladder",
  "name": "Ladder mate",
  "group": "mate",
  "idea": "Two rooks, or a queen and a rook, push the king to the edge one rank at a time.",
  "detail": "One rook cuts off a whole rank, and the other checks on the next. Like climbing a ladder, each rung takes away a row.",
  "fen": "6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1",
  "result": "The rook on a7 seals the seventh rank, so the rook on b8 checks and the king has no square left.",
  "marks": {
   "g8": "target"
  },
  "arrows": [
   [
    "b1",
    "b8"
   ]
  ],
  "line": [
   "Rb8#"
  ]
 },
 {
  "id": "arabian",
  "name": "Arabian mate",
  "group": "mate",
  "idea": "A rook and a knight corner the king, with the knight guarding the rook.",
  "detail": "The rook checks next to the king on the edge, the knight protects it and covers the escape square. It is one of the oldest mating patterns known.",
  "fen": "7k/R7/5N2/8/8/8/8/K7 w - - 0 1",
  "result": "The rook lands on h7, protected by the knight on f6, which also covers g8. The king cannot take the rook or move.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "a7",
    "h7"
   ]
  ],
  "line": [
   "Rh7#"
  ]
 },
 {
  "id": "anastasia",
  "name": "Anastasia's mate",
  "group": "mate",
  "idea": "A knight and a rook trap a king that is blocked by its own pawn.",
  "detail": "The knight takes away the escape squares on the edge file, the rook checks along the file, and the king's own pawn shuts the last door.",
  "fen": "8/4N1pk/8/8/8/8/8/K2R4 w - - 0 1",
  "result": "The knight on e7 covers g6 and g8, the pawn on g7 blocks the king, and the rook checks along the open h-file.",
  "marks": {
   "h7": "target"
  },
  "arrows": [
   [
    "d1",
    "h1"
   ]
  ],
  "line": [
   "Rh1#"
  ]
 },
 {
  "id": "boden",
  "name": "Boden's mate",
  "group": "mate",
  "idea": "Two bishops on crossing diagonals deliver mate to a king on the queenside.",
  "detail": "It usually appears after a queen sacrifice that pulls the defending pieces away. One bishop checks, the other covers the squares behind the king.",
  "fen": "2kr4/3p4/8/8/5B2/8/4B3/K7 w - - 0 1",
  "result": "The bishop on a6 checks along the diagonal. The bishop on f4 covers b8 and c7, and the king's own pieces block the rest.",
  "marks": {
   "c8": "target"
  },
  "arrows": [
   [
    "e2",
    "a6"
   ]
  ],
  "line": [
   "Ba6#"
  ]
 },
 {
  "id": "epaulette",
  "name": "Epaulette mate",
  "group": "mate",
  "idea": "The king is flanked by its own rooks, like shoulders wearing epaulettes.",
  "detail": "The two pieces beside the king take away its side squares. A queen or rook checking from the front then finishes it.",
  "fen": "3rkr2/8/8/8/8/8/Q7/K7 w - - 0 1",
  "result": "The queen checks on the e-file and covers d7, e7 and f7. The rooks on d8 and f8 box in their own king.",
  "marks": {
   "e8": "target"
  },
  "arrows": [
   [
    "a2",
    "e6"
   ]
  ],
  "line": [
   "Qe6#"
  ]
 },
 {
  "id": "hook",
  "name": "Hook mate",
  "group": "mate",
  "idea": "A rook, a knight and a pawn work together to mate a king on the edge.",
  "detail": "The knight guards the rook, and the pawn covers the squares the knight cannot reach. The king's own pawn finishes the cage.",
  "fen": "5N2/4R3/7k/5Pp1/8/8/8/K7 w - - 0 1",
  "result": "The rook is protected by the knight on f8. The knight and the f5 pawn cover g6, the rook covers g7 and the h-file, and the g5 pawn blocks the king.",
  "marks": {
   "h6": "target"
  },
  "arrows": [
   [
    "e7",
    "h7"
   ]
  ],
  "line": [
   "Rh7#"
  ]
 },
 {
  "id": "swallow",
  "name": "Swallow's tail mate",
  "group": "mate",
  "idea": "A queen sits directly in front of the king, supported, with the king's own pieces on both sides.",
  "detail": "The two flank squares are taken by the king's own pieces, and the queen, protected by another piece, covers the rest. It is also called the Guéridon mate.",
  "fen": "3rkr2/8/8/6B1/8/Q7/8/K7 w - - 0 1",
  "result": "The queen is protected by the bishop on g5, so the king cannot capture it. It covers d7 and f7, and its own rooks fill d8 and f8.",
  "marks": {
   "e8": "target"
  },
  "arrows": [
   [
    "a3",
    "e7"
   ]
  ],
  "line": [
   "Qe7#"
  ]
 },
 {
  "id": "scholar",
  "name": "Scholar's mate",
  "group": "mate",
  "aka": "Four-move mate",
  "idea": "A fast attack on f7, the weakest square in Black's camp at the start of the game.",
  "detail": "The queen and bishop aim at f7, where only the king defends. Beginners fall for it, and experienced players punish early queen raids.",
  "fen": "rnbqkb1r/ppp2ppp/8/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K2R w KQkq - 0 6",
  "result": "The queen takes f7, supported by the bishop on c4. This game went 1.e4 e5 2.Bc4 Nf6 3.Nf3 Nxe4 4.Nxe5 d6 5.Qf3 dxe5 6.Qxf7#.",
  "marks": {
   "f7": "target",
   "e8": "target"
  },
  "arrows": [
   [
    "f3",
    "f7"
   ]
  ],
  "line": [
   "Qxf7#"
  ]
 },
 {
  "id": "kiss",
  "name": "Kiss of death",
  "group": "mate",
  "aka": "Dovetail mate",
  "idea": "A queen next to the king, protected by a pawn, with no square left to run to.",
  "detail": "The queen steps next to the king and is guarded, so it cannot be taken. The king's own pieces block the squares behind it. It is also known as the dovetail pattern.",
  "fen": "r3kb1r/p4p1p/4P1pn/8/8/3Q4/PPP2PPP/R3K2R w KQ - 0 1",
  "result": "The queen is protected by the pawn on e6. The king cannot take it and has no flight square, because its own bishop and pawn fill f8 and f7.",
  "marks": {
   "e8": "target"
  },
  "arrows": [
   [
    "d3",
    "d7"
   ]
  ],
  "line": [
   "Qd7#"
  ]
 },
 {
  "id": "damiano",
  "name": "Damiano's mate",
  "group": "mate",
  "idea": "A queen mates on h7 with a pawn on g6 behind it.",
  "detail": "The pawn on g6 protects the queen, and the black pieces around the king block its own escape squares. It is named after the Portuguese master Pedro Damiano.",
  "fen": "5rk1/5p2/6P1/8/8/8/8/K6Q w - - 0 1",
  "result": "The queen lands on h7, protected by the pawn on g6. The rook on f8 and the pawn on f7 block the king's other squares.",
  "marks": {
   "g8": "target"
  },
  "arrows": [
   [
    "h1",
    "h7"
   ]
  ],
  "line": [
   "Qh7#"
  ]
 },
 {
  "id": "lolli",
  "name": "Lolli's mate",
  "group": "mate",
  "idea": "A queen mates on g7 with a pawn on f6 supporting it.",
  "detail": "The pawn on f6 guards the queen, so the king cannot capture it. The queen takes away g8 and h7 at the same time.",
  "fen": "7k/5p2/5P2/8/8/8/8/K5Q1 w - - 0 1",
  "result": "The queen lands on g7, protected by the pawn on f6. The king on h8 has no square left.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "g1",
    "g7"
   ]
  ],
  "line": [
   "Qg7#"
  ]
 },
 {
  "id": "opera",
  "name": "Opera mate",
  "group": "mate",
  "aka": "Morphy's mate",
  "idea": "A rook and a bishop mate a king boxed in by its own pawn, as in Morphy's Opera Game.",
  "detail": "The bishop guards the rook and takes away the diagonal escape. The rook checks along the back rank.",
  "fen": "4k3/5p2/8/6B1/8/8/8/K2R4 w - - 0 1",
  "result": "The rook is protected by the bishop on g5, which also covers e7. The pawn on f7 blocks the last square.",
  "marks": {
   "e8": "target"
  },
  "arrows": [
   [
    "d1",
    "d8"
   ]
  ],
  "line": [
   "Rd8#"
  ]
 },
 {
  "id": "anderssen",
  "name": "Anderssen's mate",
  "group": "mate",
  "idea": "A rook mates on the eighth rank from the corner, supported by a pawn.",
  "detail": "The pawn guards the rook, and the king guards the pawn, so the enemy king cannot capture anything. It is named after Adolf Anderssen.",
  "fen": "6k1/6P1/5K2/p7/8/8/8/7R w - - 0 1",
  "line": [
   "Rh8#"
  ],
  "result": "The rook checks on h8, protected by the pawn on g7. The pawn is guarded by the king on f6, and every other square is covered.",
  "marks": {
   "g8": "target"
  },
  "arrows": [
   [
    "h1",
    "h8"
   ]
  ]
 },
 {
  "id": "greco",
  "name": "Greco's mate",
  "group": "mate",
  "idea": "A bishop covers the escape square and a rook mates on the open file.",
  "detail": "The enemy king is trapped in the corner by its own pawn on g7. The bishop controls g8 and the rook delivers on the h-file. It is named after Gioachino Greco, an Italian master of the 1600s.",
  "fen": "7k/6p1/8/8/2B5/8/8/K3R3 w - - 0 1",
  "line": [
   "Rh1#"
  ],
  "result": "The bishop on c4 covers g8, the pawn on g7 blocks the king, and the rook mates along the h-file.",
  "marks": {
   "h8": "target"
  },
  "arrows": [
   [
    "e1",
    "h1"
   ]
  ]
 },
 {
  "id": "pillsbury",
  "name": "Pillsbury's mate",
  "group": "mate",
  "idea": "A bishop controls the corner and a rook mates on the open file.",
  "detail": "The enemy king sits in front of its own pieces. The bishop on the long diagonal takes away the corner, and the rook checks on the g-file. It is named after Harry Nelson Pillsbury.",
  "fen": "5rk1/5p1p/8/8/8/8/1B6/K2R4 w - - 0 1",
  "line": [
   "Rg1#"
  ],
  "result": "The bishop covers h8, the king's own rook and pawns block f8, f7 and h7, and the rook mates on the g-file.",
  "marks": {
   "g8": "target"
  },
  "arrows": [
   [
    "d1",
    "g1"
   ]
  ]
 },
 {
  "id": "fool",
  "name": "Fool's mate",
  "group": "mate",
  "idea": "The fastest possible checkmate: two moves.",
  "detail": "It only happens when White weakens the king with f3 and g4. The queen mates on h4.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "f3",
   "e5",
   "g4",
   "Qh4#"
  ],
  "result": "After 1.f3 e5 2.g4, the queen mates on h4 and the white king has no way out.",
  "marks": {},
  "arrows": [],
  "credit": "The shortest mate in chess"
 },
 {
  "id": "legal",
  "name": "Légal's mate",
  "group": "trap",
  "idea": "White sacrifices the queen and mates with minor pieces.",
  "detail": "Black pins the knight and grabs the queen, but the sacrifice on e5 opens the way for a bishop check and a knight mate. It is named after the French player Sire de Légal, who played it in the 1700s.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "e5",
   "Nf3",
   "d6",
   "Bc4",
   "Bg4",
   "Nc3",
   "g6",
   "Nxe5",
   "Bxd1",
   "Bxf7+",
   "Ke7",
   "Nd5#"
  ],
  "result": "After 5.Nxe5, Black takes the queen with Bxd1, but 6.Bxf7+ Ke7 7.Nd5 is checkmate.",
  "marks": {},
  "arrows": [],
  "credit": "Sire de Légal, Paris, about 1750",
  "notes": [
   {
    "at": "4w",
    "text": "Black has pinned the knight on f3 to the queen. White does not mind."
   },
   {
    "at": "5w",
    "text": "Nxe5! The knight takes a pawn and the bishop on g4 can capture the queen."
   },
   {
    "at": "6w",
    "text": "Bxf7+! Check, because the king has to answer."
   },
   {
    "at": "7w",
    "text": "Nd5#: the knight delivers mate with the bishop on f7 and the knight on e5 covering the rest."
   }
  ]
 },
 {
  "id": "elephant",
  "name": "Elephant trap",
  "group": "trap",
  "idea": "White grabs a pawn on d5, and Black wins the queen exchange with a pin.",
  "detail": "The knight on c3 is pinned to the bishop on g5 because the queen is behind it. After Nxd5? Nxd5 Bxd8, the check from b4 wins back more than a queen.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "d4",
   "d5",
   "c4",
   "e6",
   "Nc3",
   "Nf6",
   "Bg5",
   "Nbd7",
   "cxd5",
   "exd5",
   "Nxd5",
   "Nxd5",
   "Bxd8",
   "Bb4+",
   "Qd2",
   "Bxd2+",
   "Kxd2",
   "Kxd8"
  ],
  "result": "White wins a queen and a pawn but loses a knight, a queen and a bishop, so Black ends a piece ahead.",
  "marks": {},
  "arrows": [],
  "credit": "Queen's Gambit Declined",
  "notes": [
   {
    "at": "6w",
    "text": "Nxd5? looks like a free pawn, and the bishop on g5 appears to threaten the queen."
   },
   {
    "at": "7b",
    "text": "Bb4+! Black ignores the queen and gives a check that wins it back."
   },
   {
    "at": "9b",
    "text": "Kxd8: Black is a piece up."
   }
  ]
 },
 {
  "id": "noahs-ark",
  "name": "Noah's Ark trap",
  "group": "trap",
  "idea": "Black traps the white bishop with pawn moves on the queenside.",
  "detail": "After the central exchanges, White's queen is drawn out and the c-pawn and b-pawn close the bishop in. The bishop on b3 has no safe square.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "e5",
   "Nf3",
   "Nc6",
   "Bb5",
   "a6",
   "Ba4",
   "d6",
   "d4",
   "b5",
   "Bb3",
   "Nxd4",
   "Nxd4",
   "exd4",
   "Qxd4",
   "c5",
   "Qd5",
   "Be6",
   "Qc6+",
   "Bd7",
   "Qd5",
   "c4"
  ],
  "result": "The pawn on c4 attacks the bishop on b3, which is trapped behind its own pawns on a2 and c2.",
  "marks": {},
  "arrows": [],
  "credit": "Ruy Lopez, Open Defence",
  "notes": [
   {
    "at": "6w",
    "text": "Bb3 puts the bishop on a diagonal that Black can close."
   },
   {
    "at": "11b",
    "text": "c4! The pawn attacks the bishop, which has no retreat."
   }
  ]
 },
 {
  "id": "blackburne",
  "name": "Blackburne Shilling gambit",
  "group": "trap",
  "idea": "A queen sacrifice leads to a smothered mate if White grabs material.",
  "detail": "White takes a pawn on e5 and then f7, but the black queen captures on g2 and e4, and the knight mates on f3. It is named after the English master Joseph Blackburne.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "e5",
   "Nf3",
   "Nc6",
   "Bc4",
   "Nd4",
   "Nxe5",
   "Qg5",
   "Nxf7",
   "Qxg2",
   "Rf1",
   "Qxe4+",
   "Be2",
   "Nf3#"
  ],
  "result": "The knight on f3 gives mate. The bishop on e2 blocks the king and the pawn on g2 is gone.",
  "marks": {},
  "arrows": [],
  "credit": "Italian Game, Blackburne Shilling Gambit",
  "notes": [
   {
    "at": "3b",
    "text": "Nd4!? invites White to take on e5 and f7."
   },
   {
    "at": "7b",
    "text": "Nf3#: the knight finishes the game."
   }
  ]
 },
 {
  "id": "budapest",
  "name": "Budapest gambit trap (Kieninger)",
  "group": "trap",
  "idea": "Black gives a pawn in the opening and mates with a knight on d3.",
  "detail": "If White takes the bishop pawn with the wrong move, the knight jumps to d3 and mates the king in the middle of the board. It is named after the Kieninger trap.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "d4",
   "Nf6",
   "c4",
   "e5",
   "dxe5",
   "Ng4",
   "Bf4",
   "Nc6",
   "Nf3",
   "Bb4+",
   "Nbd2",
   "Qe7",
   "a3",
   "Ngxe5",
   "axb4",
   "Nd3#"
  ],
  "result": "White's king on e1 is pinned in by its own pieces. The knight checks from d3 and nothing can capture or block it.",
  "marks": {},
  "arrows": [],
  "credit": "Budapest Gambit, Kieninger trap",
  "notes": [
   {
    "at": "7w",
    "text": "a3? White offers to trade bishops, but this allows the knight to jump."
   },
   {
    "at": "8b",
    "text": "Nd3#: mate on the open e-file."
   }
  ]
 },
 {
  "id": "lasker-trap",
  "name": "Lasker trap",
  "group": "trap",
  "idea": "A knight promotion with check wins in the Albin Countergambit.",
  "detail": "White grabs a pawn and a bishop, and Black promotes a pawn to a knight on g1. A queen would not give check, but a knight does.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "d4",
   "d5",
   "c4",
   "e5",
   "dxe5",
   "d4",
   "e3",
   "Bb4+",
   "Bd2",
   "dxe3",
   "Bxb4",
   "exf2+",
   "Ke2",
   "fxg1=N+"
  ],
  "result": "The pawn promotes to a knight on g1 with check, which wins material. A queen on g1 would not give check.",
  "marks": {},
  "arrows": [],
  "credit": "Albin Countergambit, Lasker trap",
  "notes": [
   {
    "at": "7b",
    "text": "fxg1=N+!! The knight promotion is the point: it checks the king on e2."
   }
  ]
 },
 {
  "id": "opera-game",
  "name": "The Opera Game",
  "group": "game",
  "idea": "Morphy beats two amateur opponents in an opera box.",
  "detail": "A model of fast development, a pin, a sacrifice and a finishing queen sacrifice. Morphy played it in Paris in 1858 against the Duke of Brunswick and Count Isouard.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "e5",
   "Nf3",
   "d6",
   "d4",
   "Bg4",
   "dxe5",
   "Bxf3",
   "Qxf3",
   "dxe5",
   "Bc4",
   "Nf6",
   "Qb3",
   "Qe7",
   "Nc3",
   "c6",
   "Bg5",
   "b5",
   "Nxb5",
   "cxb5",
   "Bxb5+",
   "Nbd7",
   "O-O-O",
   "Rd8",
   "Rxd7",
   "Rxd7",
   "Rd1",
   "Qe6",
   "Bxd7+",
   "Nxd7",
   "Qb8+",
   "Nxb8",
   "Rd8#"
  ],
  "result": "Morphy gave up the queen, a rook and a knight, and mated with a rook after Black's pieces were pulled away.",
  "marks": {},
  "arrows": [],
  "credit": "Paul Morphy vs Duke of Brunswick and Count Isouard, Paris 1858",
  "notes": [
   {
    "at": "6w",
    "text": "Bc4 develops with a threat on f7."
   },
   {
    "at": "7w",
    "text": "Qb3 attacks f7 and b7 at once, a double attack."
   },
   {
    "at": "9w",
    "text": "Bg5! pins the knight on f6 to the queen on e7."
   },
   {
    "at": "10w",
    "text": "Nxb5!: a knight sacrifice that opens the b-file and the king."
   },
   {
    "at": "12w",
    "text": "Castling queenside brings the last rook into the attack."
   },
   {
    "at": "13w",
    "text": "Rxd7! removes a key defender and keeps the initiative."
   },
   {
    "at": "16w",
    "text": "Qb8+!!: the queen sacrifice. Black's knight must capture, and then the rook mates."
   },
   {
    "at": "17w",
    "text": "Rd8#: the knight on d7 was lured away, and the bishop on g5 covers the rest."
   }
  ]
 },
 {
  "id": "immortal",
  "name": "The Immortal Game",
  "group": "game",
  "idea": "Anderssen sacrifices a bishop, two rooks and the queen, and mates with three minor pieces.",
  "detail": "Played in a casual game in London in 1851. White gives up almost everything to attack the king, and each sacrifice keeps the initiative.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "e5",
   "f4",
   "exf4",
   "Bc4",
   "Qh4+",
   "Kf1",
   "b5",
   "Bxb5",
   "Nf6",
   "Nf3",
   "Qh6",
   "d3",
   "Nh5",
   "Nh4",
   "Qg5",
   "Nf5",
   "c6",
   "g4",
   "Nf6",
   "Rg1",
   "cxb5",
   "h4",
   "Qg6",
   "h5",
   "Qg5",
   "Qf3",
   "Ng8",
   "Bxf4",
   "Qf6",
   "Nc3",
   "Bc5",
   "Nd5",
   "Qxb2",
   "Bd6",
   "Bxg1",
   "e5",
   "Qxa1+",
   "Ke2",
   "Na6",
   "Nxg7+",
   "Kd8",
   "Qf6+",
   "Nxf6",
   "Be7#"
  ],
  "result": "White ends with just three minor pieces, but the black king is in a mating net.",
  "marks": {},
  "arrows": [],
  "credit": "Adolf Anderssen vs Lionel Kieseritzky, London 1851",
  "notes": [
   {
    "at": "2w",
    "text": "The King's Gambit: White gives a pawn for the f-file and quick development."
   },
   {
    "at": "5w",
    "text": "Bxb5 is another pawn sacrifice, offered for activity."
   },
   {
    "at": "11w",
    "text": "Rg1 ignores the attack on the bishop and prepares a brutal attack on the g-file."
   },
   {
    "at": "18w",
    "text": "Bd6!: White offers a rook, then more."
   },
   {
    "at": "19w",
    "text": "e5! shuts the black queen out of the defence."
   },
   {
    "at": "22w",
    "text": "Qf6+!! The queen sacrifice forces the knight to capture."
   },
   {
    "at": "23w",
    "text": "Be7#: mate with three minor pieces after giving up the queen and both rooks."
   }
  ]
 },
 {
  "id": "evergreen",
  "name": "The Evergreen Game",
  "group": "game",
  "idea": "Anderssen finishes a long attack with a double rook and queen sacrifice.",
  "detail": "Played in Berlin in 1852. White offers a pawn for development, then a series of forcing moves leaves Black's king stranded.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "e5",
   "Nf3",
   "Nc6",
   "Bc4",
   "Bc5",
   "b4",
   "Bxb4",
   "c3",
   "Ba5",
   "d4",
   "exd4",
   "O-O",
   "d3",
   "Qb3",
   "Qf6",
   "e5",
   "Qg6",
   "Re1",
   "Nge7",
   "Ba3",
   "b5",
   "Qxb5",
   "Rb8",
   "Qa4",
   "Bb6",
   "Nbd2",
   "Bb7",
   "Ne4",
   "Qf5",
   "Bxd3",
   "Qh5",
   "Nf6+",
   "gxf6",
   "exf6",
   "Rg8",
   "Rad1",
   "Qxf3",
   "Rxe7+",
   "Nxe7",
   "Qxd7+",
   "Kxd7",
   "Bf5+",
   "Ke8",
   "Bd7+",
   "Kf8",
   "Bxe7#"
  ],
  "result": "After the queen and a rook are given up, the bishop mates on e7.",
  "marks": {},
  "arrows": [],
  "credit": "Adolf Anderssen vs Jean Dufresne, Berlin 1852",
  "notes": [
   {
    "at": "4w",
    "text": "The Evans Gambit: a pawn offered for the centre and open lines."
   },
   {
    "at": "17w",
    "text": "Nf6+! pulls the pawn from g7 and opens the g-file."
   },
   {
    "at": "20w",
    "text": "Rxe7+!: the rook sacrifice removes the defender."
   },
   {
    "at": "21w",
    "text": "Qxd7+!! The queen sacrifice forces Kxd7."
   },
   {
    "at": "24w",
    "text": "Bxe7#: mate by a bishop."
   }
  ]
 },
 {
  "id": "reti-tartakower",
  "name": "Réti vs Tartakower",
  "group": "game",
  "idea": "A famous short game that ends in a double check and mate.",
  "detail": "Played in Vienna in 1910. Réti sacrifices his queen to drag the king to d8, then a double check and rook mate end the game in eleven moves.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "e4",
   "c6",
   "d4",
   "d5",
   "Nc3",
   "dxe4",
   "Nxe4",
   "Nf6",
   "Qd3",
   "e5",
   "dxe5",
   "Qa5+",
   "Bd2",
   "Qxe5",
   "O-O-O",
   "Nxe4",
   "Qd8+",
   "Kxd8",
   "Bg5+",
   "Ke8",
   "Rd8#"
  ],
  "result": "Black's king is dragged to d8, then forced back to e8, where Rd8 is mate.",
  "marks": {},
  "arrows": [],
  "credit": "Richard Réti vs Savielly Tartakower, Vienna 1910",
  "notes": [
   {
    "at": "9w",
    "text": "Qd8+!! The queen sacrifice forces the king to d8."
   },
   {
    "at": "10w",
    "text": "Bg5++ is a double check: from the bishop and from the rook on d1 down the file."
   },
   {
    "at": "11w",
    "text": "Rd8#: the rook mates, supported by the bishop."
   }
  ]
 },
 {
  "id": "game-of-century",
  "name": "The Game of the Century",
  "group": "game",
  "idea": "Thirteen-year-old Bobby Fischer sacrifices his queen against a master.",
  "detail": "Played in New York in 1956. Fischer found a series of moves, including a quiet bishop move, that made a queen sacrifice winning.",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "line": [
   "Nf3",
   "Nf6",
   "c4",
   "g6",
   "Nc3",
   "Bg7",
   "d4",
   "O-O",
   "Bf4",
   "d5",
   "Qb3",
   "dxc4",
   "Qxc4",
   "c6",
   "e4",
   "Nbd7",
   "Rd1",
   "Nb6",
   "Qc5",
   "Bg4",
   "Bg5",
   "Na4",
   "Qa3",
   "Nxc3",
   "bxc3",
   "Nxe4",
   "Bxe7",
   "Qb6",
   "Bc4",
   "Nxc3",
   "Bc5",
   "Rfe8+",
   "Kf1",
   "Be6",
   "Bxb6",
   "Bxc4+",
   "Kg1",
   "Ne2+",
   "Kf1",
   "Nxd4+",
   "Kg1",
   "Ne2+",
   "Kf1",
   "Nc3+",
   "Kg1",
   "axb6",
   "Qb4",
   "Ra4",
   "Qxb6",
   "Nxd1",
   "h3",
   "Rxa2",
   "Kh2",
   "Nxf2",
   "Re1",
   "Rxe1",
   "Qd8+",
   "Bf8",
   "Nxe1",
   "Bd5",
   "Nf3",
   "Ne4",
   "Qb8",
   "b5",
   "h4",
   "h5",
   "Ne5",
   "Kg7",
   "Kg1",
   "Bc5+",
   "Kf1",
   "Ng3+",
   "Ke1",
   "Bb4+",
   "Kd1",
   "Bb3+",
   "Kc1",
   "Ne2+",
   "Kb1",
   "Nc3+",
   "Kc1",
   "Rc2#"
  ],
  "result": "Fischer's knight and bishop attack, with a series of discovered checks, wins the game and ends with Rc2#.",
  "marks": {},
  "arrows": [],
  "credit": "Donald Byrne vs Bobby Fischer, New York 1956",
  "notes": [
   {
    "at": "11b",
    "text": "Na4!: Fischer wants to remove the knight on c3."
   },
   {
    "at": "17b",
    "text": "Be6!! offers the queen. White cannot take it without losing material."
   },
   {
    "at": "18w",
    "text": "Bxb6 takes the queen, but Fischer has a lot in return."
   },
   {
    "at": "20b",
    "text": "The knight starts a windmill, giving a discovered check from the bishop each time."
   },
   {
    "at": "41b",
    "text": "Rc2#: the rook delivers mate."
   }
  ]
 }
]
