/**
 * Articles for the Lore tab: history, ratings, schools and engines.
 * Content is plain data so it can be proofread, tested and extended without touching UI code.
 */
export type LoreWidget = 'elo' | 'eval' | 'schools'

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'note'; text: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'widget'; id: LoreWidget }
  | { t: 'glossary' }
  | { t: 'board'; fen: string; caption: string; line?: string[]; marks?: Record<string, 'target' | 'from' | 'to' | 'pinned'>; arrows?: [string, string][] }

export interface Article {
  id: string
  /** Short category label shown above the title. */
  topic: string
  title: string
  summary: string
  blocks: Block[]
}

export const LORE: Article[] = [
  {
    "id": "words",
    "topic": "History",
    "title": "Where the words of chess come from",
    "summary": "Chess, check, checkmate and rook all travelled from Persia. Here is the story behind each name.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess is far older than the languages most of us play it in. It grew out of chaturanga, an Indian war game from around the 6th century. It travelled to Persia, where it became chatrang, and then spread across the Arabic world as shatranj. Much of the vocabulary we still use is a worn-down echo of Persian and Arabic."
      },
      {
        "t": "h",
        "text": "Chess and check"
      },
      {
        "t": "p",
        "text": "Shah is the Persian word for king. The king is the piece the whole game is about, so the game took its name from it, and the call \"Shah!\" warned that the king was under attack. The word passed through Arabic and Old French (eschec) into English as \"check\", while the plural \"eschecs\" wore down into \"chess\". Chess, check and checkmate all share one ancestor."
      },
      {
        "t": "h",
        "text": "Checkmate"
      },
      {
        "t": "p",
        "text": "Checkmate comes from the Persian phrase \"shah mat\". The second word is usually explained as \"helpless\" or \"defeated\", so the phrase says the king has no way out. A popular story says it means \"the king is dead\", because the Arabic word \"mata\" means \"he died\". Scholars still disagree about which sense came first, but both describe the same moment on the board: the game is over."
      },
      {
        "t": "h",
        "text": "Rook"
      },
      {
        "t": "p",
        "text": "Rook comes from the Persian \"rukh\". Its meaning is debated. One explanation links it to the chariot of the original Indian game. Another points to the roc, a giant bird of Persian and Arabic legend. European players had no use for either picture and imagined a tower instead, which is why the piece is \"torre\" in Spanish and Italian and \"tour\" in French. English kept the old Persian name and lost the meaning."
      },
      {
        "t": "h",
        "text": "The rest of the army"
      },
      {
        "t": "table",
        "head": [
          "Piece",
          "Original name",
          "Meaning",
          "What happened next"
        ],
        "rows": [
          [
            "King",
            "shah (Persian)",
            "king",
            "Kept its meaning in almost every language."
          ],
          [
            "Queen",
            "farzin, firz (Persian, Arabic)",
            "counsellor, vizier",
            "Became a queen in Europe. The modern, powerful queen move appeared in Spain and Italy around the 1470s."
          ],
          [
            "Rook",
            "rukh (Persian)",
            "chariot, or a giant bird",
            "Read as a tower in many European languages."
          ],
          [
            "Bishop",
            "al-fil (Arabic)",
            "elephant",
            "A bishop in English, a jester (fou) in French and a runner (Läufer) in German."
          ],
          [
            "Knight",
            "asp, faras (Persian, Arabic)",
            "horse",
            "A knight in Europe, though the piece still shows a horse."
          ],
          [
            "Pawn",
            "piyadah (Persian)",
            "foot soldier",
            "Reached English through Latin and Old French (peon, paon)."
          ]
        ]
      },
      {
        "t": "note",
        "text": "Dates and meanings here are simplified. Historians still argue about several of these origins, especially rook and checkmate."
      }
    ]
  },
  {
    "id": "timeline",
    "topic": "History",
    "title": "Chess through the centuries: a timeline",
    "summary": "From an Indian war game to a global online sport, in thirty landmarks.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess changed slowly for a thousand years and then very quickly. These are the dates that mattered most. Early dates are approximate, and historians still debate the details."
      },
      {
        "t": "table",
        "head": [
          "When",
          "What happened"
        ],
        "rows": [
          [
            "About 6th century",
            "Chaturanga, the ancestor of chess, is played in India with four kinds of units: infantry, cavalry, elephants and chariots."
          ],
          [
            "About 600 to 700",
            "The game reaches Persia as chatrang, where the call \"shah\" and the idea of checkmate are born."
          ],
          [
            "700s to 900s",
            "Arab players spread shatranj across the Islamic world and write the first strategy books."
          ],
          [
            "900s to 1000s",
            "Chess reaches Europe through Spain, Italy and the trade routes."
          ],
          [
            "About 1150 to 1200",
            "The Lewis chessmen are carved from walrus ivory. They were found on the Isle of Lewis in 1831."
          ],
          [
            "About 1475",
            "The queen and bishop gain their modern, long-range moves, in Spain and Italy. Chess becomes much faster."
          ],
          [
            "1561",
            "Ruy López publishes a book of chess analysis and gives his name to a famous opening."
          ],
          [
            "1749",
            "Philidor publishes his book on chess and teaches that pawns shape the game."
          ],
          [
            "1770",
            "Wolfgang von Kempelen shows the Mechanical Turk, a chess \"automaton\" that was secretly operated by a hidden player."
          ],
          [
            "1834 to 1843",
            "The famous matches between La Bourdonnais and McDonnell, and then Staunton and Saint-Amant, make chess a public sport."
          ],
          [
            "1849",
            "The Staunton pattern of pieces is introduced. It is still the standard design."
          ],
          [
            "1851",
            "The first international tournament is held in London and won by Adolf Anderssen."
          ],
          [
            "1858",
            "Paul Morphy beats the best players in Europe, then retires. The Opera Game is played the same year."
          ],
          [
            "1886",
            "Steinitz and Zukertort play the first match for the title now counted as World Champion."
          ],
          [
            "1924",
            "FIDE, the world chess federation, is founded in Paris."
          ],
          [
            "1927",
            "The first official Chess Olympiad is held in London. Vera Menchik wins the first Women's World Championship."
          ],
          [
            "1948",
            "Botvinnik wins the world title in a tournament organised by FIDE, starting the Soviet era."
          ],
          [
            "1970",
            "FIDE adopts Arpad Elo's rating system."
          ],
          [
            "1972",
            "Bobby Fischer beats Boris Spassky in Reykjavik and ends 24 years of Soviet champions."
          ],
          [
            "1985",
            "Garry Kasparov becomes World Champion at 22, the youngest at that time."
          ],
          [
            "1993",
            "Kasparov and his challenger leave FIDE, and the world title splits in two."
          ],
          [
            "1996 and 1997",
            "Kasparov beats the computer Deep Blue in 1996 and loses a rematch in 1997."
          ],
          [
            "2006",
            "Kramnik beats Topalov in a reunification match, and there is one champion again."
          ],
          [
            "2010",
            "Lichess, a free and open-source chess site, is started."
          ],
          [
            "2013",
            "Magnus Carlsen becomes World Champion. He holds the title for ten years."
          ],
          [
            "2017",
            "AlphaZero teaches itself chess in hours and beats Stockfish in a published match."
          ],
          [
            "2020",
            "Lockdowns and a hit TV series, The Queen's Gambit, trigger the biggest chess boom ever."
          ],
          [
            "2023",
            "Ding Liren becomes the first Chinese men's World Champion."
          ],
          [
            "2024",
            "Gukesh Dommaraju of India becomes the youngest undisputed World Champion, at 18."
          ]
        ]
      },
      {
        "t": "note",
        "text": "The 1475 date is a convenient marker. The modern queen and bishop spread through Europe over several decades, and not everywhere at once."
      }
    ]
  },
  {
    "id": "rules-evolution",
    "topic": "History",
    "title": "How the rules of chess evolved",
    "summary": "Why the queen is so strong, where castling and en passant came from, and what changed in modern times.",
    "blocks": [
      {
        "t": "p",
        "text": "The chess we play is not the chess of chaturanga. Almost every piece and rule has been tuned over centuries. The big changes came in a short burst in southern Europe around 1475, and some small ones came as late as the 1900s."
      },
      {
        "t": "table",
        "head": [
          "Piece or rule",
          "In the old game",
          "Today"
        ],
        "rows": [
          [
            "Queen",
            "Moved one square diagonally. A weak counsellor.",
            "Moves any distance in any direction. The strongest piece."
          ],
          [
            "Bishop",
            "Jumped exactly two squares diagonally, over pieces.",
            "Slides any distance along a diagonal."
          ],
          [
            "Pawn",
            "Always one step. Promoted only to a queen-like piece.",
            "Two steps on its first move, capture en passant, and promotion to a queen, rook, bishop or knight."
          ],
          [
            "King",
            "One square, no special move.",
            "One square, plus castling with a rook."
          ],
          [
            "Castling",
            "Did not exist. Kings leaped on their first move in some regions.",
            "A single move of king and rook, with several conditions."
          ],
          [
            "Stalemate",
            "Treated differently from place to place: a win, a loss or a draw.",
            "Always a draw in the standard rules."
          ],
          [
            "Draws",
            "Repetition and long games were not regulated.",
            "Threefold repetition, fifty-move rule and more."
          ]
        ]
      },
      {
        "t": "h",
        "text": "The mad queen"
      },
      {
        "t": "p",
        "text": "The new, powerful queen was called \"mad queen chess\" by later writers because it changed the character of the game so quickly. Attacks became faster and openings had to be rethought. Many historians link the new queen with the growth of the strong queens in Europe at the time, though the link is debated."
      },
      {
        "t": "h",
        "text": "Modern changes"
      },
      {
        "t": "ul",
        "items": [
          "The fifty-move rule, the touch-move rule and standard notation were all settled in the 1800s and early 1900s.",
          "Chess clocks first appeared in the 1800s. Digital clocks with increments came in the late 1900s.",
          "FIDE added the automatic fivefold repetition and seventy-five-move rules in 2014."
        ]
      }
    ]
  },
  {
    "id": "online",
    "topic": "History",
    "title": "Chess goes online",
    "summary": "From early bulletin boards to hundreds of millions of games a month.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess is perfect for the internet: the rules are short, games can be played at any time zone and the moves are easy to store. Online chess grew in stages."
      },
      {
        "t": "table",
        "head": [
          "Era",
          "What changed"
        ],
        "rows": [
          [
            "1980s to early 1990s",
            "Correspondence chess by post, e-mail and bulletin boards. The first internet servers appear."
          ],
          [
            "1992",
            "The Internet Chess Club opens. Grandmasters start to play blitz online."
          ],
          [
            "2000s",
            "Chess.com opens in 2007 and Playchess and others grow. Rating systems and live tournaments become standard."
          ],
          [
            "2010",
            "Lichess opens, entirely free and open-source, with no advertisements."
          ],
          [
            "2010s",
            "Streaming and online events make chess a spectator sport. Online tournaments feature top players in blitz and bullet."
          ],
          [
            "2020",
            "Lockdowns, a Netflix series and streaming bring tens of millions of new players. Online grandmaster events replace cancelled ones."
          ]
        ]
      },
      {
        "t": "h",
        "text": "How online chess differs"
      },
      {
        "t": "ul",
        "items": [
          "Faster time controls are popular. Bullet and blitz are more common than classical games.",
          "Ratings are separate on each site and between time controls, so they cannot be compared directly.",
          "Moves can be taken back in some casual modes but never in rated play.",
          "Engine cheating is the main challenge, so every site has fair-play teams and statistical detection."
        ]
      },
      {
        "t": "p",
        "text": "Woodland Chess uses Lichess for multiplayer games and for the puzzle database. Lichess publishes its games and puzzles openly, which is why apps like this one can build on them."
      }
    ]
  },
  {
    "id": "rules-basics",
    "topic": "Rules",
    "title": "The rules of chess on one page",
    "summary": "Setup, movement, check and checkmate.",
    "blocks": [
      {
        "t": "board",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "caption": "The starting position. White moves first, and a light square is always at each player's right-hand corner.",
        "marks": {},
        "arrows": []
      },
      {
        "t": "h",
        "text": "The goal"
      },
      {
        "t": "p",
        "text": "Checkmate the opponent's king. A king is in check when it is attacked. It is checkmate when the king is in check and there is no legal move to escape. The king is never captured; the game ends when it cannot be saved."
      },
      {
        "t": "h",
        "text": "How the pieces move"
      },
      {
        "t": "table",
        "head": [
          "Piece",
          "Moves",
          "Notes"
        ],
        "rows": [
          [
            "King",
            "One square in any direction.",
            "Cannot move into check. Can castle once."
          ],
          [
            "Queen",
            "Any number of squares in a straight line or diagonal.",
            "The strongest piece, worth about 9 pawns."
          ],
          [
            "Rook",
            "Any number of squares along a rank or file.",
            "About 5 pawns. Takes part in castling."
          ],
          [
            "Bishop",
            "Any number of squares diagonally.",
            "About 3 pawns. Stays on one colour."
          ],
          [
            "Knight",
            "An L-shape: two squares one way and one to the side.",
            "About 3 pawns. The only piece that jumps."
          ],
          [
            "Pawn",
            "Forward one square, or two on its first move. It captures diagonally forward.",
            "Promotes on the last rank. Can capture en passant."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Basic rules"
      },
      {
        "t": "ul",
        "items": [
          "Players alternate moves, White first, and a move is compulsory.",
          "You cannot make a move that leaves your own king in check.",
          "Pieces other than the knight cannot jump over other pieces.",
          "A piece captures by landing on an enemy piece, which is removed from the board.",
          "Pawns promote when they reach the far rank, and most players always choose a queen."
        ]
      }
    ]
  },
  {
    "id": "special-moves",
    "topic": "Rules",
    "title": "Castling, en passant and promotion",
    "summary": "The three special moves that confuse new players, with positions to try.",
    "blocks": [
      {
        "t": "h",
        "text": "Castling"
      },
      {
        "t": "p",
        "text": "Castling moves the king two squares toward a rook and puts the rook on the other side of the king. It is the only time two pieces move in one turn."
      },
      {
        "t": "board",
        "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
        "caption": "White can castle on either side: O-O (short) or O-O-O (long).",
        "marks": {
          "e1": "target",
          "g1": "target",
          "c1": "target"
        },
        "arrows": [
          [
            "e1",
            "g1"
          ],
          [
            "e1",
            "c1"
          ]
        ]
      },
      {
        "t": "ul",
        "items": [
          "Neither the king nor the rook has moved before.",
          "All squares between king and rook are empty.",
          "The king is not in check, does not pass through an attacked square and does not land in check."
        ]
      },
      {
        "t": "h",
        "text": "En passant"
      },
      {
        "t": "p",
        "text": "If a pawn moves two squares from its starting rank and lands next to an enemy pawn, that pawn may capture it as if it had moved one square. The option exists only on the next move."
      },
      {
        "t": "board",
        "fen": "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1",
        "caption": "Black has just played d7 to d5. White's pawn on e5 can capture en passant on d6.",
        "marks": {
          "d5": "target",
          "e5": "target",
          "d6": "to"
        },
        "arrows": [
          [
            "e5",
            "d6"
          ]
        ]
      },
      {
        "t": "h",
        "text": "Promotion"
      },
      {
        "t": "p",
        "text": "A pawn that reaches the last rank must become a queen, rook, bishop or knight of its own colour. The choice is free: you can have several queens. Promoting to a knight, called underpromotion, is sometimes the best move because of its fork or its check."
      }
    ]
  },
  {
    "id": "game-end",
    "topic": "Rules",
    "title": "Every way a game can end",
    "summary": "Wins, losses and the draws that surprise people.",
    "blocks": [
      {
        "t": "table",
        "head": [
          "Result",
          "How it happens"
        ],
        "rows": [
          [
            "Checkmate",
            "The king is in check and has no escape. The game is over at once."
          ],
          [
            "Resignation",
            "A player gives up. It is a normal and respectable way to end a lost game."
          ],
          [
            "Time",
            "A player runs out of time. In most rules the opponent wins, unless they cannot checkmate by any series of legal moves, which is a draw."
          ],
          [
            "Stalemate",
            "The player to move has no legal move but is not in check. It is a draw."
          ],
          [
            "Agreement",
            "Both players agree to a draw."
          ],
          [
            "Threefold repetition",
            "The same position occurs three times with the same player to move. A player may claim a draw."
          ],
          [
            "Fivefold repetition",
            "The same position occurs five times. The draw is automatic."
          ],
          [
            "Fifty-move rule",
            "Fifty moves by each side with no capture and no pawn move. A player may claim a draw."
          ],
          [
            "Seventy-five-move rule",
            "Seventy-five moves with no capture and no pawn move. The draw is automatic. If the last move is checkmate, it stands."
          ],
          [
            "Dead position",
            "No sequence of legal moves can lead to checkmate, for example king against king, or king and bishop against king."
          ]
        ]
      },
      {
        "t": "board",
        "fen": "7k/7P/6K1/8/8/8/8/8 b - - 0 1",
        "caption": "Stalemate: Black is not in check and has no legal move, so the game is drawn.",
        "marks": {
          "h8": "target"
        },
        "arrows": []
      },
      {
        "t": "p",
        "text": "Perpetual check is not a separate rule. It is a draw because the checks repeat a position, and the repetition rules apply. Online sites often handle draws a little differently, so check the rules of the site you play on."
      }
    ]
  },
  {
    "id": "etiquette",
    "topic": "Rules",
    "title": "Tournament rules and etiquette",
    "summary": "What changes when you sit across a real board.",
    "blocks": [
      {
        "t": "ul",
        "items": [
          "Touch-move: if you touch one of your pieces, you must move it, if it has a legal move. If you touch an enemy piece, you must capture it if you can.",
          "Say \"I adjust\" before you straighten a piece you do not intend to move.",
          "Shake hands before and after the game, and do not talk to the opponent about the game while it is in progress.",
          "Do not use phones or notes. Electronic devices are banned in most events.",
          "Write every move on a scoresheet, unless there is little time left.",
          "Press the clock with the hand that made the move.",
          "An illegal move is penalised, with the clock time added to the opponent in standard events. In blitz it is often an immediate loss.",
          "Offer a draw only after making your move, and before you press the clock."
        ]
      },
      {
        "t": "p",
        "text": "Rules are enforced by an arbiter. If something goes wrong, stop the clock and ask for the arbiter. Calling the arbiter is a normal and respected act, not an accusation."
      }
    ]
  },
  {
    "id": "openings-intro",
    "topic": "Openings",
    "title": "What is an opening? ECO codes and families",
    "summary": "How the first moves are organised, and how to choose a repertoire.",
    "blocks": [
      {
        "t": "p",
        "text": "The opening is the first phase of the game, in which players develop pieces and fight for the centre. Some opening lines are analysed for twenty moves or more. Strong players keep a repertoire, which is a set of openings they know well."
      },
      {
        "t": "h",
        "text": "ECO codes"
      },
      {
        "t": "p",
        "text": "The Encyclopaedia of Chess Openings classifies every opening with a letter and two digits, such as B12 or C42. The five letters give a quick map of the whole opening world."
      },
      {
        "t": "table",
        "head": [
          "Letter",
          "Family",
          "Examples"
        ],
        "rows": [
          [
            "A",
            "Flank openings and irregular first moves",
            "English, Réti, Dutch, Bird, 1.d4 with unusual replies"
          ],
          [
            "B",
            "Semi-open games: 1.e4 without 1...e5 or 1...e6",
            "Sicilian, Caro-Kann, Pirc, Scandinavian, Alekhine"
          ],
          [
            "C",
            "Open games (1.e4 e5) and the French",
            "Ruy Lopez, Italian, King's Gambit, Petroff, French"
          ],
          [
            "D",
            "Closed games and semi-closed games: 1.d4 d5",
            "Queen's Gambit, Slav, Semi-Slav, Grünfeld"
          ],
          [
            "E",
            "Indian defences: 1.d4 Nf6 with ...g6 or ...e6",
            "King's Indian, Nimzo-Indian, Queen's Indian"
          ]
        ]
      },
      {
        "t": "h",
        "text": "Choosing what to play"
      },
      {
        "t": "ul",
        "items": [
          "Pick a few lines that fit your style and learn the ideas and typical plans, not only the moves.",
          "Learn one reply to each of the common first moves: 1.e4, 1.d4, 1.c4 and 1.Nf3.",
          "Understand why a line works. You will remember it better and you can handle surprises.",
          "Review your games to find where you left your knowledge."
        ]
      },
      {
        "t": "note",
        "text": "The best opening is the one you understand. At club level, knowing what to do after the first ten moves is worth more than knowing what to do in the first ten."
      }
    ]
  },
  {
    "id": "openings-e4",
    "topic": "Openings",
    "title": "Openings after 1.e4",
    "summary": "Open games and semi-open games, with the positions that define them.",
    "blocks": [
      {
        "t": "p",
        "text": "1.e4 opens lines for the queen and bishop at once and leads to open, tactical play. It is the most common first move at beginner level, and it is the favourite of many attacking players."
      },
      {
        "t": "board",
        "fen": "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        "caption": "Ruy López: 1.e4 e5 2.Nf3 Nc6 3.Bb5. White pressures the knight that defends e5. The oldest named opening.",
        "marks": {
          "b5": "target"
        },
        "arrows": [
          [
            "f1",
            "b5"
          ]
        ],
        "line": [
          "e4",
          "e5",
          "Nf3",
          "Nc6",
          "Bb5"
        ]
      },
      {
        "t": "board",
        "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        "caption": "Italian Game: 3.Bc4. The bishop aims at f7. It is a natural choice for beginners and also played at the top level.",
        "marks": {
          "c4": "target"
        },
        "arrows": [
          [
            "f1",
            "c4"
          ]
        ],
        "line": [
          "e4",
          "e5",
          "Nf3",
          "Nc6",
          "Bc4"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2",
        "caption": "King's Gambit: 1.e4 e5 2.f4. White offers a pawn for fast development and the open f-file. A favourite of Romantic masters.",
        "marks": {
          "f4": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "e5",
          "f4"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        "caption": "Sicilian Defence: 1.e4 c5. Black fights for the centre with a flank pawn. The most popular reply to 1.e4 and the source of many sharp lines.",
        "marks": {
          "c5": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "c5"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
        "caption": "French Defence: 1.e4 e6 2.d4 d5. Black builds a solid pawn chain and counterattacks the white centre.",
        "marks": {
          "d5": "target",
          "e6": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "e6",
          "d4",
          "d5"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
        "caption": "Caro-Kann Defence: 1.e4 c6 2.d4 d5. Solid like the French, but the light-squared bishop is not blocked in.",
        "marks": {
          "c6": "target",
          "d5": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "c6",
          "d4",
          "d5"
        ]
      },
      {
        "t": "board",
        "fen": "rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",
        "caption": "Scandinavian Defence: 1.e4 d5 2.exd5 Qxd5. Black challenges the centre at once and accepts an early queen move.",
        "marks": {
          "d5": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "d5",
          "exd5",
          "Qxd5"
        ]
      },
      {
        "t": "p",
        "text": "Other important replies to 1.e4 are the Pirc and Modern defences, the Alekhine Defence and the Petroff Defence (1...e5 2.Nf3 Nf6)."
      }
    ]
  },
  {
    "id": "openings-d4",
    "topic": "Openings",
    "title": "Openings after 1.d4, 1.c4 and 1.Nf3",
    "summary": "Closed games and the Indian defences, with the positions that define them.",
    "blocks": [
      {
        "t": "p",
        "text": "1.d4 controls e5 and leads to slower, more strategic play than 1.e4. Pawn structure and piece placement matter more than early tactics."
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        "caption": "Queen's Gambit: 1.d4 d5 2.c4. White offers a pawn to deflect Black's centre pawn. If Black takes it, White gets the centre back. Not a real gambit.",
        "marks": {
          "c4": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "d5",
          "c4"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
        "caption": "Slav Defence: 2...c6. Black supports d5 and keeps the bishop on c8 free to develop outside the pawn chain.",
        "marks": {
          "c6": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "d5",
          "c4",
          "c6"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
        "caption": "London System: 1.d4 d5 2.Bf4. A flexible setup that White can play against almost anything. Popular at club level.",
        "marks": {
          "f4": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "d5",
          "Bf4",
          "Nf6",
          "e3"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
        "caption": "King's Indian Defence: 1...Nf6 2.c4 g6 3.Nc3 Bg7. Black lets White build a centre and attacks it later. A favourite of attackers such as Kasparov and Fischer.",
        "marks": {
          "g7": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "Nf6",
          "c4",
          "g6",
          "Nc3",
          "Bg7"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
        "caption": "Nimzo-Indian Defence: 3...Bb4. The bishop pins the knight and fights for e4. A very solid, respected defence.",
        "marks": {
          "b4": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "Nf6",
          "c4",
          "e6",
          "Nc3",
          "Bb4"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
        "caption": "Grünfeld Defence: 3...d5. Black hits the centre at once and plays against the white centre with pieces.",
        "marks": {
          "d5": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "Nf6",
          "c4",
          "g6",
          "Nc3",
          "d5"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
        "caption": "Dutch Defence: 1.d4 f5. Black controls e4 and aims for an attack on the kingside.",
        "marks": {
          "f5": "target"
        },
        "arrows": [],
        "line": [
          "d4",
          "f5"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1",
        "caption": "English Opening: 1.c4. A flexible flank opening that can transpose into 1.d4 positions or become its own game.",
        "marks": {
          "c4": "target"
        },
        "arrows": [],
        "line": [
          "c4"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2",
        "caption": "Réti Opening: 1.Nf3 d5 2.c4. A hypermodern classic: control the centre from a distance with pieces and flank pawns.",
        "marks": {
          "c4": "target"
        },
        "arrows": [],
        "line": [
          "Nf3",
          "d5",
          "c4"
        ]
      }
    ]
  },
  {
    "id": "gambits",
    "topic": "Openings",
    "title": "Gambits: sacrificing for the initiative",
    "summary": "Why players offer a pawn in the opening, and the most famous gambits.",
    "blocks": [
      {
        "t": "p",
        "text": "A gambit offers material, usually a pawn, for quicker development or space. Gambits are a way to take the opponent out of known theory and steer the game to sharp play. A gambit is judged by what you get, and some are sound while others rely on mistakes."
      },
      {
        "t": "board",
        "fen": "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4",
        "caption": "Evans Gambit: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4. White offers a wing pawn to win time and build a big centre. It features in the Evergreen Game.",
        "marks": {
          "b4": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "e5",
          "Nf3",
          "Nc6",
          "Bc4",
          "Bc5",
          "b4"
        ]
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pppp1ppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3",
        "caption": "Danish Gambit: 1.e4 e5 2.d4 exd4 3.c3. White offers one or two pawns to develop rapidly against the king.",
        "marks": {
          "c3": "target"
        },
        "arrows": [],
        "line": [
          "e4",
          "e5",
          "d4",
          "exd4",
          "c3"
        ]
      },
      {
        "t": "table",
        "head": [
          "Gambit",
          "First moves",
          "Idea"
        ],
        "rows": [
          [
            "King's Gambit",
            "1.e4 e5 2.f4",
            "Open the f-file, and play for a quick attack."
          ],
          [
            "Queen's Gambit",
            "1.d4 d5 2.c4",
            "Win back the pawn and keep a space advantage. Often not a true gambit."
          ],
          [
            "Budapest Gambit",
            "1.d4 Nf6 2.c4 e5",
            "Black gives a pawn for active piece play. Features in a famous trap in the Tactics tab."
          ],
          [
            "Englund Gambit",
            "1.d4 e5",
            "A risky try for Black that sets many traps."
          ],
          [
            "Smith-Morra Gambit",
            "1.e4 c5 2.d4 cxd4 3.c3",
            "White sacrifices a pawn to get a lead in development against the Sicilian."
          ],
          [
            "Marshall Attack",
            "Ruy López, Black plays ...d5 at a key moment",
            "Black gives a pawn for a strong attack. Deeply analysed."
          ]
        ]
      }
    ]
  },
  {
    "id": "players",
    "topic": "Players",
    "title": "Great players and what they changed",
    "summary": "From Philidor to Carlsen: twenty masters and the ideas they gave the game.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess history is a chain of players who each found a new idea that the next generation learned from. These are some of the names behind the ideas."
      },
      {
        "t": "table",
        "head": [
          "Player",
          "Years",
          "Known for"
        ],
        "rows": [
          [
            "François-André Philidor",
            "1726 to 1795",
            "The strongest player of his century. He taught that pawns shape the game and used the pawn chain as a weapon."
          ],
          [
            "Adolf Anderssen",
            "1818 to 1879",
            "Romantic master of the Immortal and Evergreen games. A model of imaginative sacrifices."
          ],
          [
            "Paul Morphy",
            "1837 to 1884",
            "American prodigy who beat the best players in Europe in 1858 and 1859. He showed the power of fast development and open lines, and retired young."
          ],
          [
            "Wilhelm Steinitz",
            "1836 to 1900",
            "First official World Champion (1886). He proved that quiet advantages in structure and space win games."
          ],
          [
            "Siegbert Tarrasch",
            "1862 to 1934",
            "Teacher of the classical rules: development, mobility, and rooks behind passed pawns."
          ],
          [
            "Emanuel Lasker",
            "1868 to 1941",
            "World Champion for 27 years (1894 to 1921), the longest reign ever. He played the opponent as much as the board."
          ],
          [
            "José Raúl Capablanca",
            "1888 to 1942",
            "World Champion from 1921 to 1927. Famous for clean, almost effortless technique, especially in endgames."
          ],
          [
            "Richard Réti",
            "1889 to 1929",
            "Hypermodern pioneer who attacked the centre from a distance. Author of Modern Ideas in Chess."
          ],
          [
            "Aron Nimzowitsch",
            "1886 to 1935",
            "Author of My System (1925): prophylaxis, blockade and overprotection."
          ],
          [
            "Alexander Alekhine",
            "1892 to 1946",
            "World Champion 1927 to 1935 and 1937 to 1946. Brilliant combinations and deep preparation."
          ],
          [
            "Mikhail Botvinnik",
            "1911 to 1995",
            "Three-time World Champion who built the Soviet school of serious, scientific preparation."
          ],
          [
            "Vasily Smyslov",
            "1921 to 2010",
            "World Champion 1957 to 1958. Famous for harmony between the pieces and endgame technique."
          ],
          [
            "Mikhail Tal",
            "1936 to 1992",
            "\"The Magician from Riga\". He became World Champion at 23 (1960) with fearless, complicated attacking play."
          ],
          [
            "Tigran Petrosian",
            "1929 to 1984",
            "World Champion 1963 to 1969. The master of prophylaxis and the exchange sacrifice."
          ],
          [
            "Bobby Fischer",
            "1943 to 2008",
            "World Champion in 1972. He combined deep opening preparation, clarity and relentless will to win."
          ],
          [
            "Anatoly Karpov",
            "born 1951",
            "World Champion 1975 to 1985. The great squeezer, who restricted opponents until they ran out of moves."
          ],
          [
            "Garry Kasparov",
            "born 1963",
            "World Champion from 1985 to 2000 and the highest-rated player for two decades. Dynamic play and heavy preparation."
          ],
          [
            "Viswanathan Anand",
            "born 1969",
            "World Champion 2007 to 2013. Lightning calculation and a universal style."
          ],
          [
            "Judit Polgár",
            "born 1976",
            "The strongest woman player in history, peaking at 2735. At 15 she became the youngest grandmaster at the time."
          ],
          [
            "Magnus Carlsen",
            "born 1990",
            "World Champion from 2013 to 2023 and holder of the all-time rating record of 2882. Famous for grinding down opponents in equal positions."
          ]
        ]
      },
      {
        "t": "p",
        "text": "A new generation keeps arriving. Gukesh Dommaraju became the youngest undisputed World Champion in 2024, at the age of 18, which shows how early great players now reach the top."
      }
    ]
  },
  {
    "id": "champions",
    "topic": "Players",
    "title": "Every World Champion",
    "summary": "Eighteen names, from the first official champion in 1886 to today.",
    "blocks": [
      {
        "t": "p",
        "text": "The list of champions depends on how you count the split in the 1990s, when there were two titles. This table shows the champions who held the main title, with the main reigns."
      },
      {
        "t": "table",
        "head": [
          "No.",
          "Champion",
          "Country",
          "Reign"
        ],
        "rows": [
          [
            "1",
            "Wilhelm Steinitz",
            "Austria, later USA",
            "1886 to 1894"
          ],
          [
            "2",
            "Emanuel Lasker",
            "Germany",
            "1894 to 1921"
          ],
          [
            "3",
            "José Raúl Capablanca",
            "Cuba",
            "1921 to 1927"
          ],
          [
            "4",
            "Alexander Alekhine",
            "Russia, later France",
            "1927 to 1935, 1937 to 1946"
          ],
          [
            "5",
            "Max Euwe",
            "Netherlands",
            "1935 to 1937"
          ],
          [
            "6",
            "Mikhail Botvinnik",
            "Soviet Union",
            "1948 to 1957, 1958 to 1960, 1961 to 1963"
          ],
          [
            "7",
            "Vasily Smyslov",
            "Soviet Union",
            "1957 to 1958"
          ],
          [
            "8",
            "Mikhail Tal",
            "Soviet Union",
            "1960 to 1961"
          ],
          [
            "9",
            "Tigran Petrosian",
            "Soviet Union",
            "1963 to 1969"
          ],
          [
            "10",
            "Boris Spassky",
            "Soviet Union",
            "1969 to 1972"
          ],
          [
            "11",
            "Bobby Fischer",
            "United States",
            "1972 to 1975"
          ],
          [
            "12",
            "Anatoly Karpov",
            "Soviet Union",
            "1975 to 1985 (FIDE title again 1993 to 1999)"
          ],
          [
            "13",
            "Garry Kasparov",
            "Soviet Union, later Russia",
            "1985 to 2000 (a separate title from 1993)"
          ],
          [
            "14",
            "Vladimir Kramnik",
            "Russia",
            "2000 to 2007"
          ],
          [
            "15",
            "Viswanathan Anand",
            "India",
            "2007 to 2013"
          ],
          [
            "16",
            "Magnus Carlsen",
            "Norway",
            "2013 to 2023"
          ],
          [
            "17",
            "Ding Liren",
            "China",
            "2023 to 2024"
          ],
          [
            "18",
            "Gukesh Dommaraju",
            "India",
            "2024 onward"
          ]
        ]
      },
      {
        "t": "note",
        "text": "Alekhine died in 1946 while still champion, and the title was decided in a 1948 tournament. After 1993 there were two rival titles until the 2006 reunification match. The numbering varies between books, so you may see slightly different lists."
      },
      {
        "t": "h",
        "text": "Some facts worth knowing"
      },
      {
        "t": "ul",
        "items": [
          "Lasker held the title for 27 years, the longest reign.",
          "Botvinnik won the title three times, regaining it twice after losing a return match.",
          "Tal and Gukesh were the youngest champions of their eras, and Gukesh is the youngest ever (18).",
          "Alekhine is the only champion to die while holding the title.",
          "Fischer won in 1972 and then did not defend the title, which passed to Karpov by default in 1975."
        ]
      }
    ]
  },
  {
    "id": "women",
    "topic": "Players",
    "title": "Women in chess",
    "summary": "Pioneers, champions and the players who broke the highest ceilings.",
    "blocks": [
      {
        "t": "p",
        "text": "For many years women played in separate events, partly because of social barriers and partly because far fewer girls were encouraged to play. Today the best women compete in open events and the gap in participation is narrowing."
      },
      {
        "t": "table",
        "head": [
          "Player",
          "Country",
          "Why she matters"
        ],
        "rows": [
          [
            "Vera Menchik",
            "Czechoslovakia, later Britain",
            "First Women's World Champion (1927), and held the title until her death in 1944. She beat several strong men in open events."
          ],
          [
            "Nona Gaprindashvili",
            "Georgia",
            "Women's World Champion for many years. In 1978 she became the first woman to be awarded the Grandmaster title."
          ],
          [
            "Maia Chiburdanidze",
            "Georgia",
            "Women's World Champion from 1978 for more than a decade."
          ],
          [
            "Susan Polgár",
            "Hungary, later USA",
            "Women's World Champion, and one of the first women to earn the Grandmaster title under the men's rules."
          ],
          [
            "Judit Polgár",
            "Hungary",
            "The strongest woman ever. She peaked at 2735 and reached the world top ten. She beat Kasparov in a rapid game in 2002."
          ],
          [
            "Hou Yifan",
            "China",
            "A Grandmaster at 14 and a four-time Women's World Champion."
          ],
          [
            "Koneru Humpy",
            "India",
            "Reached the top of the world rankings for women and has won world rapid titles."
          ],
          [
            "Ju Wenjun",
            "China",
            "Women's World Champion since 2018."
          ]
        ]
      },
      {
        "t": "p",
        "text": "In 2024 India won both the open and the women's gold medals at the Chess Olympiad in Budapest, a sign of how quickly the sport is changing in some countries. Women's titles still exist, but the Women's Grandmaster title (WGM) is now seen as a stepping stone to the open Grandmaster title."
      }
    ]
  },
  {
    "id": "championship",
    "topic": "Competition",
    "title": "The World Championship: how it works",
    "summary": "The cycle, the great matches and the rivalries that shaped chess.",
    "blocks": [
      {
        "t": "p",
        "text": "For most of its history the world title was decided in a match between the champion and a challenger. The current cycle starts with qualification events and ends with a long match. The winner of the Candidates Tournament earns the right to challenge the champion."
      },
      {
        "t": "h",
        "text": "The modern cycle"
      },
      {
        "t": "ul",
        "items": [
          "Players qualify through the Chess World Cup, the FIDE Grand Swiss, the rating list and other events.",
          "Eight players meet in the Candidates Tournament, a double round-robin.",
          "The winner plays the champion in a classical match. Tied matches go to rapid and blitz tiebreaks."
        ]
      },
      {
        "t": "h",
        "text": "Matches people still talk about"
      },
      {
        "t": "table",
        "head": [
          "Match",
          "Why it matters"
        ],
        "rows": [
          [
            "Steinitz vs Zukertort, 1886",
            "The first world championship match, and the start of modern ideas about position and structure."
          ],
          [
            "Capablanca vs Alekhine, 1927",
            "Buenos Aires. 34 games, the longest title match. Alekhine won after years of defeat against Capablanca."
          ],
          [
            "Fischer vs Spassky, 1972",
            "Reykjavik. The Cold War as a sporting event. Fischer won and chess went global."
          ],
          [
            "Karpov vs Korchnoi, 1978",
            "Baguio. A bitter match with rows about the audience, flags and even yoghurt."
          ],
          [
            "Karpov vs Kasparov, 1984 to 1985",
            "Stopped after 48 games and many months, with no winner. The match was restarted and Kasparov won in 1985."
          ],
          [
            "Kasparov vs Deep Blue, 1996 and 1997",
            "The first time a computer beat a reigning champion in a match."
          ],
          [
            "Kramnik vs Topalov, 2006",
            "Elista. Reunified the title after the split. It was overshadowed by the \"toiletgate\" dispute."
          ],
          [
            "Carlsen vs Caruana, 2018",
            "All twelve classical games were drawn, and Carlsen won the rapid tiebreak."
          ],
          [
            "Gukesh vs Ding, 2024",
            "Singapore. Gukesh won the last game of the match to become the youngest champion."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Great rivalries"
      },
      {
        "t": "p",
        "text": "Karpov and Kasparov met in five title matches between 1984 and 1990, playing well over a hundred games. Fischer and Spassky met once, but it defined an era. Kramnik beat Kasparov in 2000, and Carlsen and Anand met in 2013 and 2014. Rivalries drive the sport because each player has to find new ideas to beat the other."
      }
    ]
  },
  {
    "id": "time-controls",
    "topic": "Competition",
    "title": "Time controls: bullet to classical",
    "summary": "How the clock changes the game, and what the numbers like 5+3 mean.",
    "blocks": [
      {
        "t": "p",
        "text": "A time control such as 10+5 means ten minutes for each player at the start, plus five seconds added after every move. The extra time is called the increment. A delay is similar but the clock waits before counting down."
      },
      {
        "t": "table",
        "head": [
          "Name",
          "Typical time",
          "Feel"
        ],
        "rows": [
          [
            "Ultrabullet",
            "Under 30 seconds",
            "Pure reflex. Premoves and mouse speed matter."
          ],
          [
            "Bullet",
            "Under 3 minutes in total",
            "Fast. Technique and speed over deep thought."
          ],
          [
            "Blitz",
            "3 to 8 minutes",
            "The most popular online format. Quick but with room to think."
          ],
          [
            "Rapid",
            "8 to 25 minutes",
            "Enough time to calculate. A good balance."
          ],
          [
            "Classical",
            "25 minutes or more",
            "Used in serious events, often with 90 minutes plus increments."
          ],
          [
            "Correspondence",
            "Days per move",
            "Slow games where analysis and engines can be used on some sites."
          ]
        ]
      },
      {
        "t": "note",
        "text": "Websites estimate the total length as the starting time plus about 40 moves of increment. FIDE defines rapid and blitz differently, so a category may vary between organisers."
      },
      {
        "t": "h",
        "text": "Special finishes"
      },
      {
        "t": "ul",
        "items": [
          "Armageddon is a tiebreak game where White has more time but Black wins a draw.",
          "Sudden death means there is no extra time, so the game is decided on the clock.",
          "Fischer increment, invented by Bobby Fischer, adds time after every move and became the world standard."
        ]
      }
    ]
  },
  {
    "id": "formats",
    "topic": "Competition",
    "title": "How tournaments are run",
    "summary": "Round-robin, Swiss, knockout and the tiebreaks that decide ties.",
    "blocks": [
      {
        "t": "table",
        "head": [
          "Format",
          "How it works",
          "Used for"
        ],
        "rows": [
          [
            "Round-robin",
            "Everyone plays everyone, once or twice.",
            "Elite events such as the Candidates tournament."
          ],
          [
            "Swiss",
            "Players with similar scores are paired each round, and nobody is knocked out.",
            "Open events with many players."
          ],
          [
            "Knockout",
            "Short matches. The winner advances and the loser leaves.",
            "The Chess World Cup."
          ],
          [
            "Match",
            "Two players play a fixed number of games.",
            "World Championship matches."
          ],
          [
            "Arena",
            "Players join and leave freely and earn points for a fixed time.",
            "Online events."
          ],
          [
            "Scheveningen",
            "Two teams, each player plays all those on the other team.",
            "Norm tournaments and team events."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Tiebreaks"
      },
      {
        "t": "p",
        "text": "When two players finish with the same score, tiebreaks separate them. Common ones are the Buchholz score (the sum of your opponents' scores), the Sonneborn-Berger score (credit for beating strong opponents), direct encounter and the number of wins. Elite events often use a blitz playoff."
      },
      {
        "t": "p",
        "text": "In a normal game, a win is worth one point, a draw half a point and a loss zero. Some events use three points for a win to encourage fighting chess."
      }
    ]
  },
  {
    "id": "titles",
    "topic": "Competition",
    "title": "FIDE, titles and norms",
    "summary": "Who runs chess, what the titles mean and how you earn them.",
    "blocks": [
      {
        "t": "p",
        "text": "FIDE (Fédération Internationale des Échecs) is the world governing body. It was founded in 1924, runs the Olympiad and the title system, publishes the Laws of Chess and the official rating list. National federations, such as the United States Chess Federation, run chess in their own countries."
      },
      {
        "t": "table",
        "head": [
          "Title",
          "Rating needed",
          "Also needs"
        ],
        "rows": [
          [
            "Candidate Master (CM)",
            "2200",
            "Rating only"
          ],
          [
            "FIDE Master (FM)",
            "2300",
            "Rating only"
          ],
          [
            "International Master (IM)",
            "2400",
            "Three IM norms"
          ],
          [
            "Grandmaster (GM)",
            "2500",
            "Three GM norms"
          ],
          [
            "Woman Candidate Master (WCM)",
            "2000",
            "Rating only"
          ],
          [
            "Woman FIDE Master (WFM)",
            "2100",
            "Rating only"
          ],
          [
            "Woman International Master (WIM)",
            "2200",
            "Norms"
          ],
          [
            "Woman Grandmaster (WGM)",
            "2300",
            "Norms"
          ]
        ]
      },
      {
        "t": "p",
        "text": "A norm is a high performance in a strong tournament over at least nine games. Three norms are needed for the IM or GM title, and the title is awarded for life. The rating requirement must be met at some point, not kept."
      },
      {
        "t": "h",
        "text": "The Olympiad"
      },
      {
        "t": "p",
        "text": "The Chess Olympiad is a biennial team event with open and women's sections. The first official one took place in London in 1927. India won both the open and the women's gold in 2024."
      }
    ]
  },
  {
    "id": "elo",
    "topic": "Ratings",
    "title": "Ratings, Elo and how far you can go",
    "summary": "How a rating is calculated, how long improvement really takes, and the ceilings very few players ever reach.",
    "blocks": [
      {
        "t": "p",
        "text": "A rating is a number that estimates your playing strength. It was designed by Arpad Elo, a Hungarian-American physicist and chess master, and the international federation (FIDE) adopted it in 1970. The idea is simple: the gap between two ratings predicts the result of a game between them."
      },
      {
        "t": "h",
        "text": "How the maths works"
      },
      {
        "t": "p",
        "text": "Your expected score against an opponent is 1 divided by 1 plus 10 to the power of (opponent rating minus your rating) divided by 400. An expected score of 0.76 means that you are expected to collect 76 percent of the points, counting a draw as half a point. After the game your rating moves by K times (the score you got minus the score you were expected to get)."
      },
      {
        "t": "table",
        "head": [
          "Rating gap",
          "Expected score of the stronger player"
        ],
        "rows": [
          [
            "0",
            "50%"
          ],
          [
            "100",
            "64%"
          ],
          [
            "200",
            "76%"
          ],
          [
            "300",
            "85%"
          ],
          [
            "400",
            "91%"
          ],
          [
            "600",
            "97%"
          ],
          [
            "800",
            "99%"
          ]
        ]
      },
      {
        "t": "p",
        "text": "K controls how fast ratings move. FIDE uses 40 for new players (and for young players below 2300), 20 for most established players and 10 once a player has reached 2400. Online sites use their own systems, such as Glicko-2 on Lichess, which also tracks how certain the rating is."
      },
      {
        "t": "h",
        "text": "Try it"
      },
      {
        "t": "widget",
        "id": "elo"
      },
      {
        "t": "h",
        "text": "Online ratings are not FIDE ratings"
      },
      {
        "t": "p",
        "text": "The same person can have very different numbers on different sites, because each rating only compares you with the other players in that pool. Online ratings are often a few hundred points away from an official FIDE rating at the same real strength, so never convert them directly. Use a rating to measure your own progress on one site."
      },
      {
        "t": "h",
        "text": "What the number means"
      },
      {
        "t": "table",
        "head": [
          "Rating",
          "Typical level",
          "What it feels like"
        ],
        "rows": [
          [
            "Under 800",
            "Beginner",
            "Learning the rules and how the pieces work together. Pieces are left hanging often."
          ],
          [
            "800 to 1200",
            "Casual player",
            "Knows basic tactics, but misses two-move threats and loses material to simple forks."
          ],
          [
            "1200 to 1600",
            "Improving club player",
            "Spots most one-move threats, knows an opening or two, and still loses games to a single blunder."
          ],
          [
            "1600 to 2000",
            "Strong club player",
            "Calculates well, understands pawn structure and plans, and punishes mistakes reliably."
          ],
          [
            "2000 to 2200",
            "Expert",
            "Plays at a level most hobby players never reach. 2200 earns the Candidate Master title."
          ],
          [
            "2200 to 2500",
            "Master level",
            "FIDE Master at 2300, International Master at 2400. Very few of these players are hobbyists."
          ],
          [
            "2500 and above",
            "Grandmaster range",
            "The Grandmaster title also needs three strong tournament results (norms). Over 2700 is the elite."
          ]
        ]
      },
      {
        "t": "h",
        "text": "How long does it take to improve?"
      },
      {
        "t": "p",
        "text": "There is no honest single answer, because it depends on your age, your starting point, how you practise and how many hours you give it. The ranges below describe an adult who plays regularly and studies a few hours a week. Treat them as rough guides, not promises."
      },
      {
        "t": "table",
        "head": [
          "Climb",
          "Typical time",
          "What usually makes the difference"
        ],
        "rows": [
          [
            "800 to 1000",
            "1 to 3 months",
            "Learning to check whether a piece is safe before every move."
          ],
          [
            "1000 to 1200",
            "2 to 6 months",
            "Daily tactics puzzles and a blunder check on every move. This is the fastest climb most people ever feel."
          ],
          [
            "1200 to 1500",
            "6 to 18 months",
            "Basic endgames, a simple opening setup and reviewing every loss."
          ],
          [
            "1500 to 1800",
            "1 to 3 years",
            "Structured study, strategy, longer time controls and honest game analysis."
          ],
          [
            "1800 to 2000",
            "2 to 5 years",
            "Heavy study volume, a coach or strong sparring partners, and deliberate work on weaknesses."
          ],
          [
            "2000 and above",
            "Many years",
            "Talent, early training and thousands of hours. Many adults plateau here."
          ]
        ]
      },
      {
        "t": "ul",
        "items": [
          "Improvement is not a straight line. Expect plateaus, and expect your rating to drop after you start learning something new.",
          "Quality beats quantity. One analysed loss teaches more than ten blitz games played on autopilot.",
          "Slower games help. Fifteen minutes or more per side gives you time to think and to practise calculation.",
          "Children usually climb faster than adults, because they learn patterns quickly and have more time to train."
        ]
      },
      {
        "t": "h",
        "text": "The ceiling"
      },
      {
        "t": "p",
        "text": "The highest official FIDE rating ever recorded is 2882, reached by Magnus Carlsen in 2014. Garry Kasparov peaked at 2851 in 1999, a record that stood for well over a decade, and Fabiano Caruana reached 2844 in 2014. Bobby Fischer peaked at 2785 in 1972, which was far ahead of everyone else at the time. Only around ten players in history have ever crossed 2800."
      },
      {
        "t": "table",
        "head": [
          "Milestone",
          "Rating",
          "Reality check"
        ],
        "rows": [
          [
            "Candidate Master",
            "2200",
            "Possible for a dedicated adult, but it takes years of serious work."
          ],
          [
            "International Master",
            "2400",
            "Almost every player at this level started seriously as a child."
          ],
          [
            "Grandmaster",
            "2500 plus norms",
            "Most grandmasters began training before the age of ten."
          ],
          [
            "Super-grandmaster",
            "2700",
            "A few dozen players in the world at any time."
          ],
          [
            "The 2800 club",
            "2800",
            "Roughly ten players ever. It needs rare talent and training from early childhood."
          ]
        ]
      },
      {
        "t": "p",
        "text": "Research on chess experts suggests that players who start young have a large advantage, and that reaching master level typically takes well over ten thousand hours of serious practice, with a huge spread between individuals. Adults can reach a very respectable level, often 1800 to 2200, but reaching the very top after starting late is extremely rare. Starting young, having talent for pattern memory and calculation, and getting great coaching are what separate the 2700 players from everyone else."
      },
      {
        "t": "note",
        "text": "Ratings change every month. The figures above are career peaks, so they remain correct even when current lists move."
      }
    ]
  },
  {
    "id": "schools",
    "topic": "Schools",
    "title": "The great schools of chess",
    "summary": "Five eras of chess thinking, from sacrifices at any cost to engine-assisted preparation.",
    "blocks": [
      {
        "t": "p",
        "text": "A school of chess is a shared way of thinking about the game. Each school reacted to the one before it, and each left ideas that every strong player still uses."
      },
      {
        "t": "table",
        "head": [
          "School",
          "Era",
          "Core idea",
          "Key names"
        ],
        "rows": [
          [
            "Romantic",
            "about 1800 to 1870",
            "Attack at all costs. Open the position, sacrifice material for speed and go for the king.",
            "Anderssen, Morphy"
          ],
          [
            "Classical",
            "about 1870 to 1920",
            "Control the centre, build a sound pawn structure and win by exploiting small weaknesses.",
            "Steinitz, Lasker, Tarrasch, Capablanca"
          ],
          [
            "Hypermodern",
            "1920s",
            "Do not occupy the centre, control it from a distance with pieces and pawns, then strike at an overextended centre.",
            "Réti, Nimzowitsch, Breyer"
          ],
          [
            "Soviet",
            "1930s to 1990s",
            "Chess as a science. Deep study, thorough opening preparation, dynamic play and systematic training from childhood.",
            "Botvinnik, Smyslov, Petrosian, Karpov"
          ],
          [
            "Modern and dynamic",
            "1970s onward",
            "Concrete calculation beats general rules. Initiative, piece activity and constant preparation decide games.",
            "Fischer, Kasparov"
          ],
          [
            "Engine era",
            "2000s onward",
            "Computers decide which ideas are sound. Players defend resourcefully and value activity over material.",
            "Carlsen, Caruana"
          ]
        ]
      },
      {
        "t": "h",
        "text": "Romantic"
      },
      {
        "t": "p",
        "text": "The romantic players loved sacrifices. The \"Immortal Game\" of 1851, in which Adolf Anderssen gave up a bishop, both rooks and the queen to win, is the style at its most beautiful. The weakness is that a well-prepared defender can simply refuse the sacrifice and win with the extra material."
      },
      {
        "t": "h",
        "text": "Classical"
      },
      {
        "t": "p",
        "text": "Wilhelm Steinitz changed the sport by showing that attacks only work when the attacker already has an advantage. His rules, such as control the centre and build on weaknesses, remain the basis of modern coaching. Capablanca then showed how smooth and simple good chess could look."
      },
      {
        "t": "h",
        "text": "Hypermodern"
      },
      {
        "t": "p",
        "text": "Aron Nimzowitsch argued in \"My System\" (1925) that the centre can be attacked and controlled with pieces instead of pawns, and that restraining the opponent (prophylaxis) is as important as attacking. The Nimzo-Indian, the Réti Opening and the fianchetto bishop come from this school."
      },
      {
        "t": "h",
        "text": "Soviet"
      },
      {
        "t": "p",
        "text": "The Soviet Union treated chess as a national project, with schools, trainers and shared analysis. Players from this school were famous for rigorous opening preparation, deep endgame technique and a range of styles: Tal attacked, Petrosian defended, Karpov squeezed."
      },
      {
        "t": "h",
        "text": "Modern and dynamic"
      },
      {
        "t": "p",
        "text": "Bobby Fischer and Garry Kasparov made the leap from rules to concrete calculation. They treated every position as unique, prepared novelties at home and used the initiative as a weapon."
      },
      {
        "t": "h",
        "text": "The engine era"
      },
      {
        "t": "p",
        "text": "Programs such as Stockfish, and the neural network AlphaZero (2017), showed new ideas: advancing the rook pawn to cramp the king, sacrificing a pawn for lasting activity and valuing piece mobility more than humans did. Today every professional prepares with an engine."
      }
    ]
  },
  {
    "id": "styles",
    "topic": "Schools",
    "title": "Player styles and the playing schools in this app",
    "summary": "Attackers, positional players, defenders and universal players, and how the ten schools in this app map to them.",
    "blocks": [
      {
        "t": "p",
        "text": "Beyond the historical schools, every player has a style, which is the kind of position they feel most at home in. Most players are a mix, but one tendency usually stands out."
      },
      {
        "t": "table",
        "head": [
          "Style",
          "What they like",
          "Famous example"
        ],
        "rows": [
          [
            "Attacker",
            "Open lines, initiative and a direct assault on the king. They accept risk for speed.",
            "Mikhail Tal"
          ],
          [
            "Positional player",
            "Good pawn structure, better piece placement and gradual improvement. They squeeze.",
            "Anatoly Karpov"
          ],
          [
            "Defender",
            "Prophylaxis, solid structures and counterattacks after the opponent overreaches.",
            "Tigran Petrosian"
          ],
          [
            "Tactician",
            "Sharp calculation and combinations. They look for the one move that decides the game.",
            "Alexander Alekhine"
          ],
          [
            "Universal player",
            "Comfortable in every kind of position and changes plan to fit the board.",
            "Magnus Carlsen"
          ]
        ]
      },
      {
        "t": "h",
        "text": "The ten playing schools"
      },
      {
        "t": "p",
        "text": "In this app, a school is a temperament for the computer opponent. Each school has an Attack, Focus and Defend profile from 1 to 10 and a small opening book of first moves it likes to play. Pick a school on the setup screen, or tap Play on any school below to start a game against it."
      },
      {
        "t": "widget",
        "id": "schools"
      },
      {
        "t": "h",
        "text": "Reading the three weights"
      },
      {
        "t": "ul",
        "items": [
          "Attack describes how willing the school is to go after the king and create threats.",
          "Focus describes how strongly it values structure, central control and accurate piece placement.",
          "Defend describes how carefully it prevents threats, trades dangerous pieces and keeps a safe position."
        ]
      },
      {
        "t": "note",
        "text": "The engine underneath is always the same Stockfish. Schools change the opening choices and the temperament of the play, not the raw strength. Strength is set separately by difficulty."
      }
    ]
  },
  {
    "id": "engines",
    "topic": "Engines",
    "title": "Engines, evaluation and NNUE",
    "summary": "How a chess engine thinks, what the number on the evaluation bar means, and why neural networks changed everything.",
    "blocks": [
      {
        "t": "p",
        "text": "A chess engine is a program that searches the tree of possible moves and judges the positions at the end of each line. Websites and apps send positions to the engine and show you its answer. The engine in this app is Stockfish 18, an open-source program that runs on your own device through WebAssembly."
      },
      {
        "t": "h",
        "text": "Search"
      },
      {
        "t": "p",
        "text": "The engine looks ahead one half-move at a time. Stockfish uses alpha-beta search, which skips lines that cannot beat a result it has already found. Iterative deepening searches to depth 1, then 2, then 3 and so on, so a good answer is always ready. Move ordering, pruning and a transposition table (memory of positions already seen) make the search millions of times faster than brute force. A final quiescence search keeps playing captures until the position is calm, so the engine never judges a position in the middle of an exchange."
      },
      {
        "t": "h",
        "text": "Evaluation"
      },
      {
        "t": "p",
        "text": "At the end of each line the engine needs a number. For decades programmers wrote that evaluation by hand: material, piece placement, king safety, mobility, pawn structure and passed pawns, blended together depending on how far the game had progressed. Modern engines let a neural network do the same job."
      },
      {
        "t": "h",
        "text": "What does NNUE mean?"
      },
      {
        "t": "p",
        "text": "NNUE stands for Efficiently Updatable Neural Network. It was invented by Yu Nasu for computer shogi in 2018 and added to Stockfish in version 12 (2020). It is a small network that reads a description of the whole position and returns a score. The trick is the word \"updatable\". A move changes only a few pieces, so the engine updates the network's first layer incrementally instead of recomputing it. That makes it fast enough to run on an ordinary CPU, millions of times a second."
      },
      {
        "t": "p",
        "text": "The network learned from millions of positions scored by deep searches, so it picked up patterns that handwritten rules missed. Stockfish 16 (2023) removed the old handcrafted evaluation completely. Today a modern engine is a classical search driven by a neural network evaluation."
      },
      {
        "t": "table",
        "head": [
          "Engine type",
          "Search",
          "Evaluation",
          "Runs on"
        ],
        "rows": [
          [
            "Classical (old Stockfish)",
            "Alpha-beta",
            "Handwritten rules",
            "CPU"
          ],
          [
            "NNUE (Stockfish today)",
            "Alpha-beta",
            "Small, updatable neural network",
            "CPU"
          ],
          [
            "Leela Chess Zero",
            "Monte Carlo tree search",
            "Large deep neural network",
            "GPU"
          ]
        ]
      },
      {
        "t": "p",
        "text": "Leela Chess Zero follows the AlphaZero approach: a much larger network, trained by playing against itself, guiding a different kind of search. It excels at long-term positional judgement. Stockfish searches far more positions per second. Both are far stronger than any human."
      },
      {
        "t": "h",
        "text": "Eval, the number on the bar"
      },
      {
        "t": "p",
        "text": "The evaluation is a score in pawn units. +1.00 means the engine thinks White is about one pawn better, and -2.50 means Black is about two and a half pawns better. A mate score such as M5 or -M3 means a forced checkmate in that many moves for White or for Black. The slider below shows how an evaluation converts into a rough chance of winning."
      },
      {
        "t": "widget",
        "id": "eval"
      },
      {
        "t": "h",
        "text": "Why the eval is not just material"
      },
      {
        "t": "ul",
        "items": [
          "The engine weighs material, king safety, piece activity, pawn structure and threats together. A position can have equal material and a huge evaluation, or less material and a big edge.",
          "Both sides start with 39 points of material (8 pawns, 2 knights, 2 bishops, 2 rooks and a queen), so a queen is worth about 9 and a rook 5.",
          "Evaluations rarely go past about 10. Once a game is clearly won, the engine finds a forced mate and shows a mate score instead.",
          "Promoting a pawn to a queen adds about 8 pawns of material. A position that was already close to winning can therefore jump toward 10 or more."
        ]
      },
      {
        "t": "note",
        "text": "Recent Stockfish versions scale scores so that about +1.00 corresponds to roughly a 50 percent chance of winning, which makes the numbers easier to compare between positions."
      }
    ]
  },
  {
    "id": "panel",
    "topic": "Engines",
    "title": "Reading an analysis panel",
    "summary": "Every term you see next to an engine line: eval, depth, nodes, speed, principal variation and more.",
    "blocks": [
      {
        "t": "p",
        "text": "When an engine analyses a position it shows a line of numbers. Each one tells you something different about how reliable the result is."
      },
      {
        "t": "table",
        "head": [
          "Term",
          "Meaning",
          "How to read it"
        ],
        "rows": [
          [
            "Eval",
            "The engine's score in pawn units. Positive favours White. A mate score is written M5 or -M3.",
            "Around 0.00 is equal. Over 1.00 is a clear edge. Over 3.00 usually wins."
          ],
          [
            "Depth",
            "How many half-moves (plies) the engine has searched in the main line.",
            "Higher is more reliable. Depth 20 or more is typical for strong analysis."
          ],
          [
            "SelDepth",
            "The deepest line the engine has followed anywhere in the search, because it looks further in forcing lines.",
            "Always at least as large as Depth. A big gap means a lot of checks and captures."
          ],
          [
            "Nodes",
            "The number of positions the engine has examined.",
            "More nodes mean a more thorough search."
          ],
          [
            "NPS",
            "Nodes per second, the engine's speed.",
            "A phone might reach hundreds of thousands. A desktop can reach tens of millions."
          ],
          [
            "PV",
            "The principal variation, the best line of play the engine expects.",
            "Read it as a story: it is what both sides do if they play best."
          ],
          [
            "MultiPV",
            "How many different best lines the engine reports at the same time.",
            "Use 2 or 3 to compare candidate moves. Each extra line slows the search."
          ],
          [
            "Time",
            "How long the engine has been searching.",
            "Longer searches go deeper and make the eval more stable."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Worked example"
      },
      {
        "t": "p",
        "text": "Suppose the panel shows Eval +1.80, Depth 24, SelDepth 38, and a PV that begins with a knight move. That means White is better by almost two pawns, after searching 24 half-moves in the main line and as far as 38 in the sharpest lines. The best continuation begins with that knight move, and you can step through the rest of the PV to see why."
      },
      {
        "t": "h",
        "text": "How to use these numbers"
      },
      {
        "t": "ul",
        "items": [
          "Judge a move by comparing evals, not by the size of one number. A move that drops the eval from +1.50 to +0.20 is a mistake. The absolute number matters less.",
          "If the eval jumps around as depth increases, the position is tactical and you should keep looking.",
          "A mate score always beats a pawn score. M7 is a forced win even if the material is level."
        ]
      }
    ]
  },
  {
    "id": "computers",
    "topic": "Engines",
    "title": "Computers and chess: from Turing to AlphaZero",
    "summary": "Seventy years of machines learning to play.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess was one of the first problems computer scientists tried to solve. Claude Shannon described how a computer could play in 1950, and Alan Turing wrote a paper-and-pencil program a few years earlier. Chess became the test of whether a machine could think."
      },
      {
        "t": "table",
        "head": [
          "When",
          "Milestone"
        ],
        "rows": [
          [
            "1948 to 1952",
            "Turing and a colleague design a chess program, and Turing later carries out its moves by hand with pencil and paper."
          ],
          [
            "1950",
            "Claude Shannon publishes the first paper on programming a computer to play chess."
          ],
          [
            "1957",
            "The first full program plays on an IBM computer, taking about eight minutes to a move."
          ],
          [
            "1967",
            "A program, MacHack, plays in a human tournament and gets a rating."
          ],
          [
            "1980s",
            "Dedicated chess computers and microcomputers bring strong chess into homes."
          ],
          [
            "1996",
            "Deep Blue wins one game against Kasparov in Philadelphia, but he wins the match 4 to 2."
          ],
          [
            "1997",
            "An upgraded Deep Blue wins the rematch in New York, 3.5 to 2.5."
          ],
          [
            "2000s",
            "Programs on ordinary computers, such as Fritz and Rybka, outplay all humans. Deep Fritz beats Kramnik in 2006."
          ],
          [
            "2008 onward",
            "Stockfish, an open-source engine, becomes the strongest program and is free to everyone."
          ],
          [
            "2017",
            "AlphaZero, a neural network that learned only from self-play, beats Stockfish in a match."
          ],
          [
            "2018 onward",
            "Leela Chess Zero, an open-source cousin of AlphaZero, rivals Stockfish."
          ],
          [
            "2020",
            "NNUE, a fast neural-network evaluation, joins Stockfish and makes it stronger again."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Why it mattered"
      },
      {
        "t": "p",
        "text": "Early programs tried to mimic human thought. Later ones used raw speed and search. Deep Blue could examine around two hundred million positions a second. AlphaZero showed that a program could discover chess knowledge by itself, without human games to learn from. Today engines are used by every serious player for analysis and preparation."
      },
      {
        "t": "note",
        "text": "The Kasparov match is still debated. Kasparov alleged that the programmers had helped the computer between games, and IBM declined a rematch and retired Deep Blue."
      }
    ]
  },
  {
    "id": "shannon",
    "topic": "Engines",
    "title": "Is chess solved? The size of the game",
    "summary": "Why nobody can calculate chess to the end, and what we do know.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess is far too large to solve by brute force. Claude Shannon estimated in 1950 that a typical game has about 10 to the power of 120 possible lines. This is now called the Shannon number. The number of legal positions is also huge, around 10 to the power of 44 or more by careful estimates."
      },
      {
        "t": "table",
        "head": [
          "Quantity",
          "Rough size"
        ],
        "rows": [
          [
            "Possible positions",
            "About 10 to the power of 44 to 46"
          ],
          [
            "Possible games (Shannon)",
            "About 10 to the power of 120"
          ],
          [
            "Atoms in the observable universe",
            "About 10 to the power of 80"
          ]
        ]
      },
      {
        "t": "h",
        "text": "What is solved"
      },
      {
        "t": "ul",
        "items": [
          "Checkers was weakly solved in 2007 and is a draw with perfect play.",
          "Chess is unsolved. Most experts believe perfect play is a draw, but nobody has proved it.",
          "Positions with up to seven pieces are fully solved by tablebases."
        ]
      },
      {
        "t": "h",
        "text": "Tablebases"
      },
      {
        "t": "p",
        "text": "Endgame tablebases are databases that store the perfect result of every position with a small number of pieces, and the exact number of moves to win. The Lomonosov and Syzygy tablebases cover every seven-piece position. The longest forced wins found in them need more than five hundred moves, which a human could never find and which can look like random moves."
      },
      {
        "t": "note",
        "text": "Tablebases are why engines play endgames perfectly when few pieces are left. Many sites, including Lichess, use them to display perfect results."
      }
    ]
  },
  {
    "id": "mind",
    "topic": "Mind",
    "title": "The chess mind: memory, patterns and intuition",
    "summary": "What psychologists learned from watching masters think.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess has been called the fruit fly of psychology because it is a rich but well-defined task. Studies of players have taught us a lot about expertise."
      },
      {
        "t": "h",
        "text": "De Groot: masters see better, not deeper"
      },
      {
        "t": "p",
        "text": "In the 1940s the Dutch psychologist Adriaan de Groot asked players to think aloud. He expected the strongest to calculate more moves ahead. They did not. The masters found good moves almost at once because they recognised the position, and they used their time to check it."
      },
      {
        "t": "h",
        "text": "Chase and Simon: chunking"
      },
      {
        "t": "p",
        "text": "In 1973 William Chase and Herbert Simon showed that masters can recall a real game position after seeing it for five seconds. They do much better than beginners. But if the pieces are placed randomly, masters are no better than beginners. Experts do not have better raw memory. They store whole patterns, or chunks, such as a castled king with its pawns."
      },
      {
        "t": "h",
        "text": "What this means for you"
      },
      {
        "t": "ul",
        "items": [
          "Study many positions and games, because pattern recognition is the core of skill.",
          "Tactics puzzles train recognition. Doing them daily is the best-supported advice.",
          "Analysis comes after recognition: you spot the idea, then calculate to check it.",
          "Intuition is fast pattern recognition built from thousands of hours. It can be trained and it can be wrong."
        ]
      },
      {
        "t": "note",
        "text": "Estimates suggest that a master has stored tens of thousands of chunks. This is why experience matters so much in chess."
      }
    ]
  },
  {
    "id": "benefits",
    "topic": "Mind",
    "title": "Does chess make you smarter?",
    "summary": "What the research says, and what it does not say.",
    "blocks": [
      {
        "t": "p",
        "text": "Chess is often advertised as a way to raise intelligence, and the truth is more modest. Studies in schools have found that chess lessons can improve scores in maths and concentration for some pupils. The effect is usually small, and the best studies do not agree with each other."
      },
      {
        "t": "h",
        "text": "What looks solid"
      },
      {
        "t": "ul",
        "items": [
          "Chess teaches chess. Practice improves chess skill, memory for chess positions and patience over the board.",
          "It trains habits: thinking before moving, checking an opponent's threats and accepting mistakes.",
          "It is a social and enjoyable hobby, and that matters for well-being.",
          "Players of all ages can play and improve."
        ]
      },
      {
        "t": "h",
        "text": "What is less certain"
      },
      {
        "t": "ul",
        "items": [
          "Whether chess skill transfers to general intelligence or school results. The evidence is mixed.",
          "Whether chess protects against memory loss in later life. Studies on older adults are small.",
          "Whether the benefits come from chess itself or from the attention, teaching and social contact that go with it."
        ]
      },
      {
        "t": "p",
        "text": "A fair summary is that chess is good for you in the way any challenging, social hobby is, and you should play it because you enjoy it."
      }
    ]
  },
  {
    "id": "fairplay",
    "topic": "Mind",
    "title": "Fair play and cheating",
    "summary": "How chess protects its integrity in the engine age.",
    "blocks": [
      {
        "t": "p",
        "text": "Engines are stronger than any human, so a player who gets help from one has a huge advantage. Cheating is the biggest problem in online chess and also a worry in over-the-board events."
      },
      {
        "t": "table",
        "head": [
          "Method",
          "How it works"
        ],
        "rows": [
          [
            "Statistical analysis",
            "Sites compare a player's moves with engine choices and the average loss per move. Unusually perfect play over many games is a red flag."
          ],
          [
            "Behaviour signals",
            "Switching tabs, long pauses followed by perfect moves, and unusual time use."
          ],
          [
            "Over-the-board rules",
            "Phones are banned, and metal detectors, delayed broadcasts and arbiters are used in strong events."
          ],
          [
            "Sanctions",
            "Accounts are closed and titles can be removed. FIDE has a Fair Play Commission."
          ]
        ]
      },
      {
        "t": "note",
        "text": "Statistics can only give evidence, not proof. Sites rarely make their exact detection rules public, so cheaters cannot tune around them. Honest players should be sure to play without help."
      },
      {
        "t": "p",
        "text": "The 2006 world championship match between Kramnik and Topalov saw a dispute over the use of the bathroom, known as \"toiletgate\". In 2022, a controversy over an alleged cheating case at a US tournament led to a flood of attention on anti-cheating methods."
      }
    ]
  },
  {
    "id": "chess960",
    "topic": "Variants",
    "title": "Chess960 (Fischer Random)",
    "summary": "960 starting positions, no opening theory, and chess that rewards understanding.",
    "blocks": [
      {
        "t": "p",
        "text": "Bobby Fischer proposed the idea in 1996. The pieces on the back rank are shuffled, with a few conditions, before the game, so the opening is always new. There are exactly 960 legal starting positions, and the standard position is just one of them."
      },
      {
        "t": "board",
        "fen": "bbqnnrkr/pppppppp/8/8/8/8/PPPPPPPP/BBQNNRKR w - - 0 1",
        "caption": "One of the 960 starting positions. The two bishops are on opposite colours and the king stands between the rooks.",
        "marks": {},
        "arrows": []
      },
      {
        "t": "ul",
        "items": [
          "Bishops start on opposite-coloured squares.",
          "The king is placed between the two rooks, so castling is still possible.",
          "Black's setup mirrors White's.",
          "Castling works as in normal chess: the king and rook end up on the squares they would normally reach."
        ]
      },
      {
        "t": "p",
        "text": "Chess960 has become popular at the highest level because memorised opening theory is worthless. Lichess supports it, and the first official Chess960 world championship was held in 2019."
      }
    ]
  },
  {
    "id": "variants",
    "topic": "Variants",
    "title": "Chess variants and relatives",
    "summary": "The same board with different rules, and the family of games chess belongs to.",
    "blocks": [
      {
        "t": "table",
        "head": [
          "Variant",
          "Rule change",
          "Why people like it"
        ],
        "rows": [
          [
            "Crazyhouse",
            "Captured pieces can be dropped back on the board as your own.",
            "Wild tactics and constant threats."
          ],
          [
            "Atomic",
            "A capture explodes and removes nearby pieces.",
            "Kings are attacked in very different ways."
          ],
          [
            "Antichess",
            "You must capture if you can, and the goal is to lose all your pieces.",
            "A puzzle of forced moves."
          ],
          [
            "King of the Hill",
            "You also win by getting your king to the centre.",
            "A quick race."
          ],
          [
            "Three-check",
            "You win by giving three checks.",
            "Rewards an aggressive style."
          ],
          [
            "Horde",
            "White has 36 pawns and Black has the usual pieces.",
            "An unbalanced fight."
          ],
          [
            "Racing Kings",
            "Nobody can give check, and the aim is to reach the eighth rank.",
            "A pure race."
          ],
          [
            "Bughouse",
            "Four players in two teams, passing captured pieces to a partner.",
            "Chaotic, social and fast."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Relatives of chess"
      },
      {
        "t": "ul",
        "items": [
          "Xiangqi, Chinese chess, with a river, a palace and cannons.",
          "Shogi, Japanese chess, where captured pieces can be dropped back.",
          "Janggi, Korean chess, close to xiangqi.",
          "Makruk, Thai chess, descended from the same Indian ancestor.",
          "Capablanca chess, an old attempt to enlarge the board with extra pieces."
        ]
      },
      {
        "t": "p",
        "text": "Many variants are available on Lichess. They are good fun, but standard chess remains the basis for study and rating."
      }
    ]
  },
  {
    "id": "equipment",
    "topic": "Culture",
    "title": "Boards, pieces and clocks",
    "summary": "The things you hold when you play over the board.",
    "blocks": [
      {
        "t": "ul",
        "items": [
          "The Staunton set, introduced in 1849, is the standard design. Its pieces are easy to tell apart and well balanced. It is named for the English master Howard Staunton, who endorsed it.",
          "Tournament boards are usually green and cream or brown and cream, with squares large enough to fit a pawn comfortably.",
          "Digital clocks with increments replaced mechanical ones. The Fischer increment is the usual setting.",
          "Players record moves on scoresheets, and some events use electronic boards that transmit the moves live.",
          "At home, a travel set, a roll-up board or a phone app is all you need."
        ]
      },
      {
        "t": "p",
        "text": "Boards are set up with a light square at each player's right-hand corner, and the queen on her own colour: the white queen on a light square, the black queen on a dark square."
      }
    ]
  },
  {
    "id": "studies",
    "topic": "Culture",
    "title": "Chess problems and studies",
    "summary": "The art side of chess: positions composed to be beautiful.",
    "blocks": [
      {
        "t": "p",
        "text": "Alongside games, there is a whole art of composing chess positions. A composer sets up a position that has a surprising and elegant solution. There are two main types."
      },
      {
        "t": "table",
        "head": [
          "Type",
          "Task",
          "Notes"
        ],
        "rows": [
          [
            "Problem",
            "White to move and mate in two, three or more moves.",
            "Judged on economy, surprise and a hidden first move. Samuel Loyd was a famous American composer."
          ],
          [
            "Study",
            "White to move and win or draw.",
            "The ideas appear in real endgames. Alexey Troitsky and Henri Rinck were great composers."
          ],
          [
            "Helpmate",
            "Black helps White to deliver mate.",
            "Both sides cooperate. A favourite of composers."
          ],
          [
            "Selfmate",
            "White forces Black to mate White.",
            "A paradox that is great fun."
          ]
        ]
      },
      {
        "t": "h",
        "text": "The Réti study"
      },
      {
        "t": "p",
        "text": "Richard Réti composed a famous study in 1921 in which White, with a king far from a pawn, draws by marching the king on a diagonal that threatens two things at once."
      },
      {
        "t": "board",
        "fen": "7K/8/k1P5/7p/8/8/8/8 w - - 0 1",
        "caption": "The Réti study. White to move draws: the king approaches both the black pawn and its own pawn in the same moves. It is a classic lesson in the geometry of the king.",
        "marks": {
          "h8": "target"
        },
        "arrows": [
          [
            "h8",
            "g7"
          ]
        ]
      }
    ]
  },
  {
    "id": "culture",
    "topic": "Culture",
    "title": "Chess in books, film and art",
    "summary": "How chess has inspired writers, artists and film-makers.",
    "blocks": [
      {
        "t": "table",
        "head": [
          "Work",
          "Kind",
          "About"
        ],
        "rows": [
          [
            "Through the Looking-Glass (1871)",
            "Novel",
            "Lewis Carroll's Alice enters a land laid out like a chess board."
          ],
          [
            "The Defense (1930)",
            "Novel",
            "Vladimir Nabokov's story of a chess master losing touch with life."
          ],
          [
            "The Royal Game, or Chess Story (1941)",
            "Novella",
            "Stefan Zweig's tale of a man who survives imprisonment by playing chess in his mind."
          ],
          [
            "The Seventh Seal (1957)",
            "Film",
            "Ingmar Bergman's knight plays chess with Death."
          ],
          [
            "The Queen's Gambit (1983)",
            "Novel",
            "Walter Tevis's story of an orphan who becomes a chess prodigy."
          ],
          [
            "Searching for Bobby Fischer (1993)",
            "Film",
            "A boy prodigy and his father, based on a true story."
          ],
          [
            "Pawn Sacrifice (2014)",
            "Film",
            "The story of Fischer and Spassky."
          ],
          [
            "The Queen's Gambit (2020)",
            "Series",
            "The Netflix adaptation that triggered a boom in chess in 2020."
          ]
        ]
      },
      {
        "t": "p",
        "text": "Marcel Duchamp, a major artist of the twentieth century, gave up painting for years to play chess seriously and represented France in international events. Chess sets are art as well, from the walrus ivory Lewis chessmen to modern designs. Chess is also a metaphor in politics and in the Cold War, and a symbol of intellect."
      },
      {
        "t": "h",
        "text": "Chess and machines"
      },
      {
        "t": "p",
        "text": "The Mechanical Turk of 1770 was built to amaze the courts of Europe. It appeared to be a chess-playing automaton, but a human player was hidden inside. It beat Napoleon and Benjamin Franklin, so the story goes, and its secret was only revealed years later. It was an early expression of the question that Deep Blue answered two centuries later."
      }
    ]
  },
  {
    "id": "world",
    "topic": "Culture",
    "title": "Chess around the world",
    "summary": "Where chess is strongest, and why.",
    "blocks": [
      {
        "t": "table",
        "head": [
          "Country",
          "Story"
        ],
        "rows": [
          [
            "Soviet Union and Russia",
            "State-supported schools, a huge training culture and every champion from 1948 to 1972. Russia still produces many top players."
          ],
          [
            "United States",
            "Fischer's 1972 win sparked a boom. Today the US has top players such as Caruana, Nakamura and So."
          ],
          [
            "India",
            "The birthplace of chess. Viswanathan Anand started a wave, and young stars like Gukesh and Praggnanandhaa followed. India won both gold medals at the 2024 Olympiad."
          ],
          [
            "China",
            "Strong women's chess and, since 2023, the men's world champion Ding Liren."
          ],
          [
            "Norway",
            "Magnus Carlsen made a small country a powerhouse and made chess popular on television."
          ],
          [
            "Armenia",
            "Chess is a compulsory subject in primary schools since 2011."
          ],
          [
            "Hungary",
            "Home of the Polgár sisters and a long tradition of strong players."
          ]
        ]
      },
      {
        "t": "p",
        "text": "Chess is played in schools, parks, cafés and prisons all over the world. The International Chess Day is celebrated on 20 July, the date FIDE was founded in 1924."
      }
    ]
  },
  {
    "id": "records",
    "topic": "Culture",
    "title": "Records and curiosities",
    "summary": "The longest, shortest, youngest and strangest.",
    "blocks": [
      {
        "t": "table",
        "head": [
          "Record",
          "Fact"
        ],
        "rows": [
          [
            "Highest rating",
            "Magnus Carlsen, 2882 (2014)."
          ],
          [
            "Longest title reign",
            "Emanuel Lasker, 27 years (1894 to 1921)."
          ],
          [
            "Youngest World Champion",
            "Gukesh Dommaraju, 18 years old in 2024."
          ],
          [
            "Youngest Grandmaster",
            "Abhimanyu Mishra, 12 years, 4 months in 2021."
          ],
          [
            "Longest tournament game",
            "Nikolić vs Arsović, Belgrade 1989: 269 moves and a draw after more than 20 hours."
          ],
          [
            "Longest unbeaten run at classical chess",
            "Carlsen, 125 games between 2018 and 2020."
          ],
          [
            "Longest title match",
            "Capablanca vs Alekhine, 1927: 34 games."
          ],
          [
            "Shortest possible checkmate",
            "Fool's mate, in two moves."
          ],
          [
            "Most accurate machine",
            "Stockfish and Leela, far above any human."
          ]
        ]
      },
      {
        "t": "h",
        "text": "Curiosities"
      },
      {
        "t": "ul",
        "items": [
          "The number of possible chess games is far larger than the number of atoms in the observable universe.",
          "The longest known forced mate in a seven-piece ending takes over five hundred moves.",
          "The shortest game ending in stalemate takes only 10 moves, composed by Sam Loyd.",
          "The knight's tour is a puzzle where a knight visits every square exactly once. There are millions of solutions."
        ]
      }
    ]
  },
  {
    "id": "notation",
    "topic": "Reference",
    "title": "Reading and writing chess: algebraic, PGN, FEN and UCI",
    "summary": "The languages that people and programs use to record positions and moves.",
    "blocks": [
      {
        "t": "p",
        "text": "Every square has a name: files a to h from left to right and ranks 1 to 8 from White's side. A move is written with a piece letter and the destination square."
      },
      {
        "t": "table",
        "head": [
          "Symbol",
          "Meaning",
          "Example"
        ],
        "rows": [
          [
            "K, Q, R, B, N",
            "King, queen, rook, bishop, knight. Pawns have no letter.",
            "Nf3"
          ],
          [
            "x",
            "A capture.",
            "Bxe6"
          ],
          [
            "+",
            "Check.",
            "Qh5+"
          ],
          [
            "#",
            "Checkmate.",
            "Qxf7#"
          ],
          [
            "O-O, O-O-O",
            "Short and long castling.",
            "O-O"
          ],
          [
            "=",
            "Promotion.",
            "e8=Q"
          ],
          [
            "!, ?, !!, ??",
            "Good, poor, brilliant and blunder.",
            "Nxe5??"
          ]
        ]
      },
      {
        "t": "h",
        "text": "PGN: the game file"
      },
      {
        "t": "p",
        "text": "Portable Game Notation records a whole game, with tags for players, date and result, followed by the moves. Almost every chess website and program can import and export it. Lichess lets you download any game as PGN."
      },
      {
        "t": "h",
        "text": "FEN: one position"
      },
      {
        "t": "p",
        "text": "Forsyth-Edwards Notation describes a single position in a line of text. It lists the pieces rank by rank from the eighth to the first, then whose turn it is, castling rights, an en passant square, the half-move clock and the move number."
      },
      {
        "t": "board",
        "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
        "caption": "This position has the FEN \"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2\". It is White to move after 1.e4 e5.",
        "marks": {},
        "arrows": []
      },
      {
        "t": "h",
        "text": "UCI: how engines talk"
      },
      {
        "t": "p",
        "text": "The Universal Chess Interface is the text protocol between a chess program and an engine such as Stockfish. Moves are sent as start and end squares, for example e2e4. It was designed in 2000 and almost every engine speaks it today."
      }
    ]
  },
  {
    "id": "glossary",
    "topic": "Reference",
    "title": "Chess glossary: the language of chess",
    "summary": "Search the words players use, from \"adjourn\" to \"zwischenzug\".",
    "blocks": [
      {
        "t": "p",
        "text": "Type in the box to filter the list. Terms are explained in simple language, and many have a full lesson in the Tactics or Strategy tabs."
      },
      {
        "t": "glossary"
      }
    ]
  }
]

/** Rough reading time in minutes, based on the visible words. */
export function readingMinutes(article: Article): number {
  const words = article.blocks.reduce((n, b) => {
    if (b.t === 'p' || b.t === 'h' || b.t === 'note') return n + b.text.split(/\s+/).length
    if (b.t === 'ul') return n + b.items.join(' ').split(/\s+/).length
    if (b.t === 'table') return n + b.head.join(' ').split(/\s+/).length + b.rows.flat().join(' ').split(/\s+/).length
    return n + 60
  }, 0)
  return Math.max(1, Math.round(words / 200))
}
