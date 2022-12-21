import React from 'react'
import Board from './game/Board'

const Minesweeper: React.FC = () => {
  return (
    <Board n={8} m={9}></Board>
  )
}

export default Minesweeper
