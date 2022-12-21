import { faBurst, faFlag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { MouseEvent, ReactNode } from 'react'
import styled, { keyframes } from 'styled-components'
import { Game } from '../../game'

const MinedKeyframes = keyframes`
  0%{
      color: #FFFFFF00;
      background-color: #5f2d83FF;
  }
  20%{
      color: #FFFFFF33;
      background-color: #5f2d83CC;
  }
  40%{
      color: #FFFFFF66;
      background-color: #5f2d8399;
  }
  60%{
      color: #FFFFFF99;
      background-color: #5f2d8366;
  }
  80%{
      color: #FFFFFFCC;
      background-color: #5f2d8333;
  }
  100%{
      color: #FFFFFFFF;
      background-color: #5f2d8300;
  }
`

const CellDiv = styled.div`
  width: 85px;
  height: 85px;
  margin: 7.5px;
  border-radius: 10px;
  background-color: #5f2d83;
  color: #FFFFFF;
  display: inline-block;
  text-align: center;
  line-height: 85px;
  font-size: 40px;
  font-family: system-ui;
`

const MinedCellDiv = styled(CellDiv)`
  background-color: #5f2d8300;
  animation-name: ${MinedKeyframes};
  animation-duration: 0.2s;
`

interface CellProps {
  i: number
  j: number
  game: Game
  isMoving: () => boolean
}

const sleep = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms))

const Cell: React.FC<CellProps> = ({ i, j, game, isMoving }) => {
  const [flagged, setFlagged] = React.useState(false)
  const [mined, setMined] = React.useState(false)
  const [minesAround, setMinesAround] = React.useState(0)
  const [isMine, setIsMine] = React.useState(false)

  const style: React.CSSProperties = {}

  let content: String | ReactNode = '\u200B'

  if (mined) {
    if (minesAround !== 0) { content = `${minesAround}` }

    if (isMine) {
      content = <FontAwesomeIcon icon={faBurst}/>
    }
  } else if (flagged) {
    content = <FontAwesomeIcon icon={faFlag} />
  }

  const cell = React.useRef<HTMLDivElement>(null)

  game.setCellMutationListener(i, j, ({ isMined, isFlag, isLandMine, minesAround }) => {
    setFlagged(isFlag)
    setMined(isMined)
    setIsMine(isLandMine)
    setMinesAround(minesAround)
  })

  function onClick (event: MouseEvent): void {
    if (mined) return
    if (event.detail === 1 && !flagged) {
      setTimeout(() => {
        if (cell.current?.dataset.flagged !== 'true' && !isMoving()) {
          void game.requestMine(i, j, () => sleep(100))
        }
      }, 200)
    } else if (event.detail === 2) {
      game.requestFlag(i, j)
    }
  }

  const Element = mined ? MinedCellDiv : CellDiv

  return (
    <Element
      className={`cell ${mined ? 'mined' : ''}`}
      ref={cell}
      data-flagged={flagged}
      onClick={onClick}
      style={style}
    >
      {content}
    </Element>
  )
}

export default Cell
