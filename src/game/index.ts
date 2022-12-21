import isInteger from '../util/isInteger'
import CellData from './CellData'

enum GameState {
  PLAYING,
  WIN,
  LOSE
}

export type CellMutationListener = (cell: CellData) => void
export type GameStateMutationListener = (state: GameState) => void

class Game {
  private readonly n: number
  private readonly m: number

  private state: GameState

  private landLeft: number
  private landMineLeft: number
  private landMineTotal: number

  private readonly board: CellData[][]
  private readonly cellListener: Array<Array<CellMutationListener | null>>

  private readonly stateMutationListeners: GameStateMutationListener[]

  public constructor (n: number, m: number, landMineTotal: number) {
    if (!isInteger(n) || !isInteger(m)) {
      throw RangeError('mine board size must be integer')
    }

    if (!isInteger(landMineTotal)) {
      throw RangeError('landMineTotal must be integer')
    }
    this.n = n
    this.m = m

    this.state = GameState.PLAYING

    // board not generated
    this.landLeft = -1
    this.landMineLeft = -1
    this.landMineTotal = landMineTotal

    this.board = Array(n).fill(null).map(_ =>
      Array(m).fill(null).map(_ => {
        const cell: CellData = {
          isFlag: false,
          isLandMine: false,
          isMined: false,
          minesAround: 0
        }
        return cell
      })
    )

    this.cellListener = Array(n).fill(null).map(_ => Array(m).fill(null))
    this.stateMutationListeners = []
  }

  public async requestMine (i: number, j: number, sleep?: () => Promise<void>): Promise<void> {
    if (!isInteger(i) || !isInteger(j)) {
      throw RangeError('mine index must be integer')
    }
    if (i < 0 || i >= this.n || j < 0 || j >= this.m) {
      throw RangeError('mine range out of index')
    }

    if (this.landMineLeft === -1) {
      this.generateBoard(i, j)
    }

    if (this.board[i][j].isMined || this.board[i][j].isFlag) {
      return
    }

    await this.setMined(i, j)

    if (this.board[i][j].isLandMine) {
      this.updateState(GameState.LOSE)
    }

    // 'spreading mined' effect if minesAround is zero
    // (also known as bfs)
    if (this.board[i][j].minesAround === 0) {
      type node = [number, number, node] | null
      let queueBegin: node = null
      let queueEnd: node = null
      let last: Array<[number, number]> = []

      function push (i: number, j: number): void {
        const newQueueEnd: node = [i, j, null]

        if (queueEnd === null) {
          queueBegin = queueEnd = newQueueEnd
        } else {
          queueEnd[2] = newQueueEnd
          queueEnd = newQueueEnd
        }
      }

      push(i, j)
      push(-1, -1)

      while (queueBegin !== null) {
        // https://github.com/microsoft/TypeScript/issues/51434
        const [x, y, next]: [number, number, node] = queueBegin
        queueBegin = next

        if (x === -1) {
          last = last.filter(([x, y]) => !this.board[x][y].isMined)

          if (last.length === 0 && queueBegin === null) {
            break
          }

          push(-1, -1)
          await sleep?.()

          if (last.length !== 0) {
            last.forEach(([x, y]) => {
              this.setMined(x, y)
              if (this.board[x][y].minesAround === 0) {
                push(x, y)
              }
            })
            last = []
          }
          await sleep?.()

          continue
        }

        for (const [dx, dy] of [[-1, 0], [0, -1], [0, 1], [1, 0], [1, -1], [-1, 1], [-1, -1], [1, 1]]) {
          const [mx, my] = [x + dx, y + dy]
          if (mx >= 0 && mx < this.n && my >= 0 && my < this.m && !this.board[mx][my].isMined && !this.board[mx][my].isFlag) {
            if (Math.abs(dx) + Math.abs(dy) === 2) {
              last.push([mx, my])
            } else {
              this.setMined(mx, my)
              if (this.board[mx][my].minesAround === 0) {
                push(mx, my)
              }
            }
          }
        }
      }
    }

    if (this.landLeft === 0) {
      this.updateState(GameState.WIN)
    }
  }

  public requestFlag (i: number, j: number): void {
    if (!this.board[i][j].isMined) {
      this.board[i][j].isFlag = !this.board[i][j].isFlag
      this.callCellListener(i, j)
    }
  }

  public addGameStateMutationListener (listener: GameStateMutationListener): void {
    this.stateMutationListeners.push(listener)
  }

  public removeGameStateMutationListener (listener: GameStateMutationListener): void {
    const index = this.stateMutationListeners.lastIndexOf(listener)
    if (index !== -1) {
      this.stateMutationListeners.splice(index)
    }
  }

  public setCellMutationListener (i: number, j: number, listener: CellMutationListener): void {
    this.cellListener[i][j] = listener
  }

  private callCellListener (i: number, j: number): void {
    const cellData = { ...this.board[i][j] }
    if (!cellData.isMined) {
      cellData.minesAround = -1
      cellData.isLandMine = false
    }

    this.cellListener[i][j]?.(cellData)
  }

  private updateState (newState: GameState): void {
    this.state = newState
    this.stateMutationListeners.forEach(listener => listener(this.state))
  }

  private setMined (i: number, j: number): void {
    if (!this.board[i][j].isMined) {
      this.board[i][j].isMined = true
      this.callCellListener(i, j)
    }
  }

  private generateBoard (i: number, j: number): void {
    const sampleBoard = [
      [1, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, -1, 1, 0, 0, 0, 0, 1, 1],
      [2, 2, 2, 0, 0, 0, 1, 2, -1],
      [1, -1, 1, 0, 0, 0, 1, -1, 2],
      [1, 1, 1, 0, 0, 0, 1, 1, 1],
      [-1, 1, 1, -1, 1, 0, 0, 1, 1],
      [1, 2, 2, 2, 1, 1, 1, 3, -1],
      [0, 1, -1, 1, 0, 1, -1, 3, -1]
    ]

    this.landMineTotal = 0
    for (let i = 0; i !== this.n; ++i) {
      for (let j = 0; j !== this.m; ++j) {
        this.board[i][j].isLandMine = sampleBoard[i][j] === -1
        if (this.board[i][j].isLandMine) {
          ++this.landMineTotal
        } else {
          ++this.landLeft
        }
        for (const [di, dj] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
          const [mi, mj] = [i + di, j + dj]
          if (mi < 0 || mi >= this.n || mj < 0 || mj >= this.m) continue
          if (sampleBoard[mi][mj] === -1) {
            this.board[i][j].minesAround += 1
          }
        }
      }
    }
    this.landMineLeft = this.landMineTotal
  }
}

export { Game, GameState }
