import type { ChessSchool } from '../stockfish'

/**
 * Reference roster for the style match.
 *
 * Seven style axes on a 0-10 scale where 5 is a typical elite player. They describe HOW a
 * player plays, never how strong they are (strength is deliberately left out: strong players
 * play strong moves in any style, so including it would just match you with weaker players).
 *
 *   attack    - initiative, king attacks, piece pressure near the enemy king
 *   sharpness - narrow, forcing positions (few good moves) versus calm ones with many options
 *   simplify  - readiness to trade pieces and reduce material
 *   risk      - sacrifices and deliberately unbalancing the game
 *   safety    - king safety, prophylaxis, solid structure
 *   endgame   - endgame orientation and technique
 *   open      - open games (1.e4 e5, 1...c5) versus closed or flank openings (d4, c4, Nf3)
 *
 * Basis: published computer studies of style (Guid & Bratko on position complexity and
 * material, aggression-by-material studies) combined with the standard chess-literature
 * characterisation of each player and their well-known opening repertoire. They are
 * calibrated reference profiles, not measurements; `scripts/measure-players.mjs` measures the
 * engine-free axes from any PGN file so individual entries can be replaced with real data.
 */
export const AXES = ['attack', 'sharpness', 'simplify', 'risk', 'safety', 'endgame', 'open'] as const
export type Axis = (typeof AXES)[number]
export type StyleVector = Record<Axis, number>

export const AXIS_LABEL: Record<Axis, string> = {
  attack: 'Attack', sharpness: 'Sharpness', simplify: 'Simplify', risk: 'Risk', safety: 'Safety', endgame: 'Endgame', open: 'Open play',
}
export const AXIS_HINT: Record<Axis, string> = {
  attack: 'Captures, checks and pressure near the enemy king',
  sharpness: 'How often only one move held up',
  simplify: 'Trading pieces and playing with less material',
  risk: 'Sacrifices and unbalancing the game',
  safety: 'Castling early and keeping the king covered',
  endgame: 'Time spent, and accuracy, in endgames',
  open: 'Open games (e-pawn) versus closed or flank openings',
}

export interface PlayerRef {
  name: string
  years: string
  school: ChessSchool
  /** What they are known for, in a few words. */
  known: string
  axes: [attack: number, sharpness: number, simplify: number, risk: number, safety: number, endgame: number, open: number]
}

const P = (name: string, years: string, school: ChessSchool, known: string, axes: PlayerRef['axes']): PlayerRef => ({ name, years, school, known, axes })

export const PLAYERS: PlayerRef[] = [
  // ── Romantic and early modern era
  P('Adolf Anderssen',      '1818–1879', 'Attacking',        'brilliant open-game sacrifices (the Immortal Game)',      [9.5, 9.0, 1.5, 9.0, 3.5, 3.5, 10]),
  P('Paul Morphy',          '1837–1884', 'Attacking',        'rapid development and open-game tactics',                 [8.5, 8.0, 2.0, 7.5, 4.5, 4.0, 10]),
  P('Mikhail Chigorin',     '1850–1908', 'Attacking',        'knight play and bold, original attacks',                  [7.5, 7.5, 3.0, 7.0, 4.0, 5.0, 8.5]),
  P('Wilhelm Steinitz',     '1836–1900', 'Positional',       'founder of positional theory; accumulating small edges',  [6.0, 7.5, 2.5, 5.0, 7.0, 5.5, 7.0]),
  P('Emanuel Lasker',       '1868–1941', 'Universal',        'practical, psychological play and endgame resilience',     [6.0, 6.5, 5.0, 5.5, 5.5, 8.5, 6.5]),
  P('Siegbert Tarrasch',    '1862–1934', 'Classical German', 'central control, development and clear principles',        [5.5, 5.0, 5.0, 3.5, 6.0, 6.0, 7.0]),
  P('Frank Marshall',       '1877–1944', 'Attacking',        'swindles and surprise attacking ideas',                   [8.0, 8.5, 3.0, 8.5, 3.0, 4.5, 8.5]),
  P('Rudolf Spielmann',     '1883–1942', 'Attacking',        'the "last knight of the king\'s gambit"; sacrificial attacks', [9.0, 9.0, 2.0, 9.0, 3.5, 4.0, 8.5]),
  P('Akiba Rubinstein',     '1880–1961', 'Positional',       'rook endgames and flawless technique',                    [4.0, 4.5, 6.0, 3.5, 6.0, 10,  4.5]),
  P('Aron Nimzowitsch',     '1886–1935', 'Defensive',        'prophylaxis, blockade and hypermodern ideas',             [4.0, 5.5, 3.5, 5.0, 7.5, 6.0, 2.5]),
  P('José Raúl Capablanca', '1888–1942', 'Positional',       'crystal-clear simplicity and endgame mastery',            [4.0, 2.5, 7.5, 2.5, 7.0, 9.5, 5.0]),
  P('Alexander Alekhine',   '1892–1946', 'Dynamic',          'deep combinations and fierce attacking preparation',      [9.0, 9.0, 2.5, 7.5, 3.5, 7.0, 6.0]),
  P('Richard Réti',         '1889–1929', 'Positional',       'hypermodern flank openings and long-range strategy',      [4.5, 5.5, 4.0, 5.0, 5.5, 5.5, 1.5]),
  P('Max Euwe',             '1901–1981', 'Positional',       'scientific, methodical positional play',                  [5.0, 5.0, 5.0, 4.0, 6.5, 6.0, 5.0]),
  P('Reuben Fine',          '1914–1993', 'American',         'clear, objective play and strong endgame technique',      [5.5, 5.0, 5.5, 4.0, 6.0, 7.5, 6.0]),
  // ── The Soviet era
  P('Paul Keres',           '1916–1975', 'Attacking',        'sharp open play and tactical imagination',                [7.5, 7.5, 3.5, 6.5, 5.0, 6.5, 8.5]),
  P('Mikhail Botvinnik',    '1911–1995', 'Soviet',           'rigorous preparation and balanced calculation',           [5.5, 6.0, 5.0, 4.5, 6.5, 7.0, 4.5]),
  P('Vasily Smyslov',       '1921–2010', 'Positional',       'harmony, piece coordination and endgame grace',           [3.5, 3.0, 7.0, 2.5, 7.5, 9.5, 5.5]),
  P('David Bronstein',      '1924–2006', 'Dynamic',          'creative, unorthodox ideas and tactical flair',           [8.0, 8.5, 2.5, 8.0, 4.0, 5.0, 8.0]),
  P('Mikhail Tal',          '1936–1992', 'Attacking',        'sacrificial attacks and the initiative',                  [10,  10,  1.5, 10,  2.5, 4.5, 9.0]),
  P('Tigran Petrosian',     '1929–1984', 'Defensive',        'prophylaxis, solid defence and the exchange sacrifice',   [2.5, 2.5, 3.5, 2.0, 10,  8.5, 3.0]),
  P('Efim Geller',          '1925–1998', 'Attacking',        'sharp King\'s Indian and Sicilian attacking play',        [7.5, 7.5, 3.5, 7.0, 4.0, 5.5, 8.5]),
  P('Boris Spassky',        '1937–',     'Universal',        'a universal style: attack and defence as needed',         [6.5, 6.0, 3.5, 5.5, 4.5, 6.0, 8.0]),
  P('Viktor Korchnoi',      '1931–2016', 'Dynamic',          'fighting counterattack and relentless resilience',        [7.0, 7.5, 4.0, 6.5, 4.5, 8.0, 6.5]),
  P('Anatoly Karpov',       '1951–',     'Positional',       'restriction, squeeze and flawless technique',             [3.5, 3.0, 7.5, 2.5, 8.5, 9.0, 6.0]),
  // ── 1970s to the 1990s
  P('Bobby Fischer',        '1943–2008', 'American',         'objective, precise play and 1.e4 clarity',                [7.0, 6.5, 5.0, 5.0, 5.5, 8.5, 9.5]),
  P('Bent Larsen',          '1935–2010', 'Dynamic',          'flank openings and fighting, original play',              [7.0, 7.0, 4.0, 7.0, 4.0, 5.5, 2.5]),
  P('Lajos Portisch',       '1937–',     'Hungarian',        'solid structures and technical, restrained risk',         [3.5, 3.5, 6.5, 2.5, 8.0, 8.0, 4.0]),
  P('Ulf Andersson',        '1951–',     'Defensive',        'ultra-solid simplification and endgame grinding',         [1.5, 2.0, 8.5, 1.5, 9.0, 9.5, 3.5]),
  P('Jan Timman',           '1951–',     'Dynamic',          'strategic depth with sharp opening ideas',                [6.0, 6.0, 4.5, 5.5, 5.0, 6.5, 6.0]),
  P('Garry Kasparov',       '1963–',     'Dynamic',          'active pieces, deep preparation and relentless pressure', [9.0, 8.5, 3.5, 7.0, 4.5, 7.0, 8.5]),
  P('Nigel Short',          '1965–',     'British',          'aggressive, kingside-attacking play',                     [7.5, 6.5, 4.0, 6.0, 4.5, 5.5, 8.0]),
  P('Vassily Ivanchuk',     '1969–',     'Dynamic',          'inexhaustible creativity and tactical depth',             [7.5, 8.0, 3.5, 7.5, 3.5, 6.5, 7.0]),
  P('Alexei Shirov',        '1972–',     'Attacking',        'fearless, sacrificial attacking chess',                   [9.0, 9.0, 2.5, 9.0, 3.0, 4.5, 8.5]),
  // ── The modern era
  P('Michael Adams',        '1971–',     'British',          'practical, resilient play and a sound Ruy Lopez',         [4.5, 4.5, 5.5, 3.0, 7.0, 7.0, 8.0]),
  P('Vladimir Kramnik',     '1975–',     'Positional',       'deep preparation, the Berlin Wall and clean technique',   [4.5, 4.5, 8.5, 3.5, 7.5, 9.0, 3.0]),
  P('Viswanathan Anand',    '1969–',     'Universal',        'speed, intuition and all-round flexibility',              [6.5, 6.0, 5.0, 5.0, 5.5, 6.5, 7.5]),
  P('Peter Svidler',        '1976–',     'Universal',        'creative, well-prepared and flexible',                    [6.0, 6.0, 5.0, 5.0, 5.0, 6.0, 7.0]),
  P('Veselin Topalov',      '1975–',     'Attacking',        'energetic, sacrificial, concrete attacking play',         [8.5, 8.5, 3.0, 8.0, 3.5, 5.0, 6.5]),
  P('Alexander Morozevich', '1977–',     'Attacking',        'unorthodox, provocative attacking ideas',                 [8.5, 9.0, 3.0, 8.5, 3.0, 4.5, 6.0]),
  P('Judit Polgár',         '1976–',     'Attacking',        'direct, tactical attacking chess',                        [8.5, 8.5, 3.0, 7.5, 4.0, 5.0, 9.0]),
  P('Peter Leko',           '1979–',     'Hungarian',        'ultra-solid, risk-averse positional play',                [2.5, 3.0, 7.0, 2.0, 8.5, 7.5, 6.5]),
  P('Boris Gelfand',        '1968–',     'Soviet',           'deep opening preparation and strategic play',             [4.5, 5.0, 6.0, 3.5, 6.5, 7.5, 5.0]),
  P('Teimour Radjabov',     '1987–',     'Dynamic',          'dynamic, uncompromising King\'s Indian play',             [6.5, 6.5, 4.0, 5.5, 5.0, 6.0, 3.5]),
  P('Levon Aronian',        '1982–',     'Dynamic',          'creative, tactical and imaginative',                      [7.0, 7.5, 3.5, 7.0, 4.0, 6.0, 6.0]),
  P('Magnus Carlsen',       '1990–',     'Universal',        'universal play; squeezing small edges in any ending',     [5.5, 5.5, 6.5, 4.5, 5.5, 10,  5.5]),
  P('Hikaru Nakamura',      '1987–',     'Dynamic',          'fast, practical, tactical and resourceful',               [7.5, 7.5, 4.5, 6.5, 4.0, 6.0, 7.5]),
  P('Sergey Karjakin',      '1990–',     'Defensive',        'tenacious defence and endgame resilience',                [3.5, 3.5, 6.5, 3.0, 8.0, 8.5, 7.0]),
  P('Fabiano Caruana',      '1992–',     'Universal',        'deep preparation and precise, classical play',            [5.5, 5.5, 6.0, 4.0, 6.0, 7.0, 8.0]),
  P('Maxime Vachier-Lagrave', '1990–',   'Dynamic',          'sharp Sicilian and Grünfeld fighting chess',              [7.5, 7.5, 3.5, 6.5, 4.0, 6.0, 8.0]),
  P('Anish Giri',           '1994–',     'Defensive',        'ultra-sound, risk-averse and theoretically deep',         [3.0, 3.5, 7.0, 2.5, 8.0, 6.5, 4.0]),
  P('Wesley So',            '1993–',     'Positional',       'clean, low-risk positional chess',                        [3.5, 3.5, 7.0, 2.5, 8.0, 7.0, 5.5]),
  P('Ian Nepomniachtchi',   '1990–',     'Dynamic',          'creative, aggressive and sharp',                          [7.5, 8.0, 3.5, 7.0, 3.5, 5.0, 8.0]),
  P('Ding Liren',           '1992–',     'Positional',       'patient, solid and precise',                              [4.0, 4.0, 7.0, 3.0, 8.0, 8.0, 4.5]),
  P('Richárd Rapport',      '1996–',     'Dynamic',          'wildly unorthodox, unbalancing play',                     [8.0, 9.0, 2.5, 9.0, 3.0, 5.0, 3.0]),
  P('Alireza Firouzja',     '2003–',     'Attacking',        'aggressive, sharp and fearless',                          [8.0, 8.0, 3.5, 7.5, 3.5, 5.5, 8.0]),
  P('Gukesh Dommaraju',     '2006–',     'Universal',        'mature, flexible and tactically alert',                   [6.5, 6.5, 5.0, 5.0, 5.5, 7.0, 6.0]),

  // ── Nineteenth and early twentieth century
  P('Howard Staunton',      '1810–1874', 'British',          'English Opening pioneer; positional flank play',           [4.5, 5.0, 4.5, 3.5, 6.0, 5.0, 2.5]),
  P('Johannes Zukertort',   '1842–1888', 'Attacking',        'brilliant combinational attacks',                          [8.5, 8.0, 2.5, 7.5, 3.5, 4.5, 9.0]),
  P('Joseph Blackburne',    '1841–1924', 'Attacking',        'swashbuckling tactics; the \"Black Death\"',                [8.5, 8.5, 2.5, 8.0, 3.5, 4.0, 9.0]),
  P('Henry Bird',           '1830–1908', 'British',          'the Bird Opening; eccentric, tactical flank play',         [6.5, 7.0, 3.5, 7.0, 3.5, 5.0, 2.0]),
  P('Dawid Janowski',       '1868–1927', 'Attacking',        'bishop pair and open-position attacks',                    [7.5, 7.0, 3.0, 6.5, 4.0, 5.5, 8.5]),
  P('Jacques Mieses',       '1865–1954', 'Attacking',        'long-lived tactician and open-game attacker',              [7.5, 7.5, 3.0, 7.0, 3.5, 4.5, 8.5]),
  P('Harry Pillsbury',      '1872–1906', 'American',         'Queen\'s Gambit attacks and blindfold brilliance',         [6.5, 6.5, 3.5, 5.5, 5.0, 5.0, 3.0]),
  P('Carl Schlechter',      '1874–1918', 'Positional',       'solid, accurate, drawish positional play',                 [3.0, 3.5, 6.0, 2.0, 8.0, 7.0, 5.5]),
  P('Géza Maróczy',         '1870–1951', 'Hungarian',        'the Maróczy Bind and clear central control',               [4.5, 4.5, 5.0, 3.5, 6.5, 6.5, 5.5]),
  P('Savielly Tartakower',  '1887–1956', 'Dynamic',          'witty, creative hypermodern improviser',                   [6.0, 6.5, 3.5, 6.0, 4.5, 5.5, 4.0]),
  P('Efim Bogoljubov',      '1889–1952', 'Attacking',        'enterprising, ambitious attacking play',                   [7.5, 7.0, 3.0, 6.5, 4.0, 5.0, 6.5]),
  P('Milan Vidmar',         '1885–1962', 'Positional',       'deep, scientific positional play',                         [4.5, 4.5, 5.5, 3.5, 6.5, 6.5, 6.0]),
  P('Ernst Grünfeld',       '1893–1962', 'Positional',       'opening theory and the defence that bears his name',       [4.5, 5.5, 4.5, 4.5, 6.5, 5.5, 2.5]),
  P('Salo Flohr',           '1908–1983', 'Positional',       'precise, low-risk technique and endgame skill',            [2.5, 3.0, 7.0, 2.0, 8.5, 8.0, 5.0]),
  P('Samuel Reshevsky',     '1911–1992', 'American',         'sound, practical play and time-trouble skill',             [5.0, 5.0, 5.5, 3.5, 6.0, 7.5, 6.5]),
  P('Vera Menchik',         '1906–1944', 'Positional',       'first women\'s world champion; solid classical play',      [4.0, 4.5, 5.5, 3.0, 7.0, 6.5, 6.0]),
  // ── The mid-century Soviet school and its contemporaries
  P('Alexander Kotov',      '1913–1981', 'Soviet',           'deep calculation and a scientific method',                 [5.5, 6.0, 4.5, 4.0, 6.5, 6.0, 6.0]),
  P('Isaac Boleslavsky',    '1919–1977', 'Soviet',           'dynamic King\'s Indian pioneer',                           [6.5, 6.5, 3.5, 5.5, 5.0, 5.5, 4.0]),
  P('Miguel Najdorf',       '1910–1997', 'Attacking',        'sharp Sicilian play and imaginative attacks',              [8.0, 8.0, 3.0, 7.0, 3.5, 5.5, 8.5]),
  P('Rashid Nezhmetdinov',  '1912–1974', 'Attacking',        'the supreme sacrificial attacker',                         [9.5, 9.5, 1.5, 9.5, 2.0, 4.0, 8.5]),
  P('Pal Benko',            '1928–2019', 'Hungarian',        'gambits and a composer\'s eye for the endgame',            [6.0, 6.5, 4.5, 6.0, 4.5, 8.5, 5.0]),
  P('Svetozar Gligorić',    '1923–2012', 'Positional',       'King\'s Indian strategy and subtle manoeuvring',           [5.0, 5.0, 5.0, 3.5, 6.5, 6.5, 4.0]),
  P('Mark Taimanov',        '1926–2016', 'Soviet',           'creative Sicilian and Nimzo play',                         [5.5, 5.5, 4.5, 4.5, 5.5, 6.5, 7.0]),
  P('Lev Polugaevsky',      '1934–1995', 'Dynamic',          'deeply analysed, sharp opening systems',                   [6.5, 7.5, 4.0, 6.0, 5.0, 6.0, 6.5]),
  P('Leonid Stein',         '1934–1973', 'Attacking',        'bold, tactical, attacking style',                          [8.0, 8.0, 3.0, 7.5, 3.5, 5.0, 8.0]),
  P('Wolfgang Uhlmann',     '1935–2020', 'Classical German', 'the French Defence and enduring counter-attacks',          [4.5, 5.0, 4.5, 4.0, 6.5, 6.5, 5.5]),
  P('Rafael Vaganian',      '1951–',     'Dynamic',          'tactical, sacrificial, hypermodern play',                  [7.5, 7.5, 3.0, 7.0, 4.0, 5.0, 5.5]),
  P('Walter Browne',        '1949–2015', 'American',         'fighting, sharp play and blitz mastery',                   [7.0, 7.5, 3.5, 6.5, 4.0, 5.5, 8.0]),
  P('Lev Alburt',           '1945–',     'American',         'sharp, fighting chess and the Alekhine Defence',           [7.0, 7.5, 3.5, 6.5, 4.0, 5.5, 8.0]),
  // ── 1970s to the 1990s
  P('Robert Hübner',        '1948–',     'Classical German', 'meticulous analysis and strategic depth',                  [4.5, 5.0, 5.5, 3.0, 7.0, 7.5, 6.5]),
  P('Ljubomir Ljubojević',  '1950–',     'Attacking',        'brilliant, uneven attacking talent',                       [7.5, 7.5, 3.5, 7.0, 3.5, 5.0, 6.5]),
  P('Tony Miles',           '1955–2001', 'British',          'uncompromising fighting chess',                            [6.5, 6.5, 3.5, 6.0, 4.5, 6.0, 5.0]),
  P('John Nunn',            '1955–',     'British',          'sharp tactical precision and Sicilian expertise',          [7.0, 7.5, 3.5, 5.5, 4.5, 6.0, 8.5]),
  P('Jonathan Speelman',    '1956–',     'British',          'deep endgame understanding and original ideas',            [4.5, 5.0, 6.0, 4.5, 5.5, 9.0, 4.5]),
  P('Zoltán Ribli',         '1951–',     'Hungarian',        'positional, resilient and well prepared',                  [3.5, 4.0, 6.0, 2.5, 7.5, 7.5, 4.5]),
  P('Gyula Sax',            '1951–',     'Hungarian',        'sharp, tactical Hungarian fighter',                        [6.5, 7.0, 3.5, 6.0, 4.5, 5.5, 6.5]),
  P('Artur Yusupov',        '1960–',     'Soviet',           'clear strategy and renowned trainer',                      [4.0, 4.5, 5.5, 3.0, 7.0, 7.0, 5.5]),
  P('Alexander Beliavsky',  '1953–',     'Soviet',           'classical, tactical and extremely well prepared',          [5.5, 6.0, 4.5, 4.5, 5.5, 6.5, 6.0]),
  P('Yasser Seirawan',      '1960–',     'American',         'clear positional plans and lucid explanation',             [4.5, 4.5, 6.0, 3.0, 7.0, 7.0, 5.0]),
  P('Larry Christiansen',   '1956–',     'American',         'sacrificial attacks; \"Lightning Larry\"',                  [8.5, 8.5, 2.5, 8.0, 3.0, 4.5, 7.5]),
  P('Alexander Khalifman',  '1966–',     'Universal',        'versatile and tournament-tough',                           [4.5, 4.5, 5.5, 3.5, 6.5, 6.5, 5.5]),
  P('Evgeny Bareev',        '1966–',     'Soviet',           'solid, enterprising Slav and Sicilian play',               [5.0, 5.5, 4.5, 4.0, 6.0, 6.0, 6.5]),
  P('Alexey Dreev',         '1969–',     'Soviet',           'rock-solid Slav and stubborn defence',                     [3.5, 4.0, 6.0, 2.5, 8.0, 7.0, 4.0]),
  P('Ivan Sokolov',         '1968–',     'Dynamic',          'combative strategic play',                                 [6.0, 6.5, 4.0, 5.5, 5.0, 6.5, 6.5]),
  P('Loek van Wely',        '1972–',     'Dynamic',          'aggressive, tactical and practical',                       [7.0, 7.0, 3.5, 6.5, 4.0, 5.5, 7.5]),
  P('Gata Kamsky',          '1974–',     'American',         'tenacious, fighting and theory-driven',                    [5.5, 6.0, 5.0, 4.5, 5.5, 7.0, 6.0]),
  P('Xie Jun',              '1970–',     'Positional',       'cool, precise positional play',                            [4.5, 4.5, 6.0, 3.0, 7.0, 7.0, 5.5]),
  P('Susan Polgar',         '1969–',     'Attacking',        'aggressive, tactical and sharp',                           [8.0, 8.0, 3.0, 7.0, 3.5, 5.0, 8.0]),
  P('Sofia Polgar',         '1974–',     'Attacking',        'brilliant attacking play; the \"Rome miracle\"',            [8.5, 8.5, 2.5, 7.5, 3.5, 4.5, 8.5]),
  P('Maia Chiburdanidze',   '1961–',     'Soviet',           'strong technique and relentless pressure',                 [5.5, 6.0, 4.5, 4.5, 6.0, 7.0, 6.5]),
  P('Nona Gaprindashvili',  '1941–',     'Soviet',           'attacking, tactical Soviet-school play',                   [7.0, 7.0, 3.5, 6.0, 4.5, 5.5, 7.5]),
  // ── The modern era
  P('Ruslan Ponomariov',    '1983–',     'Universal',        'accurate, calm and universal',                             [4.5, 4.5, 5.5, 3.0, 7.0, 6.5, 6.5]),
  P('Rustam Kasimdzhanov',  '1979–',     'Universal',        'clean, solid and deeply prepared',                         [4.0, 4.5, 5.5, 3.0, 7.0, 6.5, 6.0]),
  P('Alexander Grischuk',   '1983–',     'Dynamic',          'creative, practical and a blitz star',                     [6.5, 7.0, 4.0, 5.5, 4.5, 6.0, 7.0]),
  P('Pentala Harikrishna',  '1986–',     'Universal',        'solid, patient and technically sound',                     [4.0, 4.5, 6.0, 3.0, 7.0, 7.0, 6.0]),
  P('Leinier Domínguez',    '1983–',     'Universal',        'accurate, flexible and tactically alert',                  [5.0, 5.5, 5.0, 4.0, 6.0, 6.5, 6.5]),
  P('Shakhriyar Mamedyarov','1985–',     'Attacking',        'energetic, risk-taking and intuitive',                     [8.0, 8.0, 3.0, 7.5, 3.5, 5.5, 7.0]),
  P('Vugar Gashimov',       '1986–2014', 'Dynamic',          'original opening ideas and deep tactics',                  [6.5, 7.5, 3.5, 6.5, 4.5, 5.5, 6.0]),
  P('Francisco Vallejo Pons','1982–',    'Universal',        'creative, solid and universal',                            [4.5, 5.0, 5.5, 3.5, 6.5, 6.5, 6.5]),
  P('Ivan Cheparinov',      '1986–',     'Dynamic',          'dynamic opening ideas and playful tactics',                [6.5, 7.0, 4.0, 6.0, 4.5, 5.5, 6.0]),
  P('Radosław Wojtaszek',   '1987–',     'Universal',        'precise, theoretical and positional',                      [4.5, 5.0, 5.5, 3.5, 6.5, 6.5, 6.0]),
  P('Pavel Eljanov',        '1983–',     'Positional',       'sound and technically excellent',                          [4.0, 4.5, 6.0, 3.0, 7.5, 7.0, 6.0]),
  P('Baadur Jobava',        '1983–',     'Attacking',        'wildly creative London System attacker',                   [8.0, 8.5, 3.0, 8.0, 3.0, 4.5, 2.5]),
  P('David Navara',         '1985–',     'Positional',       'sound strategy with a touch of attack',                    [4.5, 5.0, 5.5, 3.5, 6.5, 6.5, 6.0]),
  P('Ni Hua',               '1983–',     'Positional',       'clean, technical and strategic',                           [4.0, 4.5, 6.5, 3.0, 7.5, 7.0, 5.5]),
  P('Bu Xiangzhi',          '1985–',     'Dynamic',          'creative, risk-ready opening and middlegame play',         [6.5, 7.0, 4.0, 6.5, 4.5, 5.5, 6.5]),
  P('Wang Hao',             '1989–',     'Positional',       'solid, careful positional play',                           [4.0, 4.0, 6.5, 3.0, 7.5, 7.0, 5.0]),
  P('Sam Shankland',        '1991–',     'American',         'dependable, strategic and strong in endgames',             [4.0, 4.5, 6.5, 3.0, 7.0, 7.5, 6.0]),
  P('Yu Yangyi',            '1994–',     'Positional',       'calm, precise and technical',                              [4.0, 4.5, 6.5, 3.0, 7.5, 7.5, 5.5]),
  P('Vidit Gujrathi',       '1994–',     'Universal',        'calm, rounded and strategically sound',                    [5.0, 5.0, 5.5, 3.5, 6.5, 6.5, 6.0]),
  P('Daniil Dubov',         '1996–',     'Dynamic',          'inventive, aggressive and unconventional',                 [7.5, 8.0, 3.0, 7.5, 3.5, 5.0, 6.5]),
  P('Jan-Krzysztof Duda',   '1998–',     'Universal',        'flexible, well prepared and tactically alert',             [5.5, 5.5, 5.0, 4.5, 5.5, 6.5, 6.5]),
  P('Wei Yi',               '1999–',     'Attacking',        'brilliant tactical vision and attacking flair',            [8.5, 8.5, 2.5, 8.0, 3.0, 4.5, 8.0]),
  P('Parham Maghsoodloo',   '2000–',     'Dynamic',          'resourceful and unorthodox in the opening',                [6.5, 7.0, 4.0, 6.0, 4.5, 6.0, 5.5]),
  P('Arjun Erigaisi',       '2003–',     'Attacking',        'fearless, concrete and sharply tactical',                  [7.5, 7.5, 3.5, 7.0, 3.5, 5.5, 7.5]),
  P('Nodirbek Abdusattorov','2004–',     'Universal',        'fearless, flexible and a rapid specialist',                [6.0, 6.5, 4.5, 5.5, 4.5, 6.5, 6.5]),
  P('Vincent Keymer',       '2004–',     'Positional',       'deep positional understanding beyond his years',           [4.5, 4.5, 6.0, 3.5, 6.5, 7.0, 5.0]),
  P('Nihal Sarin',          '2004–',     'Dynamic',          'fast, intuitive and tactical',                             [6.5, 7.0, 4.0, 6.0, 4.5, 5.5, 7.0]),
  P('Rameshbabu Praggnanandhaa', '2005–', 'Universal',       'calm, mature and technically skilled',                     [5.5, 5.5, 5.0, 4.5, 5.5, 6.5, 6.5]),
  // ── Women's chess
  P('Hou Yifan',            '1994–',     'Universal',        'strategic clarity with tactical sharpness',                [5.5, 5.5, 5.0, 4.5, 5.5, 7.0, 6.5]),
  P('Humpy Koneru',         '1987–',     'Universal',        'balanced, resilient and well prepared',                    [5.0, 5.0, 5.5, 4.0, 6.0, 6.5, 6.5]),
  P('Alexandra Kosteniuk',  '1984–',     'Attacking',        'enterprising open-game attacks',                           [7.5, 7.5, 3.5, 6.5, 4.0, 5.0, 7.5]),
  P('Ju Wenjun',            '1991–',     'Positional',       'steady, accurate strategic control',                       [4.0, 4.5, 6.0, 3.0, 7.0, 7.5, 5.5]),
  P('Anna Muzychuk',        '1990–',     'Dynamic',          'sharp, tactical and fast',                                 [6.5, 7.0, 4.0, 6.0, 4.5, 5.5, 7.0]),
  P('Mariya Muzychuk',      '1992–',     'Universal',        'versatile, solid and well prepared',                       [5.0, 5.0, 5.5, 4.0, 6.0, 6.5, 6.5]),
  P('Tan Zhongyi',          '1991–',     'Attacking',        'enterprising, attacking play',                             [7.0, 7.0, 3.5, 6.5, 4.0, 5.5, 7.0]),
  P('Irina Krush',          '1983–',     'American',         'tenacious and well prepared; many-time US women\'s champion', [5.0, 5.5, 5.0, 4.0, 6.0, 6.5, 6.5]),
  P('Lei Tingjie',          '1997–',     'Dynamic',          'tactical, fighting and ambitious',                         [6.5, 7.0, 3.5, 6.0, 4.5, 5.5, 6.5]),
  P('Aleksandra Goryachkina','1998–',    'Positional',       'patient strategic play and technical accuracy',            [4.5, 4.5, 6.0, 3.5, 6.5, 7.0, 6.0]),
]

export const playerVector = (p: PlayerRef): StyleVector =>
  Object.fromEntries(AXES.map((a, i) => [a, p.axes[i]])) as StyleVector
