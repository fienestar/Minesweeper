import { faBiohazard, faBomb, faBurst, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

const CellDiv = styled.div`
  width: 85px;
  height: 85px;
  margin: 7.5px;
  border-radius: 10px;
  background-color: #5f2d83;
  display: inline-block;
  text-align: center;
  line-height: 85px;
  font-size: 40px;
  font-family: system-ui;
`;

const Cell = ({isMoving, isMine, minesAround}: {isMoving: ()=>Boolean, isMine: Boolean, minesAround: number}) => {
  const [flagged, setFlagged] = React.useState(false);
  const [mined, setMined] = React.useState(false);
  const style = {} as React.CSSProperties;

  let content: String|ReactNode = '\u200B';


  if(mined){
    style.backgroundColor = 'rgba(0,0,0,0)';
    style.color = '#FFFFFF';

    if(minesAround !== 0)
      content = minesAround + '';

    if(isMine)
      content = <FontAwesomeIcon icon={faBurst}/>;
  }else if(flagged){
    style.color = '#FFFFFF';
    content = <FontAwesomeIcon icon={faFlag} />;
  }

  return (
    <CellDiv onClick={()=>!isMoving() && setMined(!mined)} style={style} onDoubleClick={()=>setFlagged(!flagged)}>
      {content}
    </CellDiv>
  );
}

export default Cell;
