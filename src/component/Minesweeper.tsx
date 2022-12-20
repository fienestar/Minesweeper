import React from 'react'
import Board from './game/Board'

const Minesweeper: React.FC = () => {
  return (
    <Board n={20} m={20}></Board>
  )
}

export default Minesweeper
