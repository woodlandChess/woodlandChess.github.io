/** Chess terms for the glossary article. Plain data, sorted A to Z. */
export interface GlossaryTerm { term: string; meaning: string }

export const GLOSSARY: GlossaryTerm[] = [
 {
  "term": "Adjourn",
  "meaning": "To pause a long game and finish it later. Once common in tournaments, it has been replaced by faster time controls."
 },
 {
  "term": "Algebraic notation",
  "meaning": "The standard way to write moves, using file letters and rank numbers, for example Nf3."
 },
 {
  "term": "Analysis",
  "meaning": "Studying a position or a game, by yourself or with an engine, to find the best moves and the mistakes."
 },
 {
  "term": "Attack",
  "meaning": "A plan to threaten the enemy king or a weakness, often by opening lines and bringing more pieces."
 },
 {
  "term": "Back rank",
  "meaning": "A player's first rank, where the king usually stands. A weak back rank invites a back-rank mate."
 },
 {
  "term": "Backward pawn",
  "meaning": "A pawn that is behind its neighbours and cannot advance safely. The square in front of it is often weak."
 },
 {
  "term": "Bad bishop",
  "meaning": "A bishop blocked by its own pawns on the same colour of squares."
 },
 {
  "term": "Battery",
  "meaning": "Two pieces lined up on the same line, such as a queen behind a rook, so they attack together."
 },
 {
  "term": "Bishop pair",
  "meaning": "Owning both bishops, which cover both colours and are strong in open positions."
 },
 {
  "term": "Blindfold chess",
  "meaning": "Playing without seeing the board, keeping the position in your head."
 },
 {
  "term": "Blitz",
  "meaning": "A fast time control of about three to eight minutes per player."
 },
 {
  "term": "Blockade",
  "meaning": "Placing a piece, often a knight, in front of an enemy pawn to stop it from advancing."
 },
 {
  "term": "Blunder",
  "meaning": "A very bad move that loses material, the game or both."
 },
 {
  "term": "Book move",
  "meaning": "A move found in opening theory."
 },
 {
  "term": "Brilliancy",
  "meaning": "A beautiful and deep combination, often with a sacrifice."
 },
 {
  "term": "Bullet",
  "meaning": "The fastest common time control, under three minutes in total."
 },
 {
  "term": "Candidate move",
  "meaning": "A move worth serious thought. Strong players list two or three before calculating."
 },
 {
  "term": "Candidates Tournament",
  "meaning": "The tournament whose winner earns the right to challenge the World Champion."
 },
 {
  "term": "Castling",
  "meaning": "A special move of king and rook together, which tucks the king away and activates the rook."
 },
 {
  "term": "Centipawn",
  "meaning": "A hundredth of a pawn. Engines give evaluations in pawns, so a score of +0.50 is fifty centipawns."
 },
 {
  "term": "Check",
  "meaning": "An attack on the king. It must be answered at once."
 },
 {
  "term": "Checkmate",
  "meaning": "A check from which the king cannot escape. It ends the game."
 },
 {
  "term": "Chunking",
  "meaning": "Memorising a group of pieces as one pattern. It is how masters remember positions so well."
 },
 {
  "term": "Classical",
  "meaning": "Slow time controls, usually more than an hour per player, used in serious events."
 },
 {
  "term": "Clearance",
  "meaning": "Moving a piece out of the way so another can use a square or a line."
 },
 {
  "term": "Closed position",
  "meaning": "A position with locked pawns and few open lines, where manoeuvring matters most."
 },
 {
  "term": "Combination",
  "meaning": "A forcing sequence of moves, usually with a sacrifice, that wins material or mates."
 },
 {
  "term": "Compensation",
  "meaning": "Positional or dynamic advantages that make up for lost material."
 },
 {
  "term": "Connected pawns",
  "meaning": "Pawns on neighbouring files that can protect each other."
 },
 {
  "term": "Counterplay",
  "meaning": "Active chances for the side that is under pressure."
 },
 {
  "term": "Cramped",
  "meaning": "Having little room for your pieces."
 },
 {
  "term": "Decoy",
  "meaning": "A sacrifice that lures a piece onto a bad square."
 },
 {
  "term": "Deflection",
  "meaning": "Forcing a defender away from the square or piece it protects."
 },
 {
  "term": "Depth",
  "meaning": "How many half-moves an engine has searched ahead."
 },
 {
  "term": "Desperado",
  "meaning": "A piece that is about to be lost captures as much as it can first."
 },
 {
  "term": "Development",
  "meaning": "Moving pieces from their starting squares to active ones."
 },
 {
  "term": "Discovered attack",
  "meaning": "Moving one piece to unmask an attack by another behind it."
 },
 {
  "term": "Doubled pawns",
  "meaning": "Two pawns of the same colour on one file."
 },
 {
  "term": "Draw",
  "meaning": "A game that ends without a winner."
 },
 {
  "term": "Drawish",
  "meaning": "A position that is likely to end in a draw with correct play."
 },
 {
  "term": "Elo",
  "meaning": "A rating system named after Arpad Elo that estimates playing strength."
 },
 {
  "term": "En passant",
  "meaning": "A special pawn capture of a pawn that has just moved two squares, taken as if it moved one."
 },
 {
  "term": "Endgame",
  "meaning": "The last phase of a game, with few pieces left, where kings and pawns are important."
 },
 {
  "term": "Engine",
  "meaning": "A program, such as Stockfish, that searches moves and evaluates positions."
 },
 {
  "term": "Eval",
  "meaning": "An engine's score for a position, measured in pawns from White's point of view."
 },
 {
  "term": "Exchange",
  "meaning": "Trading pieces. Also the difference in value between a rook and a minor piece."
 },
 {
  "term": "Exchange sacrifice",
  "meaning": "Giving a rook for a bishop or knight to gain something more valuable."
 },
 {
  "term": "FEN",
  "meaning": "A line of text that describes a single position."
 },
 {
  "term": "Fianchetto",
  "meaning": "Developing a bishop to the second square of a knight's file, such as Bg2, on the long diagonal."
 },
 {
  "term": "FIDE",
  "meaning": "The world chess federation, founded in 1924, which runs titles, ratings and the Olympiad."
 },
 {
  "term": "File",
  "meaning": "A vertical column of squares, named a to h."
 },
 {
  "term": "Flag",
  "meaning": "The marker on a clock. A player whose flag falls has run out of time."
 },
 {
  "term": "Fork",
  "meaning": "One piece attacking two targets at the same time."
 },
 {
  "term": "Fortress",
  "meaning": "A defensive setup that the opponent cannot break down, even when ahead in material."
 },
 {
  "term": "Gambit",
  "meaning": "An opening in which a pawn is offered for faster development or space."
 },
 {
  "term": "Grandmaster",
  "meaning": "The highest title awarded by FIDE, with a rating of at least 2500 and three norms."
 },
 {
  "term": "Hanging piece",
  "meaning": "A piece that is attacked and has no defender."
 },
 {
  "term": "Hypermodern",
  "meaning": "A school that controls the centre from a distance with pieces instead of occupying it with pawns."
 },
 {
  "term": "Illegal move",
  "meaning": "A move that breaks the rules, for example one that leaves your own king in check."
 },
 {
  "term": "Increment",
  "meaning": "Time added to a player's clock after each move."
 },
 {
  "term": "Initiative",
  "meaning": "The ability to make threats that force the opponent to respond."
 },
 {
  "term": "Intermezzo",
  "meaning": "An in-between move played before the expected reply. Also called a zwischenzug."
 },
 {
  "term": "Isolated pawn",
  "meaning": "A pawn with no friendly pawns on the neighbouring files."
 },
 {
  "term": "J'adoube",
  "meaning": "A phrase meaning 'I adjust', said before touching a piece only to straighten it."
 },
 {
  "term": "Key square",
  "meaning": "A square that, if reached by the king, decides a pawn ending."
 },
 {
  "term": "King safety",
  "meaning": "How well the king is protected from attack."
 },
 {
  "term": "Kingside",
  "meaning": "The half of the board with the kings at the start, files e to h."
 },
 {
  "term": "Luft",
  "meaning": "A flight square made by moving a pawn in front of the king, to avoid back-rank mate."
 },
 {
  "term": "Major piece",
  "meaning": "A queen or a rook."
 },
 {
  "term": "Material",
  "meaning": "The total value of pieces, with pawn 1, knight and bishop 3, rook 5, queen 9."
 },
 {
  "term": "Mating net",
  "meaning": "A position where the enemy king cannot escape mate."
 },
 {
  "term": "Middlegame",
  "meaning": "The phase after the opening and before the endgame, with most pieces on the board."
 },
 {
  "term": "Minor piece",
  "meaning": "A bishop or a knight."
 },
 {
  "term": "Minority attack",
  "meaning": "Advancing a smaller group of pawns against a larger one to create a weakness."
 },
 {
  "term": "Mobility",
  "meaning": "How many squares a piece can move to."
 },
 {
  "term": "NNUE",
  "meaning": "A fast neural-network evaluation used by modern engines such as Stockfish."
 },
 {
  "term": "Novelty",
  "meaning": "A new move in an opening that has not been played before."
 },
 {
  "term": "Open file",
  "meaning": "A file with no pawns, ideal for rooks."
 },
 {
  "term": "Opening",
  "meaning": "The first phase of the game, in which the pieces are developed."
 },
 {
  "term": "Opposition",
  "meaning": "Kings facing each other with one square between them, where the player to move must give way."
 },
 {
  "term": "Outpost",
  "meaning": "A strong square, safe from enemy pawns, often used by a knight."
 },
 {
  "term": "Overloading",
  "meaning": "Giving one defender too many jobs, so it cannot do them all."
 },
 {
  "term": "Passed pawn",
  "meaning": "A pawn with no enemy pawns ahead of it on its own or the adjacent files."
 },
 {
  "term": "Pawn break",
  "meaning": "A pawn move that challenges an opponent's pawn and opens lines."
 },
 {
  "term": "Pawn chain",
  "meaning": "Pawns protecting each other along a diagonal."
 },
 {
  "term": "Pawn island",
  "meaning": "A group of connected pawns. Fewer islands usually mean a healthier structure."
 },
 {
  "term": "Pawn structure",
  "meaning": "The arrangement of the pawns, which determines many plans."
 },
 {
  "term": "Perpetual check",
  "meaning": "A series of checks that cannot be stopped, leading to a draw by repetition."
 },
 {
  "term": "PGN",
  "meaning": "Portable Game Notation, a text file format for whole games."
 },
 {
  "term": "Pin",
  "meaning": "An attack on a piece that cannot move without exposing a more valuable one behind it."
 },
 {
  "term": "Ply",
  "meaning": "One move by one side. Two plies make a full move."
 },
 {
  "term": "Positional",
  "meaning": "Based on structure, space and piece placement instead of immediate tactics."
 },
 {
  "term": "Premove",
  "meaning": "A move entered in advance, which plays instantly after the opponent moves. Common in online bullet."
 },
 {
  "term": "Principal variation",
  "meaning": "The best line of play found by an engine. Also written PV."
 },
 {
  "term": "Promotion",
  "meaning": "Turning a pawn that reaches the last rank into a queen, rook, bishop or knight."
 },
 {
  "term": "Prophylaxis",
  "meaning": "A move that prevents the opponent's plan before it starts."
 },
 {
  "term": "Queenside",
  "meaning": "The half of the board with the queens at the start, files a to d."
 },
 {
  "term": "Rank",
  "meaning": "A horizontal row of squares, numbered 1 to 8."
 },
 {
  "term": "Rapid",
  "meaning": "A time control of about eight to twenty-five minutes per player."
 },
 {
  "term": "Repertoire",
  "meaning": "The set of openings a player has prepared."
 },
 {
  "term": "Resign",
  "meaning": "To give up a game that is lost."
 },
 {
  "term": "Rook lift",
  "meaning": "Moving a rook up a file to the third rank or higher to join an attack."
 },
 {
  "term": "Sacrifice",
  "meaning": "Giving up material for an advantage in position or attack."
 },
 {
  "term": "Scholar's mate",
  "meaning": "A four-move checkmate on f7 that beginners often fall for."
 },
 {
  "term": "Seventh rank",
  "meaning": "The rank where the enemy pawns start. A rook there is very strong."
 },
 {
  "term": "Simplify",
  "meaning": "Trade pieces to reduce complications, usually when ahead."
 },
 {
  "term": "Skewer",
  "meaning": "An attack on a valuable piece that must move, exposing a less valuable one behind it."
 },
 {
  "term": "Smothered mate",
  "meaning": "A mate with a knight against a king surrounded by its own pieces."
 },
 {
  "term": "Space",
  "meaning": "The number of squares controlled, especially behind your pawns."
 },
 {
  "term": "Stalemate",
  "meaning": "No legal move and not in check. It is a draw."
 },
 {
  "term": "Swindle",
  "meaning": "Setting a trap in a lost position hoping the opponent errs."
 },
 {
  "term": "Tabiya",
  "meaning": "A well-known position in an opening, which both players aim for."
 },
 {
  "term": "Tablebase",
  "meaning": "A database that stores the perfect result for endgames with few pieces."
 },
 {
  "term": "Tactic",
  "meaning": "A short forcing sequence that wins material or gains an advantage."
 },
 {
  "term": "Tempo",
  "meaning": "One move in time. Gaining a tempo means making a useful move that also forces a reply."
 },
 {
  "term": "Theory",
  "meaning": "Known best play in an opening, built from many games."
 },
 {
  "term": "Threefold repetition",
  "meaning": "The same position appearing three times, which lets a player claim a draw."
 },
 {
  "term": "Time control",
  "meaning": "The time each player has, for example 10+5 for ten minutes plus five seconds a move."
 },
 {
  "term": "Time scramble",
  "meaning": "A phase near the end of a time control where both players have very little time."
 },
 {
  "term": "Touch-move",
  "meaning": "The rule that a touched piece must be moved if it can be."
 },
 {
  "term": "Transposition",
  "meaning": "Reaching the same position by a different order of moves."
 },
 {
  "term": "Trap",
  "meaning": "A natural-looking move that loses to a hidden tactic."
 },
 {
  "term": "UCI",
  "meaning": "The Universal Chess Interface, the text protocol engines use."
 },
 {
  "term": "Undermining",
  "meaning": "Capturing or attacking a piece that defends something else."
 },
 {
  "term": "Underpromotion",
  "meaning": "Promoting to a rook, bishop or knight instead of a queen."
 },
 {
  "term": "Waiting move",
  "meaning": "A harmless move that passes the turn to the opponent."
 },
 {
  "term": "Weak square",
  "meaning": "A square that can no longer be protected by pawns."
 },
 {
  "term": "Windmill",
  "meaning": "A repeating series of discovered checks with a rook and a bishop that captures material."
 },
 {
  "term": "X-ray",
  "meaning": "An attack or defence through an enemy piece along a line."
 },
 {
  "term": "Zugzwang",
  "meaning": "A position where every legal move makes the player's position worse."
 },
 {
  "term": "Zwischenzug",
  "meaning": "An in-between move played before the expected recapture or reply."
 }
]
