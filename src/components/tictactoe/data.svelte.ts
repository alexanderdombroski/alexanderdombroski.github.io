import { randomChoice } from '../../utils/random';

type Token = 'X' | 'O';
type Space = Token | null;
type Row = [Space, Space, Space];
type Board = [Row, Row, Row];
export type CoordinatePart = 0 | 1 | 2;

type GameData = {
  turn: Token;
  winner: Space;
  board: Board;
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
    const isColumnFilled = (columnNumber: CoordinatePart) =>
      this.board.map((row) => row[columnNumber]).every(isFilled);

    return (
      // Check Rows
      this.board[0].every(isFilled) ||
      this.board[1].every(isFilled) ||
      this.board[2].every(isFilled) ||
      // Check Colums
      isColumnFilled(0) ||
      isColumnFilled(1) ||
      isColumnFilled(2) ||
      // Check Diagonals
      [this.board[0][0], this.board[1][1], this.board[2][2]].every(isFilled) ||
      [this.board[0][2], this.board[1][1], this.board[2][0]].every(isFilled)
    );
  },
  reset() {
    this.turn = randomChoice(['X', 'O']);
    this.winner = null;
    this.board = structuredClone(initialBoard);
  },
} satisfies GameData;

export const gameData = $state(initialValue);
