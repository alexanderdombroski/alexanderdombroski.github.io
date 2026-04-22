import { randomChoice } from '../../utils/random';

type Token = 'X' | 'O';
type Space = Token | null;
type Row = [Space, Space, Space];
type Board = [Row, Row, Row];
export type CoordinatePart = 0 | 1 | 2;
type Coordinate = [CoordinatePart, CoordinatePart];

type GameData = {
  turn: Token;
  winner: Space;
  board: Board;
  winningCells: Coordinate[];
  [key: string]: any;
};

const initialBoard: Board = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const initialValue = {
  turn: randomChoice(['X', 'O']),
  winner: null,
  winningCells: [],
  board: structuredClone(initialBoard),
  checkWin() {
    if (this.checkForPlayer('X')) {
      this.winner = 'X';
    }
    if (this.checkForPlayer('O')) {
      this.winner = 'O';
    }
  },
  nextTurn() {
    this.checkWin();
    if (this.winner) return;
    this.turn = this.turn === 'X' ? 'O' : 'X';
  },
  checkForPlayer(token: Token) {
    const isFilled = (space: Space) => space === token;

    // Rows
    for (let r: CoordinatePart = 0; r < 3; r++) {
      if (this.board[r].every(isFilled)) {
        this.winningCells = [
          [r, 0],
          [r, 1],
          [r, 2],
        ] as Coordinate[];
      }
    }

    for (let c: CoordinatePart = 0; c < 3; c++) {
      if (this.board.map((row) => row[c]).every(isFilled)) {
        this.winningCells = [
          [0, c],
          [1, c],
          [2, c],
        ] as Coordinate[];
      }
    }

    if (
      [this.board[0][0], this.board[1][1], this.board[2][2]].every(isFilled)
    ) {
      this.winningCells = [
        [0, 0],
        [1, 1],
        [2, 2],
      ];
    }

    if (
      [this.board[0][2], this.board[1][1], this.board[2][0]].every(isFilled)
    ) {
      this.winningCells = [
        [0, 2],
        [1, 1],
        [2, 0],
      ];
    }

    return !!this.winningCells.length;
  },
  reset() {
    this.turn = randomChoice(['X', 'O']);
    this.winner = null;
    this.winningCells.length = 0;
    this.board = structuredClone(initialBoard);
  },
} satisfies GameData;

export const gameData: GameData = $state(initialValue);
