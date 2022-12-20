import React from 'react'
import styled from 'styled-components'
import Cell from './Cell'

const BackgroundDiv = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin: 0;
  background-color: #140518;
`

const BoardDiv = styled.div`
  position: absolute;
  transform: translate(var(--translate-x, 0), var(--translate-y, 0));
`

// onTouch*, onMouse*를 처리하려했지만, onPointer* 시리즈를 이용하는게 좀 더 범용적이다.
// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events

// onPointerOut은 각 영역을 벗어날때 발생하므로, Cell과 Background 경계를 이동할 경우 멈추게 되어 제거한다.
// onPointerLeave는 Background, Cell 모두를 벗어날때만 호출되므로, 이와 onClick을 사용한다.
// onPointerUp을 사용하게 되면 moving class를 Cell의 onClick보다 먼저 제거하므로, onClick을 사용한다.

function getTranslate (element: HTMLDivElement | null): { translateX: number, translateY: number } {
  let translateX = element?.style.getPropertyValue('--translate-x')
  let translateY = element?.style.getPropertyValue('--translate-y')

  if (translateX === '') translateX = '0px'
  if (translateY === '') translateY = '0px'

  return {
    translateX: parseFloat(translateX),
    translateY: parseFloat(translateY)
  }
}

const clickBeginHandler = (element: HTMLDivElement | null, event: React.PointerEvent): void => {
  if (element == null) return
  element.classList.remove('moving')
  if (element.classList.contains('clicking')) return
  element.classList.add('clicking')

  const { clientX, clientY } = event
  const { translateX, translateY } = getTranslate(element)
  element.dataset.baseX = `${clientX - translateX}`
  element.dataset.baseY = `${clientY - translateY}`
}

const clickMoveHandler = (element: HTMLDivElement | null, event: React.PointerEvent): void => {
  if (element == null) return
  if (!element.classList.contains('clicking')) return

  const { clientX, clientY } = event
  const afterX = clientX - parseFloat(element.dataset.baseX ?? '0')
  const afterY = clientY - parseFloat(element.dataset.baseY ?? '0')

  if (!element.classList.contains('moving')) {
    const beforeX = parseFloat(element.style.getPropertyValue('--translate-x') ?? '0px')
    const beforeY = parseFloat(element.style.getPropertyValue('--translate-y') ?? '0px')

    // only moves when |delta position| > 2px
    if ((afterX - beforeX) ** 2 + (afterY - beforeY) ** 2 < 2) return
    element.classList.add('moving')
  }

  element.style.setProperty('--translate-x', `${afterX}px`)
  element.style.setProperty('--translate-y', `${afterY}px`)
}

const clickEndHandler = (element: HTMLDivElement | null, event: React.UIEvent): void => {
  if (element == null) return
  element.classList.remove('clicking')
  if (element.classList.contains('moving')) {
    element.classList.remove('moving')
    event.stopPropagation()
  }
}

const wheelHandler = (element: HTMLDivElement | null, event: React.WheelEvent): void => {
  if (element == null) return
  if (element.classList.contains('moving')) return

  const { translateX, translateY } = getTranslate(element)

  element.style.setProperty('--translate-x', `${translateX - event.deltaX}px`)
  element.style.setProperty('--translate-y', `${translateY - event.deltaY}px`)

  // TODO: prevent gesture(history back, ...)
}

interface BoardProps {
  n: number
  m: number
}

const Board: React.FC<BoardProps> = ({ n, m }: { n: number, m: number }) => {
  const boardDiv = React.createRef<HTMLDivElement>()

  return (
    <BackgroundDiv
      onPointerDown={ event => clickBeginHandler(boardDiv.current, event) }
      onPointerMove={ event => clickMoveHandler(boardDiv.current, event) }
      onPointerLeave={ event => clickEndHandler(boardDiv.current, event) }
      onClick={ event => clickEndHandler(boardDiv.current, event) }
      onPointerCancel={ event => clickEndHandler(boardDiv.current, event) }
      onWheel={ event => wheelHandler(boardDiv.current, event) }
    >
      <BoardDiv ref={boardDiv} style={{ width: `${100 * m}px` }}>
        {Array(n).fill(null).map((_, i) =>
          Array(m).fill(null).map((_, j) =>
            <Cell
              key={`${i}-${j}`}
              isMoving={() => boardDiv.current?.classList.contains('moving') ?? false}
              isMine={Math.random() < 0.5}
              minesAround={Math.floor(Math.random() * 8)}
            />)
        )}
      </BoardDiv>
    </BackgroundDiv>
  )
}

export default Board
