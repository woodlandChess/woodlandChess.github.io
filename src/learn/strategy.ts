import type { Article } from './lore'

/**
 * Strategy guides: principles, pawn play, pieces, attack and defence, planning, endgames,
 * the ideas of the masters and modern training advice. Plain data, like the Lore articles.
 */
export const STRATEGY: Article[] = [
 {
  "id": "centre",
  "topic": "Foundations",
  "title": "Control the centre",
  "summary": "Why the four middle squares matter, and the two ways to fight for them.",
  "blocks": [
   {
    "t": "p",
    "text": "The centre means the squares d4, e4, d5 and e5. A piece placed there reaches the most squares and can switch quickly between both wings. That is why almost every opening principle starts with the centre."
   },
   {
    "t": "board",
    "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "caption": "The four central squares after 1.e4 e5.",
    "marks": {
     "d4": "target",
     "e4": "target",
     "d5": "target",
     "e5": "target"
    },
    "arrows": []
   },
   {
    "t": "h",
    "text": "Two schools, one goal"
   },
   {
    "t": "p",
    "text": "The classical school (Steinitz, Tarrasch) occupies the centre with pawns, usually e4 and d4. The hypermodern school (Réti, Nimzowitsch) lets the opponent build a centre and attacks it from a distance with pieces and flank pawns, then strikes when it is overextended. Both schools agree that you must fight for the centre. They disagree about how."
   },
   {
    "t": "h",
    "text": "How to fight for it"
   },
   {
    "t": "ul",
    "items": [
     "Put pawns on the central squares when you can support them.",
     "Place knights and bishops where they look at the centre, even if they are not in it.",
     "Use a pawn break such as c4 or f4 to challenge an enemy centre.",
     "Do not neglect development to push one more central pawn."
    ]
   },
   {
    "t": "note",
    "text": "A strong centre is a means, not an end. If your pieces are not developed to support it, the centre can become a target."
   }
  ]
 },
 {
  "id": "development",
  "topic": "Foundations",
  "title": "Develop with a purpose",
  "summary": "The opening principles every master repeats, and the reasons behind them.",
  "blocks": [
   {
    "t": "p",
    "text": "Development means bringing your pieces from their starting squares into the game. Pieces on the back rank do nothing, while pieces on active squares attack, defend and support one another. Opening play is mostly a race to develop faster than the opponent."
   },
   {
    "t": "ul",
    "items": [
     "Develop knights and bishops before moving the queen or rooks.",
     "Move each piece once if you can. A second move with the same piece costs a tempo.",
     "Castle early so the king is safe and a rook joins the game.",
     "Connect your rooks by clearing the back rank.",
     "Do not bring the queen out early, because it can be attacked with gain of time."
    ]
   },
   {
    "t": "h",
    "text": "Why speed matters"
   },
   {
    "t": "p",
    "text": "A player who is ahead in development can open the position and attack before the opponent is ready. Paul Morphy won his famous games this way, and the Opera Game in the Tactics tab is the classic example. A lead in development is worth roughly the same as a pawn in an open position."
   },
   {
    "t": "h",
    "text": "When to break the rules"
   },
   {
    "t": "p",
    "text": "Every principle has exceptions. A queen move that wins a pawn, a second move with a knight that creates a threat, or a pawn push that gains space can all be correct. Learn the rule first and then decide when a concrete reason outweighs it."
   }
  ]
 },
 {
  "id": "king-safety",
  "topic": "Foundations",
  "title": "King safety and castling",
  "summary": "When to castle, which side to pick, and what a safe king looks like.",
  "blocks": [
   {
    "t": "p",
    "text": "In the opening and middlegame, the king is the most valuable and the most vulnerable piece. A king in the centre with open files is an invitation to attack. Castling moves the king to a protected corner and brings a rook to the centre."
   },
   {
    "t": "board",
    "fen": "6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1",
    "caption": "A castled king with an intact pawn shield on f, g and h.",
    "marks": {
     "g1": "target",
     "g8": "target"
    },
    "arrows": []
   },
   {
    "t": "h",
    "text": "Principles"
   },
   {
    "t": "ul",
    "items": [
     "Castle before the centre opens.",
     "Keep the pawns in front of the castled king where they are. Each pawn move creates a hole.",
     "A fianchettoed bishop near the king is a strong defender.",
     "Do not castle into an attack that is already prepared. Check where the opponent's pieces point.",
     "Castling on the side with fewer pawn moves is usually safer."
    ]
   },
   {
    "t": "h",
    "text": "The weakest pawn"
   },
   {
    "t": "p",
    "text": "The h-pawn, g-pawn and f-pawn together form the shield for a kingside castled king. Pushing the h-pawn creates a luft (breathing space) against back-rank mates, but it also weakens the squares g3 and g6. Think about both sides of that trade."
   }
  ]
 },
 {
  "id": "tempo-initiative",
  "topic": "Foundations",
  "title": "Tempo and the initiative",
  "summary": "How to make the opponent respond to you instead of the other way round.",
  "blocks": [
   {
    "t": "p",
    "text": "A tempo is one move. Gaining a tempo means making a useful move that also forces the opponent to react. The initiative is the longer-term version: you make the threats and your opponent only defends."
   },
   {
    "t": "ul",
    "items": [
     "Develop with a threat, such as a bishop move that attacks a pawn.",
     "Force the opponent to respond to checks and captures when it helps your plan.",
     "A series of small threats can build to a decisive attack.",
     "Do not waste tempi with unnecessary pawn moves in the opening."
    ]
   },
   {
    "t": "h",
    "text": "The initiative in practice"
   },
   {
    "t": "p",
    "text": "Garry Kasparov was famous for keeping the initiative for dozens of moves, often at the price of material. A pawn sacrificed for the initiative is a good deal when the opponent cannot consolidate. Look at the Immortal Game in the Tactics tab to see how far it can go."
   },
   {
    "t": "note",
    "text": "The initiative is temporary. If you cannot turn it into a concrete gain, the opponent will consolidate and the extra material will count."
   }
  ]
 },
 {
  "id": "space",
  "topic": "Foundations",
  "title": "Space and cramped positions",
  "summary": "What a space advantage gives you, and how the cramped side should respond.",
  "blocks": [
   {
    "t": "p",
    "text": "Space means the number of squares you control, especially behind your pawn chain. A player with more space can move pieces around freely, while the cramped opponent has trouble finding safe squares."
   },
   {
    "t": "h",
    "text": "Using a space advantage"
   },
   {
    "t": "ul",
    "items": [
     "Keep pieces on the board, because more pieces fill the extra space.",
     "Avoid unnecessary exchanges. The side with less space benefits from trading.",
     "Look for a break to open the position when you are ready."
    ]
   },
   {
    "t": "h",
    "text": "If you are cramped"
   },
   {
    "t": "ul",
    "items": [
     "Trade pieces to ease the pressure.",
     "Prepare a pawn break that challenges the opponent's pawns.",
     "Keep your pieces flexible and avoid pushing pawns that will become targets."
    ]
   },
   {
    "t": "p",
    "text": "The Soviet school and later Karpov were masters at squeezing opponents by taking space slowly until there was no counterplay left."
   }
  ]
 },
 {
  "id": "pawn-structure",
  "topic": "Pawns",
  "title": "Pawn structure: the skeleton of the position",
  "summary": "Isolated, doubled, backward and passed pawns, and what each one means for your plans.",
  "blocks": [
   {
    "t": "p",
    "text": "Philidor, the strongest player of the eighteenth century, taught that pawns are the soul of chess, meaning that they determine the character of the position. Pawns cannot move backward, so every pawn move is permanent. The structure tells you where your pieces belong."
   },
   {
    "t": "table",
    "head": [
     "Structure",
     "What it is",
     "What it means"
    ],
    "rows": [
     [
      "Isolated pawn",
      "No friendly pawn on adjacent files.",
      "It cannot be defended by another pawn, so pieces must guard it. It gives open lines and activity in return."
     ],
     [
      "Doubled pawns",
      "Two pawns on the same file.",
      "They are less mobile and often weak, but can control more squares and open a file."
     ],
     [
      "Backward pawn",
      "Behind its neighbours and cannot advance safely.",
      "The square in front of it is a hole where an enemy piece can settle."
     ],
     [
      "Passed pawn",
      "No enemy pawn can stop it on its file or adjacent files.",
      "A long-term strength. It ties down enemy pieces."
     ],
     [
      "Pawn chain",
      "Pawns protecting each other diagonally.",
      "Attack the base of the chain. The base is the pawn that supports the others."
     ]
    ]
   },
   {
    "t": "board",
    "fen": "4k3/pp3ppp/8/3p4/8/8/PPP2PPP/4K3 b - - 0 1",
    "caption": "An isolated pawn on d5: no pawn on the c or e files can support it.",
    "marks": {
     "d5": "target"
    },
    "arrows": []
   },
   {
    "t": "note",
    "text": "Evaluate the structure first. Many strategic plans come straight from it: attack the weak pawn, blockade it, or use the open lines it gives."
   }
  ]
 },
 {
  "id": "pawn-breaks",
  "topic": "Pawns",
  "title": "Pawn breaks and levers",
  "summary": "How to challenge the opponent's structure and open lines on your terms.",
  "blocks": [
   {
    "t": "p",
    "text": "A pawn break is a pawn move that attacks an enemy pawn and tries to open lines. Because pawns cannot retreat, a break changes the character of the position for good. Choose it carefully."
   },
   {
    "t": "ul",
    "items": [
     "A break is good when your pieces are ready to use the open lines.",
     "Prepare it with support: the pawn should be defended after the exchange.",
     "Look for the break that hits the base of the opponent's pawn chain.",
     "Know the typical breaks of the structure: ...c5 against d4, e4-e5, f2-f4, b2-b4, and so on."
    ]
   },
   {
    "t": "h",
    "text": "Timing"
   },
   {
    "t": "p",
    "text": "Breaking too early lets the opponent fix the structure. Breaking too late lets him prevent it. Often the best moment is when your pieces are in place and the opponent has just committed his own."
   }
  ]
 },
 {
  "id": "passed-pawns",
  "topic": "Pawns",
  "title": "Passed pawns",
  "summary": "Why a passed pawn is a long-term asset, and how to use or stop one.",
  "blocks": [
   {
    "t": "board",
    "fen": "4k3/pp3ppp/8/3P4/8/8/PP3PPP/4K3 w - - 0 1",
    "caption": "A passed pawn on d5: no black pawn on the c, d or e files can stop it.",
    "marks": {
     "d5": "target"
    },
    "arrows": []
   },
   {
    "t": "p",
    "text": "A passed pawn threatens to promote, so the opponent must keep a piece near it. That ties down his forces and often gives you an advantage on the rest of the board."
   },
   {
    "t": "h",
    "text": "Rules of thumb"
   },
   {
    "t": "ul",
    "items": [
     "A passed pawn must be pushed, but only when it is safe.",
     "Support it with pieces. A protected passed pawn is much stronger.",
     "Rooks belong behind passed pawns, whether they are yours or the opponent's.",
     "An outside passed pawn, far from the kings, is often decisive in endings."
    ]
   },
   {
    "t": "h",
    "text": "How to stop one"
   },
   {
    "t": "p",
    "text": "Aron Nimzowitsch taught that you should blockade a passed pawn with a piece, ideally a knight, on the square in front of it. A blockading piece is hard to dislodge, and the pawn becomes a weakness instead of a strength."
   }
  ]
 },
 {
  "id": "pawn-majority",
  "topic": "Pawns",
  "title": "Pawn majorities and the minority attack",
  "summary": "Creating a passed pawn with a majority, and attacking with fewer pawns.",
  "blocks": [
   {
    "t": "p",
    "text": "A pawn majority is when you have more pawns than the opponent on one wing. In the endgame, a majority can produce a passed pawn. A healthy majority on the queenside is a classic winning asset."
   },
   {
    "t": "h",
    "text": "The minority attack"
   },
   {
    "t": "p",
    "text": "In the Carlsbad structure, White has two pawns on the queenside (a and b) against Black's three (a, b and c). White pushes the b-pawn to b4 and b5, trading to leave Black with a weak c-pawn. The idea seems backward, since you attack with fewer pawns, but the goal is a weakness, not a passed pawn."
   },
   {
    "t": "board",
    "fen": "2r2rk1/pp2bppp/2p1pn2/3p4/3P4/2PBPN2/PP3PPP/2RQ1RK1 w - - 0 1",
    "caption": "The Carlsbad structure: White pushes b4 and b5 to create a weakness on c6.",
    "marks": {
     "c6": "target"
    },
    "arrows": [
     [
      "b2",
      "b4"
     ]
    ]
   },
   {
    "t": "ul",
    "items": [
     "Prepare with Rb1 and a2-a3 so the b-pawn can advance.",
     "Aim for bxc6 or b5xc6 to leave an isolated or backward pawn.",
     "Watch for Black's counterplay in the centre or on the kingside."
    ]
   }
  ]
 },
 {
  "id": "outposts",
  "topic": "Pawns",
  "title": "Weak squares and outposts",
  "summary": "How to find the squares the opponent can never challenge, and put a piece on them.",
  "blocks": [
   {
    "t": "p",
    "text": "An outpost is a square deep in enemy territory that cannot be attacked by an enemy pawn. A knight on an outpost is often stronger than a rook, since it is supported by your pawns and cannot be chased away."
   },
   {
    "t": "board",
    "fen": "4k3/pp3ppp/8/3N4/4P3/8/PPP2PPP/4K3 w - - 0 1",
    "caption": "A knight on d5: the black c and e pawns are gone, so no pawn can attack it.",
    "marks": {
     "d5": "target"
    },
    "arrows": []
   },
   {
    "t": "h",
    "text": "How to use them"
   },
   {
    "t": "ul",
    "items": [
     "Look for squares in front of enemy backward pawns.",
     "Support the outpost with a pawn of your own.",
     "Trade off the enemy pieces that could challenge it, especially a bishop of the right colour.",
     "Weak squares of one colour are worse when the opponent has no bishop of that colour."
    ]
   }
  ]
 },
 {
  "id": "good-bad-bishop",
  "topic": "Pieces",
  "title": "Good bishops and bad bishops",
  "summary": "Why your own pawns decide how strong a bishop is.",
  "blocks": [
   {
    "t": "p",
    "text": "A bishop stays on one colour of square for the whole game. If your pawns are on the same colour, the bishop is blocked and passive, which makes it a bad bishop. If the pawns are on the other colour, the bishop has open diagonals and is good."
   },
   {
    "t": "board",
    "fen": "4k3/8/8/8/2P1P3/3P1P2/8/4KB2 w - - 0 1",
    "caption": "White's light-squared bishop is hemmed in by its own pawns on c4, d3, e4 and f3.",
    "marks": {
     "f1": "target"
    },
    "arrows": []
   },
   {
    "t": "ul",
    "items": [
     "Put your pawns on the opposite colour from your bishop when you can.",
     "Trade a bad bishop for a knight or an active bishop.",
     "Place the bishop outside the pawn chain before closing the position.",
     "An opponent's bad bishop is a target: fix his pawns on its colour."
    ]
   }
  ]
 },
 {
  "id": "bishop-pair",
  "topic": "Pieces",
  "title": "The bishop pair",
  "summary": "Why two bishops are an asset, and when to give them up.",
  "blocks": [
   {
    "t": "p",
    "text": "Two bishops together cover both colours and work well on an open board. Giving up the bishop pair without compensation can be a strategic concession."
   },
   {
    "t": "ul",
    "items": [
     "Open the position with pawn breaks to give the bishops long diagonals.",
     "Avoid closing the centre if you hold the pair.",
     "The side without the pair can try to close the position or create targets that bishops cannot reach."
    ]
   },
   {
    "t": "p",
    "text": "In general, the pair is worth about half a pawn. It matters more in endgames, where bishops can cover the whole board from one side to the other."
   }
  ]
 },
 {
  "id": "knight-vs-bishop",
  "topic": "Pieces",
  "title": "Knight or bishop?",
  "summary": "When each piece is better, and how to choose when trading.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Knights prefer",
     "Bishops prefer"
    ],
    "rows": [
     [
      "Closed positions with locked pawns.",
      "Open positions with long diagonals."
     ],
     [
      "Outposts supported by pawns.",
      "Play on both wings at once."
     ],
     [
      "Short-range manoeuvring around a target.",
      "Endings with pawns on both sides."
     ],
     [
      "Fixed pawn chains.",
      "The bishop pair."
     ]
    ]
   },
   {
    "t": "p",
    "text": "Capablanca and Karpov were famous for choosing the right piece to keep. Before you trade, ask which piece will have more scope in the structure that will remain."
   }
  ]
 },
 {
  "id": "rooks",
  "topic": "Pieces",
  "title": "Rooks: open files and the seventh rank",
  "summary": "How to put the rooks to work, and why they belong on open lines.",
  "blocks": [
   {
    "t": "p",
    "text": "Rooks need open files and ranks. In the early middlegame, they are not dangerous, but once pawns are exchanged, the rook that takes the open file often decides the game."
   },
   {
    "t": "board",
    "fen": "4k3/R4ppp/8/8/8/8/5PPP/6K1 w - - 0 1",
    "caption": "A rook on the seventh rank attacks the pawns and confines the king.",
    "marks": {
     "a7": "target"
    },
    "arrows": []
   },
   {
    "t": "ul",
    "items": [
     "Put a rook on the open file before the opponent does, and double rooks to reinforce it.",
     "A rook on the seventh rank attacks the pawns from behind and restricts the king.",
     "Do not place a rook on a closed file just to follow a rule.",
     "In endgames, put rooks behind passed pawns."
    ]
   }
  ]
 },
 {
  "id": "queen-coordination",
  "topic": "Pieces",
  "title": "Queen and piece coordination",
  "summary": "Why the strongest piece needs help, and how to coordinate the army.",
  "blocks": [
   {
    "t": "p",
    "text": "A queen alone is easy to chase. A queen supported by rooks and minor pieces is deadly. Good strategy is mostly about getting the pieces to work together, not about each piece being strong on its own."
   },
   {
    "t": "ul",
    "items": [
     "Aim several pieces at the same target. One attacker rarely wins.",
     "Keep the queen on a safe square where it can reach both wings.",
     "Trade your passive pieces for the opponent's active ones.",
     "Do not scatter pieces on opposite sides without a plan."
    ]
   },
   {
    "t": "note",
    "text": "Ask after every move: which of my pieces is worst placed, and how can I improve it? This one question is the basis of positional play."
   }
  ]
 },
 {
  "id": "exchanges",
  "topic": "Pieces",
  "title": "When to exchange pieces",
  "summary": "A simple guide to deciding which trades help you.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Trade when you are ahead in material. Fewer pieces make the extra material count.",
     "Trade when you are cramped. The pieces have more room.",
     "Avoid trades when you are attacking. You need pieces.",
     "Trade the opponent's best defender, or your own worst piece.",
     "Do not trade a good bishop for a bad knight without a reason."
    ]
   },
   {
    "t": "p",
    "text": "Simplification is the classical technique for turning an advantage into a win. José Raúl Capablanca made it look effortless. Before every exchange, ask whether the resulting position favours you."
   }
  ]
 },
 {
  "id": "opposite-bishops",
  "topic": "Pieces",
  "title": "Opposite-coloured bishops",
  "summary": "Why these endings are drawish, and why they are deadly in the middlegame.",
  "blocks": [
   {
    "t": "p",
    "text": "When each side has one bishop and the bishops are on opposite colours, they cannot challenge each other. In an endgame this often means a draw, even when one side is a pawn or two up."
   },
   {
    "t": "ul",
    "items": [
     "In the middlegame, the attacker with an opposite-coloured bishop is dangerous: the defender cannot trade it.",
     "In the endgame, the defender can set up a fortress on the squares the enemy bishop cannot attack.",
     "With rooks and queens still on the board, opposite bishops favour the side with the initiative."
    ]
   }
  ]
 },
 {
  "id": "attack-king",
  "topic": "Attack and defence",
  "title": "Attacking the king",
  "summary": "What you need before you attack, and how to carry it out.",
  "blocks": [
   {
    "t": "p",
    "text": "A successful attack needs three things: more pieces near the king than the defender has, open lines to the king, and a weakened king position. Without these, a sacrifice is just a loss of material."
   },
   {
    "t": "ul",
    "items": [
     "Bring more attackers to the scene before opening lines.",
     "Open files and diagonals toward the king, with pawn breaks or sacrifices.",
     "Eliminate or deflect the key defenders, such as the knight on f6.",
     "Calculate forcing lines to the end. An attack that stops halfway loses.",
     "Keep your own king safe and be ready to switch to defence."
    ]
   },
   {
    "t": "p",
    "text": "Alexander Alekhine and Mikhail Tal built entire careers on this kind of play, and the Opera Game, the Immortal Game and the Evergreen Game in the Tactics tab show it at its best."
   }
  ]
 },
 {
  "id": "opposite-castling",
  "topic": "Attack and defence",
  "title": "Opposite-side castling and pawn storms",
  "summary": "A race: each king is attacked by the other side's pawns.",
  "blocks": [
   {
    "t": "p",
    "text": "When the kings castle on opposite wings, both players can advance pawns against the enemy king without weakening their own. The game becomes a race where each tempo matters."
   },
   {
    "t": "ul",
    "items": [
     "Push the pawns on the wing where the enemy king lives, and open files toward it.",
     "Do not waste time on defence unless you must.",
     "Use pieces to support the pawn storm, especially rooks and the queen.",
     "Trade queens only if you are ahead in the race."
    ]
   }
  ]
 },
 {
  "id": "defence",
  "topic": "Attack and defence",
  "title": "Defending well",
  "summary": "How to survive pressure, and how great defenders turned defence into attack.",
  "blocks": [
   {
    "t": "p",
    "text": "Defence is a skill. Players like Tigran Petrosian and Emanuel Lasker defended by staying calm, finding the only moves and waiting for the opponent to overreach."
   },
   {
    "t": "ul",
    "items": [
     "Look at every threat, not only the obvious one. Ask what the opponent wants to do next.",
     "Trade the attacking pieces, especially the queen.",
     "Counterattack where the opponent is weakest, because the best defence is often an active one.",
     "Use prophylaxis: stop the opponent's plan before it begins.",
     "Do not panic and play weakening pawn moves near your king."
    ]
   }
  ]
 },
 {
  "id": "prophylaxis",
  "topic": "Planning",
  "title": "Prophylaxis",
  "summary": "Asking what your opponent wants, and stopping it.",
  "blocks": [
   {
    "t": "p",
    "text": "Prophylaxis means preventing the opponent's plan before it happens. Aron Nimzowitsch made it a central idea in his book My System (1925), and Tigran Petrosian was the greatest practitioner of it."
   },
   {
    "t": "h",
    "text": "The question to ask"
   },
   {
    "t": "p",
    "text": "Before every move, ask: what does my opponent want to do next? If there is a strong idea, can I prevent it with a useful move that also helps my own plans?"
   },
   {
    "t": "ul",
    "items": [
     "Look for the opponent's key break, outpost or piece manoeuvre.",
     "Find a move that stops it and improves your position too.",
     "Do not spend time on prevention that has no value for your own plans."
    ]
   }
  ]
 },
 {
  "id": "overprotection",
  "topic": "Planning",
  "title": "Overprotection and blockade",
  "summary": "Nimzowitsch's two most original ideas.",
  "blocks": [
   {
    "t": "p",
    "text": "Overprotection means defending a key square or pawn more times than it seems to need. The extra defenders are not wasted. They are free to move to other duties, and the piece that overprotects ends up on an excellent post."
   },
   {
    "t": "p",
    "text": "Blockade means placing a piece, ideally a knight, in front of an enemy passed or isolated pawn. The blockader stops the pawn and the pawn becomes a long-term target."
   },
   {
    "t": "note",
    "text": "Both ideas were controversial when they appeared. Today they are part of every strong player's thinking."
   }
  ]
 },
 {
  "id": "imbalances",
  "topic": "Planning",
  "title": "Imbalances: a method for evaluating positions",
  "summary": "Jeremy Silman's checklist for finding the plan.",
  "blocks": [
   {
    "t": "p",
    "text": "An imbalance is a difference between the two sides. Silman's method, from How to Reassess Your Chess, starts by listing the imbalances and then playing to the ones that favour you."
   },
   {
    "t": "table",
    "head": [
     "Imbalance",
     "Example"
    ],
    "rows": [
     [
      "Minor pieces",
      "Bishop against knight, or the bishop pair."
     ],
     [
      "Pawn structure",
      "Isolated, doubled or passed pawns."
     ],
     [
      "Space",
      "More room for your pieces."
     ],
     [
      "Material",
      "An extra pawn, or a rook for two minor pieces."
     ],
     [
      "Control of a key file or square",
      "An open file, an outpost."
     ],
     [
      "Lead in development",
      "A faster-developed army."
     ],
     [
      "Initiative",
      "You are making the threats."
     ],
     [
      "King safety",
      "One king is more exposed."
     ]
    ]
   },
   {
    "t": "p",
    "text": "The plan follows from the list: use your strengths, attack the opponent's weaknesses, and avoid positions where his strengths count."
   }
  ]
 },
 {
  "id": "static-dynamic",
  "topic": "Planning",
  "title": "Static and dynamic advantages",
  "summary": "The difference between lasting and temporary strengths.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Static advantages",
     "Dynamic advantages"
    ],
    "rows": [
     [
      "Better pawn structure.",
      "Lead in development."
     ],
     [
      "Outposts and weak squares.",
      "The initiative."
     ],
     [
      "The bishop pair in a stable position.",
      "Attack on an exposed king."
     ],
     [
      "A good minor piece against a bad one.",
      "Open lines for the pieces."
     ]
    ]
   },
   {
    "t": "p",
    "text": "Static advantages last, so you can play slowly. Dynamic advantages fade, so you have to use them quickly. If you have a static edge, avoid sharp play. If you only have a dynamic one, cash it in now."
   }
  ]
 },
 {
  "id": "exchange-sac",
  "topic": "Planning",
  "title": "The exchange sacrifice",
  "summary": "Giving a rook for a minor piece to gain something more valuable.",
  "blocks": [
   {
    "t": "p",
    "text": "Tigran Petrosian often gave up a rook for a bishop or a knight when it destroyed the opponent's pawn structure, secured a strong knight or killed the opponent's counterplay. The result was a position that was worth more than the material."
   },
   {
    "t": "ul",
    "items": [
     "Look for blocked or passive rooks that do little.",
     "Check what you get: a strong pawn centre, a king under attack or a fortress.",
     "Count your compensation honestly. A pawn or two and a lasting pull is a good deal."
    ]
   },
   {
    "t": "p",
    "text": "See the Tactics tab for the tactical version, where the exchange sacrifice wins at once."
   }
  ]
 },
 {
  "id": "converting",
  "topic": "Planning",
  "title": "Converting an advantage",
  "summary": "How to turn a better position into a win without giving the opponent counterplay.",
  "blocks": [
   {
    "t": "p",
    "text": "Winning a won position is a separate skill from getting one. Capablanca converted by simplifying. Karpov did it by slowly removing every counter-chance."
   },
   {
    "t": "ul",
    "items": [
     "Do not rush. Take away the opponent's counterplay first.",
     "Trade pieces, especially his active ones.",
     "Make your advantage permanent: for example, a passed pawn that cannot be blockaded.",
     "Keep your king safe, because blunders happen when the opponent has nothing to lose.",
     "Do not relax before the game is over."
    ]
   }
  ]
 },
 {
  "id": "find-plan",
  "topic": "Planning",
  "title": "How to find a plan",
  "summary": "A routine for quiet positions.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Check for tactics for both sides. Is anything hanging? Are there forcing moves?",
     "List the imbalances: structure, pieces, space, king safety.",
     "Find the weakest point in the opponent's camp, and the weakest piece in yours.",
     "Pick a plan that uses your strengths against his weaknesses.",
     "Pick the move that improves your worst piece or serves the plan.",
     "Before you play it, ask what the opponent threatens."
    ]
   },
   {
    "t": "note",
    "text": "The plan can be small, for example improving a knight, but it must be a plan. Moves without a purpose lose slowly."
   }
  ]
 },
 {
  "id": "endgame-principles",
  "topic": "Endgames",
  "title": "Endgame essentials",
  "summary": "The principles that apply to almost every ending.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "The king becomes a strong piece. Bring it toward the centre and the action.",
     "Passed pawns are very strong. Create them, support them and stop the opponent's.",
     "Put rooks behind passed pawns.",
     "Count moves. Many endings are a race.",
     "Activity is more valuable than a pawn. An active rook beats a passive one.",
     "Keep pawns on both sides when ahead, because it makes the extra material count."
    ]
   },
   {
    "t": "p",
    "text": "Capablanca's advice was to study the endgame first. Endgame knowledge makes it easy to judge middlegame trades."
   }
  ]
 },
 {
  "id": "opposition",
  "topic": "Endgames",
  "title": "Opposition and key squares",
  "summary": "The king and pawn endings that every player should know.",
  "blocks": [
   {
    "t": "board",
    "fen": "8/8/8/4k3/8/4K3/8/8 w - - 0 1",
    "caption": "The kings face each other with one square between them: whoever must move gives way.",
    "marks": {
     "e3": "target",
     "e5": "target"
    },
    "arrows": []
   },
   {
    "t": "p",
    "text": "When the kings stand on the same file or rank with one empty square between them, the player who does not have to move has the opposition. The other king must step aside, and the first king can advance."
   },
   {
    "t": "ul",
    "items": [
     "With the opposition, your king reaches the key squares in front of your pawn.",
     "A king on the sixth rank in front of its pawn usually wins.",
     "The rook pawn is an exception: with the defending king in the corner, it often draws.",
     "Triangulation is a way of losing a tempo to pass the move to the opponent."
    ]
   }
  ]
 },
 {
  "id": "rook-endings",
  "topic": "Endgames",
  "title": "Rook endings",
  "summary": "The most common endings, and the rules that save or win them.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Rooks belong behind passed pawns, yours or the opponent's.",
     "An active rook is worth more than a pawn.",
     "Cut the enemy king off from the pawn along a file or rank.",
     "The Philidor position is a standard defence: keep the rook on the sixth rank until the pawn advances, then check from behind.",
     "The Lucena position is the standard win: build a bridge with the rook on the fourth rank."
    ]
   },
   {
    "t": "p",
    "text": "Rook endings have a reputation for being drawish, because the defending side can often use activity to make up for a missing pawn."
   }
  ]
 },
 {
  "id": "bishop-knight-ending",
  "topic": "Endgames",
  "title": "Minor piece endings",
  "summary": "Bishops, knights and the mistakes that cost the game.",
  "blocks": [
   {
    "t": "p",
    "text": "Endings with bishops and knights are among the most subtle in chess. The right piece depends on where the pawns are, and small differences decide the result."
   },
   {
    "t": "ul",
    "items": [
     "Bishops are better when there are pawns on both wings.",
     "Knights are better in blocked positions and near the pawns.",
     "Same-coloured bishops need good pawn placement. Keep your pawns on the opposite colour.",
     "Opposite-coloured bishops often draw. See the guide on them.",
     "A knight that cannot find safe squares is a liability."
    ]
   }
  ]
 },
 {
  "id": "masters-ideas",
  "topic": "Masters",
  "title": "The strategic ideas of the masters",
  "summary": "Who taught what, from Philidor to the engine era.",
  "blocks": [
   {
    "t": "p",
    "text": "Chess strategy was built by individual players, each of whom added an idea the next generation took for granted. This table lists the big ideas with the books where they are explained."
   },
   {
    "t": "table",
    "head": [
     "Master",
     "Idea",
     "Where to read"
    ],
    "rows": [
     [
      "Philidor",
      "Pawns shape the game. Use the pawn chain as an attacking weapon.",
      "Analyse du jeu des Échecs (1749)"
     ],
     [
      "Steinitz",
      "Accumulate small advantages. Attack only when you have one.",
      "The Modern Chess Instructor (1889)"
     ],
     [
      "Tarrasch",
      "Rules of development, mobility and rooks behind passed pawns.",
      "The Game of Chess"
     ],
     [
      "Lasker",
      "Play the opponent as well as the position. Struggle always has a point.",
      "Lasker's Manual of Chess (1925)"
     ],
     [
      "Capablanca",
      "Simplicity, endgame technique, natural piece placement.",
      "Chess Fundamentals (1921)"
     ],
     [
      "Réti",
      "Control the centre from a distance. Think in new ways.",
      "Modern Ideas in Chess (1923)"
     ],
     [
      "Nimzowitsch",
      "Prophylaxis, blockade, overprotection and restraint.",
      "My System (1925)"
     ],
     [
      "Alekhine",
      "Attack with complex combinations and deep preparation.",
      "My Best Games of Chess"
     ],
     [
      "Botvinnik",
      "Scientific preparation and a deep, dynamic style.",
      "Game collections and the Soviet school"
     ],
     [
      "Petrosian",
      "Prophylaxis, the exchange sacrifice and unbreakable defence.",
      "His annotated games"
     ],
     [
      "Tal",
      "Complicated attacks that overload the opponent's calculation.",
      "The Life and Games of Mikhail Tal"
     ],
     [
      "Fischer",
      "Clarity, precise preparation, and endgame mastery.",
      "My 60 Memorable Games"
     ],
     [
      "Karpov",
      "Squeeze and restrict until no counterplay remains.",
      "His collected games"
     ],
     [
      "Kasparov",
      "Initiative, preparation and dynamic imbalance.",
      "My Great Predecessors"
     ],
     [
      "Carlsen",
      "Universal technique, small advantages that grow.",
      "His recent games"
     ],
     [
      "The engines",
      "Activity can matter more than material. Defend resourcefully.",
      "AlphaZero games, Stockfish analysis"
     ]
    ]
   },
   {
    "t": "note",
    "text": "Reading the masters is a good habit, but read with a board and test every idea in your own games."
   }
  ]
 },
 {
  "id": "modern-practice",
  "topic": "Training",
  "title": "Modern best practices for improving",
  "summary": "What strong coaches and recent research agree on.",
  "blocks": [
   {
    "t": "p",
    "text": "Many methods have been tried, and the ones that last share the same core: regular tactics, honest analysis of your own games, endgame knowledge, and a repertoire you understand."
   },
   {
    "t": "table",
    "head": [
     "Activity",
     "Why",
     "How much"
    ],
    "rows": [
     [
      "Tactics",
      "Pattern recognition wins most games below master level.",
      "10 to 30 minutes most days."
     ],
     [
      "Game analysis",
      "You learn most from your own mistakes.",
      "Review every serious game, first without an engine, then with one."
     ],
     [
      "Endgames",
      "They make strategy easier to judge and win half-points.",
      "One or two sessions a week."
     ],
     [
      "Openings",
      "A small repertoire you understand beats a big one you have memorised.",
      "Learn the ideas and typical plans, not only the moves."
     ],
     [
      "Playing",
      "Practice at long time controls develops calculation.",
      "Games of at least 15 minutes per side."
     ]
    ]
   },
   {
    "t": "h",
    "text": "Thinking process"
   },
   {
    "t": "ul",
    "items": [
     "Start every move by checking checks, captures and threats for both sides.",
     "Identify candidate moves and calculate each line to the end once, instead of jumping between them.",
     "Before you play, do a blunder check: does my move leave something hanging?",
     "Spend more time in critical positions and less in simple ones."
    ]
   },
   {
    "t": "h",
    "text": "Using engines well"
   },
   {
    "t": "ul",
    "items": [
     "Analyse the game yourself before you look at the engine.",
     "Ask why the engine's move is better, not only what it is.",
     "Use multiple lines to compare candidate moves.",
     "Do not memorise engine lines you do not understand."
    ]
   },
   {
    "t": "note",
    "text": "Consistency matters more than intensity. Thirty minutes a day beats a long session once a week."
   }
  ]
 },
 {
  "id": "thinking-routine",
  "topic": "Training",
  "title": "A thinking routine for every move",
  "summary": "Checks, captures, threats, and the blunder check.",
  "blocks": [
   {
    "t": "p",
    "text": "Strong players do not think faster. They think in a fixed order, so they do not miss the obvious."
   },
   {
    "t": "ul",
    "items": [
     "1. What changed? Look at the opponent's last move and what it threatens.",
     "2. Check my checks, captures and threats, and then my opponent's.",
     "3. List two or three candidate moves.",
     "4. Calculate each line to a quiet position, once.",
     "5. Choose the best, and run a blunder check: does it hang a piece, allow a fork or a back-rank mate?"
    ]
   },
   {
    "t": "p",
    "text": "Alexander Kotov's classic book Think Like a Grandmaster recommends the same discipline: list the candidate moves, then calculate each line once instead of jumping back and forth between them."
   }
  ]
 }
]
