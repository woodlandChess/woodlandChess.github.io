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
    "id": "players",
    "topic": "Players",
    "title": "Great players and what they changed",
    "summary": "From the first world champion to the engine era: ten names and the ideas they gave the game.",
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
            "Mikhail Botvinnik",
            "1911 to 1995",
            "Three-time World Champion who built the Soviet school of serious, scientific preparation."
          ],
          [
            "Mikhail Tal",
            "1936 to 1992",
            "\"The Magician from Riga\". He became World Champion at 23 (1960) with fearless, complicated attacking play."
          ],
          [
            "Bobby Fischer",
            "1943 to 2008",
            "World Champion in 1972. He combined deep opening preparation, clarity and relentless will to win."
          ],
          [
            "Garry Kasparov",
            "born 1963",
            "World Champion from 1985 to 2000 and the highest-rated player for two decades. Dynamic play and heavy preparation."
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
