import React from 'react';
import Board from './game/Board';

function Minesweeper() {
  return (
    <Board n={20} m={20}></Board>
  );
}

export default Minesweeper;
