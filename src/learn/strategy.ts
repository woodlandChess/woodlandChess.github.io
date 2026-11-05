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
 },
 {
  "id": "phases",
  "topic": "Foundations",
  "title": "The three phases of the game",
  "summary": "Opening, middlegame and endgame, and how your priorities change.",
  "blocks": [
   {
    "t": "p",
    "text": "A game is usually divided into three phases, though the borders are blurred. Each phase has its own priorities, and strong players change their thinking as the phase changes."
   },
   {
    "t": "table",
    "head": [
     "Phase",
     "Main goals",
     "Typical mistakes"
    ],
    "rows": [
     [
      "Opening",
      "Develop pieces, control the centre, castle, avoid early tactics.",
      "Moving the same piece twice, bringing the queen out early, ignoring the centre."
     ],
     [
      "Middlegame",
      "Make a plan: attack a weakness, improve the worst piece, create threats or defend.",
      "Drifting without a plan, missing tactics, trading the wrong pieces."
     ],
     [
      "Endgame",
      "Activate the king, create and support passed pawns, use technique.",
      "Passive play, leaving the king at home, losing the opposition."
     ]
    ]
   },
   {
    "t": "ul",
    "items": [
     "The king hides in the opening and middlegame and becomes a fighter in the endgame.",
     "Piece values change: pawns grow more valuable as pieces come off the board.",
     "Plans differ too. In the middlegame you can attack the king. In the endgame you promote pawns."
    ]
   },
   {
    "t": "note",
    "text": "Many games are decided at the moment of transition: a trade of queens, for example, can turn a middlegame attack into an endgame where structure matters."
   }
  ]
 },
 {
  "id": "open-closed",
  "topic": "Foundations",
  "title": "Open and closed positions",
  "summary": "How the pawn structure decides which pieces and plans are best.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Open positions",
     "Closed positions"
    ],
    "rows": [
     [
      "Pawns are traded and files and diagonals are open.",
      "Pawns are locked in the centre, with few open lines."
     ],
     [
      "Bishops, rooks and queens are strong.",
      "Knights are often strong, because they can jump over the pawns."
     ],
     [
      "Speed and development matter. Tactics decide.",
      "Plans and pawn breaks matter. Manoeuvring decides."
     ],
     [
      "The king in the centre is in danger.",
      "The king can be safe in the centre for a while."
     ]
    ]
   },
   {
    "t": "p",
    "text": "You can steer the game. If you have the bishop pair or a lead in development, open the position. If you have a space advantage or good knights, keep it closed and prepare a break."
   }
  ]
 },
 {
  "id": "material",
  "topic": "Foundations",
  "title": "Material values and when they change",
  "summary": "Why the numbers 1, 3, 3, 5 and 9 are only a guide.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Piece",
     "Typical value",
     "Notes"
    ],
    "rows": [
     [
      "Pawn",
      "1",
      "Worth more in the endgame, especially a passed pawn."
     ],
     [
      "Knight",
      "3",
      "Better in closed positions."
     ],
     [
      "Bishop",
      "3",
      "Better in open positions. The pair is worth about half a pawn extra."
     ],
     [
      "Rook",
      "5",
      "Needs open files. Two rooks are roughly equal to a queen."
     ],
     [
      "Queen",
      "9",
      "The strongest piece, but easy to harass."
     ]
    ]
   },
   {
    "t": "ul",
    "items": [
     "The exchange (a rook for a minor piece) is worth about two pawns.",
     "A strong passed pawn can be worth more than a piece.",
     "Activity can be worth more than material, which is why gambits and sacrifices work.",
     "Engines weigh these things together. Use the numbers to count, and judgment to decide."
    ]
   }
  ]
 },
 {
  "id": "tension",
  "topic": "Foundations",
  "title": "Pawn tension and when to resolve it",
  "summary": "Whether to capture, push or keep the tension.",
  "blocks": [
   {
    "t": "p",
    "text": "Pawn tension means that two pawns attack each other and either side can capture. Resolving it changes the structure for good, so the timing matters."
   },
   {
    "t": "ul",
    "items": [
     "Capture when the resulting structure favours you, for example when it gives you a passed pawn or leaves the opponent with a weak pawn.",
     "Keep the tension when the opponent has to commit first or when releasing it helps the opponent.",
     "Push the pawn when it gains space and the structure stays healthy.",
     "Do not release tension just because it feels uncomfortable."
    ]
   }
  ]
 },
 {
  "id": "opening-to-middlegame",
  "topic": "Foundations",
  "title": "From opening to middlegame",
  "summary": "How to find a plan once the opening theory runs out.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Look at the pawn structure. It tells you the typical plans.",
     "Ask where each piece belongs, and which one is worst.",
     "Decide where the king is safest and where the opponent's king is weakest.",
     "Choose a side of the board to play on, based on space and open files.",
     "Check tactics for both sides every move."
    ]
   },
   {
    "t": "p",
    "text": "Many opening mistakes at club level are not about theory. They come from reaching a position without a plan. A simple rule helps: improve your worst piece until a concrete idea appears."
   }
  ]
 },
 {
  "id": "iqp",
  "topic": "Pawns",
  "title": "The isolated queen's pawn (IQP)",
  "summary": "The most common isolated pawn: strength and weakness at the same time.",
  "blocks": [
   {
    "t": "board",
    "fen": "2r2rk1/pp2bppp/4pn2/8/3P4/2N1BN2/PP3PPP/R2Q1RK1 w - - 0 1",
    "caption": "White has an isolated pawn on d4. The square in front of it, d5, is the key to the fight.",
    "marks": {
     "d4": "target",
     "d5": "target"
    },
    "arrows": []
   },
   {
    "t": "table",
    "head": [
     "For the side with the pawn",
     "For the side against it"
    ],
    "rows": [
     [
      "Space and open lines for the pieces.",
      "Blockade the pawn with a knight on d5."
     ],
     [
      "Attacking chances against the king.",
      "Trade pieces, because the weakness shows more in the endgame."
     ],
     [
      "The pawn can advance to d5 at the right moment.",
      "Pressure the pawn along the d-file."
     ]
    ]
   },
   {
    "t": "note",
    "text": "As a rule, the side with the isolated pawn should attack before the pieces come off the board. The other side should simplify."
   }
  ]
 },
 {
  "id": "hanging-pawns",
  "topic": "Pawns",
  "title": "Hanging pawns",
  "summary": "Two connected pawns on neighbouring files with no friendly pawns beside them.",
  "blocks": [
   {
    "t": "p",
    "text": "Hanging pawns, usually on c and d, control many central squares and can drive an attack. They are also a target, because they have no pawn support. The side with hanging pawns must keep them mobile, or they become weak."
   },
   {
    "t": "ul",
    "items": [
     "Advance them with the right timing to create a passed pawn.",
     "Keep the pieces active, so the pawns are protected by pieces.",
     "The opponent attacks them with pieces and tries to force one to move, which leaves the other exposed."
    ]
   }
  ]
 },
 {
  "id": "structures",
  "topic": "Pawns",
  "title": "Typical pawn structures from the openings",
  "summary": "A map of the structures that come up again and again.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Structure",
     "What it looks like",
     "Typical plans"
    ],
    "rows": [
     [
      "Carlsbad",
      "White d4 and e3 against Black d5 and e6, c-file half open.",
      "White: minority attack with b4 and b5. Black: pressure on the e-file."
     ],
     [
      "Maroczy bind",
      "White pawns on c4 and e4 against Black d6.",
      "White clamps d5 and b5. Black looks for a break with b5 or f5."
     ],
     [
      "Hedgehog",
      "Black pawns on a6, b6, d6 and e6.",
      "Black waits, then breaks with b5 or d5."
     ],
     [
      "Stonewall",
      "A chain of pawns on c6, d5, e6 and f5.",
      "A strong grip on e4. A weak e5 square."
     ],
     [
      "French advance chain",
      "White d4 and e5 against Black d5 and e6.",
      "Attack the base of the chain with ...c5 and ...f6."
     ],
     [
      "King's Indian",
      "Black pawns on d6 and e5 against White c4, d5 and e4.",
      "White: queenside play. Black: kingside pawn storm."
     ],
     [
      "Benoni",
      "Black c5, d6 and e6 against White d5 and e4.",
      "White: e5 break. Black: queenside majority."
     ]
    ]
   }
  ]
 },
 {
  "id": "doubled",
  "topic": "Pawns",
  "title": "Doubled and backward pawns",
  "summary": "When a structural weakness matters, and when it does not.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Doubled pawns are weak in the endgame, because one cannot support the other.",
     "They can be strong if they open a file for a rook or control important squares.",
     "A backward pawn is weak when the square in front of it can be taken by an enemy piece.",
     "A backward pawn on a half-open file is a target for the opponent's rooks."
    ]
   },
   {
    "t": "p",
    "text": "Before you accept doubled pawns, ask what you receive in return: the bishop pair, an open file or a lead in development."
   }
  ]
 },
 {
  "id": "knight-play",
  "topic": "Pieces",
  "title": "Knight manoeuvres",
  "summary": "How to bring a knight to a good square, and why the rim is dim.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "A knight in the centre controls up to eight squares. On the rim it controls only four.",
     "Plan the route: usually two or three moves to a better square.",
     "Outposts are the dream squares, supported by a pawn and safe from enemy pawns.",
     "In closed positions, knights can reroute behind the pawn chain.",
     "A knight is weaker near the edge of the board, where it can be trapped."
    ]
   },
   {
    "t": "p",
    "text": "A common manoeuvre is Nb1-d2-f1-g3, bringing a knight from the back rank to the kingside in three moves."
   }
  ]
 },
 {
  "id": "bishop-play",
  "topic": "Pieces",
  "title": "Bishop play",
  "summary": "Long diagonals, fianchettoes and the bishop that belongs outside the pawn chain.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Put bishops on open diagonals, aimed at the enemy king or at a weak pawn.",
     "A fianchettoed bishop on g2 or b2 controls the long diagonal and protects the king.",
     "Keep the bishop outside the pawn chain, so pawns do not block it.",
     "Trade a bad bishop, but keep the good one.",
     "Bishops of opposite colours attack in a way that the opponent cannot defend easily."
    ]
   }
  ]
 },
 {
  "id": "queen-play",
  "topic": "Pieces",
  "title": "Queen play",
  "summary": "How to use the strongest piece without losing time.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Develop the other pieces first. An early queen is a target.",
     "Keep the queen on a safe square, with access to both wings.",
     "The queen is best placed behind other pieces, as in a battery.",
     "Beware of grabbing pawns far from home with the queen, as the Poisoned Pawn lines show.",
     "A queen trade changes the character of the game, so ask whether it helps you."
    ]
   }
  ]
 },
 {
  "id": "minor-vs-rook",
  "topic": "Pieces",
  "title": "Two minor pieces against a rook",
  "summary": "How to evaluate the most common material imbalance.",
  "blocks": [
   {
    "t": "p",
    "text": "Two minor pieces (6 points) against a rook and a pawn (6 points) is a typical imbalance. Which side is better depends on the position."
   },
   {
    "t": "table",
    "head": [
     "Favours the minor pieces",
     "Favours the rook"
    ],
    "rows": [
     [
      "Many pawns on the board, closed centre.",
      "Open files and an exposed enemy king."
     ],
     [
      "The king is safe and the pieces coordinate well.",
      "The rook can reach the seventh rank."
     ],
     [
      "In the middlegame, with many pieces.",
      "In an endgame with few pieces and passed pawns."
     ]
    ]
   }
  ]
 },
 {
  "id": "king-in-centre",
  "topic": "Attack and defence",
  "title": "The king in the centre",
  "summary": "When it is dangerous, and when it is fine.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Danger: open centre files and the opponent ahead in development.",
     "Often fine: closed centre, with locked pawns and no way for the opponent to open lines.",
     "If you cannot castle, find a safe square, or build a pawn shield in the centre.",
     "Hitting a king in the centre is often the reason for gambits and sacrifices."
    ]
   },
   {
    "t": "p",
    "text": "The classic punishment is to open the centre with a pawn break or sacrifice. The Opera Game shows what happens when a king stays in the centre against a lead in development."
   }
  ]
 },
 {
  "id": "castling-decision",
  "topic": "Attack and defence",
  "title": "Which way to castle?",
  "summary": "Kingside, queenside or later: how to decide.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Choice",
     "Good because",
     "Watch out for"
    ],
    "rows": [
     [
      "Kingside",
      "Fast, and the king is protected by three pawns.",
      "Pawn storms and the Greek gift sacrifice."
     ],
     [
      "Queenside",
      "Rook reaches the d-file faster and the queen is more active.",
      "The king is nearer the open a-file and b-file. Slower to arrange."
     ],
     [
      "Delaying",
      "Keeps options open and hides your plan.",
      "Danger of getting stuck in the centre."
     ]
    ]
   },
   {
    "t": "p",
    "text": "Castling on opposite sides leads to sharp games. The player who attacks faster wins. Castling on the same side usually leads to quieter play with a focus on structure."
   }
  ]
 },
 {
  "id": "weaknesses",
  "topic": "Planning",
  "title": "Creating and attacking weaknesses",
  "summary": "The method behind most positional wins.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "A weakness is something you can attack: an isolated pawn, a weak square, an exposed king.",
     "One weakness can be defended. Two are much harder, so try to create a second one.",
     "Attack weaknesses with pieces, because pawns cannot attack backwards.",
     "Fix the weakness, so it cannot move away, then attack it.",
     "Trade the pieces that defend it."
    ]
   },
   {
    "t": "note",
    "text": "The principle of two weaknesses explains many master games: first force a weakness on one side, then switch to another wing."
   }
  ]
 },
 {
  "id": "squeeze",
  "topic": "Planning",
  "title": "The squeeze",
  "summary": "How Karpov and the Soviet school won without any obvious tactics.",
  "blocks": [
   {
    "t": "p",
    "text": "A squeeze takes away the opponent's moves, bit by bit, until every move loses something. It needs patience and technique."
   },
   {
    "t": "ul",
    "items": [
     "Gain space and control key squares with pawns and pieces.",
     "Use prophylaxis to stop the opponent's freeing breaks.",
     "Trade the opponent's active pieces and keep your own.",
     "Make small improvements each move. Do not hurry.",
     "Look for zugzwang in the endgame."
    ]
   }
  ]
 },
 {
  "id": "transformation",
  "topic": "Planning",
  "title": "Transforming an advantage",
  "summary": "Turning one kind of advantage into another that is easier to use.",
  "blocks": [
   {
    "t": "p",
    "text": "Advantages can be converted. A lead in development can become material. Material can become a passed pawn. A space advantage can become a lasting weakness. Strong players know when to convert."
   },
   {
    "t": "ul",
    "items": [
     "A positional advantage is permanent, so convert only when it is concrete.",
     "A dynamic advantage fades, so convert it soon, usually into material or structure.",
     "Trading to an endgame turns a better structure into a passed pawn."
    ]
   }
  ]
 },
 {
  "id": "counterattack",
  "topic": "Attack and defence",
  "title": "Counterattack",
  "summary": "How to defend by attacking when the opponent presses, and when it works.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Look for the opponent's weakest point when you are being attacked.",
     "A counter-threat can be more powerful than a defence, especially if it hits the king or the queen.",
     "Timing is critical: you must be faster, or you must create a threat that has to be answered.",
     "A counterattack on the other wing works well when the position is open."
    ]
   }
  ]
 },
 {
  "id": "dynamic-play",
  "topic": "Planning",
  "title": "Dynamic play",
  "summary": "Activity over material, as shown by Tal, Kasparov and the engines.",
  "blocks": [
   {
    "t": "p",
    "text": "Dynamic play values initiative and piece activity above static features like a better structure. A dynamic player sacrifices a pawn or two for open lines and fast development."
   },
   {
    "t": "ul",
    "items": [
     "Count activity, not only material.",
     "Keep making threats, so the opponent never gets time to consolidate.",
     "Keep your own king safe enough.",
     "Avoid slow positions where the opponent's extra pawn counts."
    ]
   },
   {
    "t": "p",
    "text": "Modern engines have confirmed this view: they often prefer active, risky-looking moves that human players would reject."
   }
  ]
 },
 {
  "id": "evaluate",
  "topic": "Planning",
  "title": "A checklist for evaluating a position",
  "summary": "The factors that decide who is better.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Factor",
     "Questions"
    ],
    "rows": [
     [
      "Material",
      "Who is ahead? Is there compensation?"
     ],
     [
      "King safety",
      "Which king is more exposed?"
     ],
     [
      "Piece activity",
      "Which pieces are active and which are passive?"
     ],
     [
      "Pawn structure",
      "Weaknesses, passed pawns, majorities."
     ],
     [
      "Space and files",
      "Who controls more squares and open files?"
     ],
     [
      "Development",
      "Who is ahead?"
     ],
     [
      "Initiative",
      "Who makes the threats?"
     ],
     [
      "Tactics",
      "Is there a forcing line for either side?"
     ]
    ]
   },
   {
    "t": "note",
    "text": "Evaluate first, then plan. If you cannot name the main feature of the position, you are not ready to make a plan."
   }
  ]
 },
 {
  "id": "king-pawn",
  "topic": "Endgames",
  "title": "King and pawn endings",
  "summary": "The rules that decide almost every pawn ending.",
  "blocks": [
   {
    "t": "board",
    "fen": "8/8/8/8/P6k/8/8/7K w - - 0 1",
    "caption": "Rule of the square: the black king on h4 is outside the square of the a4 pawn, so the pawn promotes.",
    "marks": {
     "a4": "target",
     "h4": "target"
    },
    "arrows": []
   },
   {
    "t": "ul",
    "items": [
     "The opposition decides who must give way.",
     "Key squares: a king on a key square in front of its pawn wins.",
     "The rule of the square tells you whether a king catches a runaway pawn.",
     "An outside passed pawn drags the enemy king away from the rest of the board.",
     "Triangulation wins a tempo when the opposition is wrong.",
     "Rook pawns are special: a king in the corner draws more often."
    ]
   }
  ]
 },
 {
  "id": "rook-positions",
  "topic": "Endgames",
  "title": "Rook endings: the four standard positions",
  "summary": "Lucena, Philidor, Vančura and the Tarrasch rule.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Name",
     "Idea",
     "Who benefits"
    ],
    "rows": [
     [
      "Lucena",
      "Build a bridge with the rook to promote a pawn on the seventh rank.",
      "The side with the pawn."
     ],
     [
      "Philidor",
      "Keep the rook on the sixth rank, then check from behind.",
      "The defender."
     ],
     [
      "Vančura",
      "Attack a rook pawn from the side.",
      "The defender."
     ],
     [
      "Tarrasch rule",
      "Put your rook behind a passed pawn, yours or the opponent's.",
      "Both sides."
     ]
    ]
   },
   {
    "t": "p",
    "text": "Many rook endings are drawn with correct play. The key is activity: an active rook is worth more than a pawn."
   }
  ]
 },
 {
  "id": "queen-endings",
  "topic": "Endgames",
  "title": "Queen endings",
  "summary": "Perpetual check, passed pawns and king safety.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Perpetual check is the main resource of the defender.",
     "Centralise the queen, and keep the king close to its pawns.",
     "Passed pawns are very strong, supported by the queen.",
     "A queen and pawn ending can be lost by a single careless move, so calculate carefully."
    ]
   }
  ]
 },
 {
  "id": "bishop-vs-knight",
  "topic": "Endgames",
  "title": "Bishop against knight endings",
  "summary": "Which piece is better, and why.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Bishops are better when pawns are on both wings, because they can cover the whole board.",
     "Knights are better in closed positions with pawns on one side.",
     "A knight needs support from pawns, and is weaker in the open.",
     "A bishop that is blocked by its own pawns is bad."
    ]
   }
  ]
 },
 {
  "id": "drawing-techniques",
  "topic": "Endgames",
  "title": "How to save a worse endgame",
  "summary": "Fortress, stalemate, perpetual check and trading down.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Fortress: set up a defence that cannot be broken.",
     "Stalemate: look for tricks when the king has no moves.",
     "Perpetual check: harass the king until the opponent repeats.",
     "Opposite-coloured bishops: trade other pieces to reach one.",
     "Activity: even a pawn down, an active rook can draw."
    ]
   },
   {
    "t": "note",
    "text": "Save the half-point. A draw from a bad position is a good result, and many strong players are known for their defensive skill."
   }
  ]
 },
 {
  "id": "endgame-technique",
  "topic": "Endgames",
  "title": "Endgame technique",
  "summary": "Zugzwang, triangulation, passed pawns and patient play.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Make progress step by step. Improve your king first, then the pieces, then break through.",
     "Do not rush the pawn. Support it with the king.",
     "Avoid unnecessary pawn moves that create weaknesses.",
     "Use zugzwang: a position where any move by the opponent is a mistake.",
     "Calculate concrete lines before you simplify."
    ]
   }
  ]
 },
 {
  "id": "time-management",
  "topic": "Training",
  "title": "Time management",
  "summary": "Spending the clock where it matters.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Play the opening quickly, with moves you know.",
     "Use more time in critical positions: tactics, structure changes, trades.",
     "Do not spend long on a move where there is only one sensible choice.",
     "Use increments: they exist to be used.",
     "Check your time every few moves, and keep a reserve for the end."
    ]
   },
   {
    "t": "p",
    "text": "Time trouble causes more lost games than any opening. A good habit is to set a rough budget, such as two minutes a move in a slow game, and to stay near it."
   }
  ]
 },
 {
  "id": "psychology",
  "topic": "Training",
  "title": "The psychology of playing",
  "summary": "Tilt, confidence, and how to handle losing.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Tilt is playing worse because of emotion. A short break stops it.",
     "Do not play revenge games straight after a loss.",
     "Treat every loss as information, not as a verdict.",
     "Build a pre-game routine: sleep, food, a short warm-up with tactics.",
     "Emanuel Lasker taught that you should play the opponent as well as the position: choose lines that suit their style."
    ]
   }
  ]
 },
 {
  "id": "repertoire",
  "topic": "Training",
  "title": "Building an opening repertoire",
  "summary": "What to learn, and how to remember it.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Choose openings that fit your style: attacking, solid or flexible.",
     "As White, pick a system against everything, such as 1.e4 or 1.d4 and a plan.",
     "As Black, have one reply to 1.e4 and one to 1.d4.",
     "Learn the ideas behind the moves: the pawn breaks, the typical piece placement and the traps.",
     "Review your games to find where your preparation ended."
    ]
   },
   {
    "t": "note",
    "text": "Quality beats quantity. A small repertoire you understand is stronger than a big one you have memorised."
   }
  ]
 },
 {
  "id": "analyze-games",
  "topic": "Training",
  "title": "How to analyse your own games",
  "summary": "A process that finds the real reasons you lose.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Replay the game without an engine, and mark the moments where you were unsure.",
     "Write down what you thought at each moment.",
     "Run the engine to find the critical mistakes.",
     "Sort the errors: tactics, opening, strategy, endgame, time or nerves.",
     "Make a training plan from the biggest category of errors."
    ]
   }
  ]
 },
 {
  "id": "calculation",
  "topic": "Training",
  "title": "Calculation",
  "summary": "Seeing the future: how to analyse lines without getting lost.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "List the candidate moves, and look at forcing ones first: checks, captures and threats.",
     "Calculate each line to a quiet position, then evaluate.",
     "Visualise the board. Practise by solving puzzles without moving the pieces.",
     "Do not repeat the same line over and over. If you have analysed it, trust the result.",
     "Check the opponent's best reply at every step."
    ]
   },
   {
    "t": "p",
    "text": "Alexander Kotov described the \"tree of analysis\" in Think Like a Grandmaster: a good player keeps a clear list of lines and does not jump back to the beginning."
   }
  ]
 },
 {
  "id": "stronger-weaker",
  "topic": "Training",
  "title": "Playing stronger and weaker opponents",
  "summary": "How to adjust your approach.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Against a stronger player",
     "Against a weaker player"
    ],
    "rows": [
     [
      "Play solid, and avoid early risks.",
      "Play principled chess and keep making threats."
     ],
     [
      "Use your preparation and pose practical problems.",
      "Do not overpress. Keep control of the position."
     ],
     [
      "Be patient: strong players also make mistakes.",
      "Avoid cheap tricks that give a draw."
     ]
    ]
   }
  ]
 },
 {
  "id": "tournament",
  "topic": "Training",
  "title": "The day of a tournament",
  "summary": "Practical advice that saves half-points.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Sleep well and eat before the round.",
     "Check the pairing and review your opening for that opponent.",
     "Bring a pen, a water bottle and a calm mind.",
     "Write down every move, and read your move before you play it.",
     "After the game, analyse, even if you won."
    ]
   }
  ]
 },
 {
  "id": "practical-chances",
  "topic": "Training",
  "title": "Practical chances and swindles",
  "summary": "What to play when you are lost.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Choose the move that sets the most problems, not the move that looks best on paper.",
     "Complicate the position, so the opponent has to find several only moves.",
     "Set traps that fit the opponent's style.",
     "Use the clock: strong players also make mistakes in time trouble.",
     "Look for stalemate and perpetual check tricks."
    ]
   }
  ]
 },
 {
  "id": "plateau",
  "topic": "Training",
  "title": "Breaking a rating plateau",
  "summary": "Why progress stops, and what to change.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "You repeat the same mistakes. Analyse your losses to find patterns.",
     "You play too many fast games. Add slower ones.",
     "You study openings only. Add tactics and endgames.",
     "You are afraid to lose. Play real games against stronger opponents.",
     "Rest matters: a break can bring a jump in strength."
    ]
   }
  ]
 },
 {
  "id": "classics",
  "topic": "Training",
  "title": "Learning from the classics",
  "summary": "Why replaying the masters' games works, and how to do it.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Play through the game on a board, and try to guess each move before it is played.",
     "Start with annotated games from different eras: Morphy, Capablanca, Tal, Fischer, Karpov, Kasparov, Carlsen.",
     "Pause at the critical moments and think for five minutes.",
     "Note the typical plans, and use them in your own games.",
     "Study complete games, not only the opening."
    ]
   }
  ]
 },
 {
  "id": "steinitz",
  "topic": "Masters",
  "title": "Steinitz's principles",
  "summary": "The first modern theory of chess strategy.",
  "blocks": [
   {
    "t": "table",
    "head": [
     "Principle",
     "Meaning"
    ],
    "rows": [
     [
      "Attack only with an advantage",
      "A premature attack fails against correct defence."
     ],
     [
      "Accumulate small advantages",
      "A better pawn structure or a better piece placement adds up."
     ],
     [
      "The king is a strong piece",
      "In the endgame, and sometimes even in the middlegame."
     ],
     [
      "Defend actively",
      "Stay flexible, and wait for the opponent to overreach."
     ],
     [
      "The centre is the key",
      "Control it, and the wings are easy to open."
     ]
    ]
   },
   {
    "t": "p",
    "text": "Steinitz's ideas were mocked at first, but they won him the first official World Championship in 1886 and became the basis of the classical school."
   }
  ]
 },
 {
  "id": "tarrasch",
  "topic": "Masters",
  "title": "Tarrasch's rules",
  "summary": "Clear rules for beginners, and the rooks behind passed pawns.",
  "blocks": [
   {
    "t": "ul",
    "items": [
     "Develop your pieces quickly, and do not waste time with the same piece.",
     "Control the centre with pawns and pieces.",
     "Mobility is the key: a position with active pieces is better.",
     "Place the rook behind a passed pawn. This is Tarrasch's rule.",
     "A bad bishop can be exchanged for a good knight."
    ]
   },
   {
    "t": "note",
    "text": "Siegbert Tarrasch was a teacher. His clear rules made him the Praeceptor Germaniae, the teacher of Germany, though he was sometimes too dogmatic."
   }
  ]
 }
]
