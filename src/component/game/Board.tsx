import React from 'react';
import styled from 'styled-components';
import Cell from './Cell';

const BackgroundDiv = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin: 0;
  background-color: #140518;
`;

const BoardDiv = styled.div`
  position: absolute;
  transform: translate(var(--translate-x, 0), var(--translate-y, 0));
`;


const Board = ({n, m}: {n: number, m: number}) => {
  const boardDiv = React.createRef<HTMLDivElement>();

  return (
    <BackgroundDiv>
      <BoardDiv ref={boardDiv} style={{width: `${100*m}px`}}>
        {Array(n).fill(null).map(_ =>
          Array(m).fill(null).map(_ =>
            <Cell
              isMoving={() => boardDiv.current?.classList.contains('moving') ?? false}
              isMine={Math.random() < 0.5}
              minesAround={Math.floor(Math.random()*8)}
            />)
        )}
      </BoardDiv>
    </BackgroundDiv>
  );
};

export default Board;
