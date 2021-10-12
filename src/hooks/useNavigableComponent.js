import { useLayoutEffect, useRef, useState } from "react"
import { setCurrentComponent } from "actions/index"
import { useDispatch, useSelector } from "react-redux"
import { selectCurrentComponentKey } from "selectors/index"
import { selectModalType } from "selectors/modals"

const useNavigableComponent = (
  rootSubjectKey,
  rootPropertyKey,
  componentKey
) => {
  const navEl = useRef(null)
  const currentComponentKey = useSelector((state) =>
    selectCurrentComponentKey(state, rootSubjectKey)
  )
  const [lastComponentKey, setLastComponentKey] = useState(null)
  const isModalOpen = useSelector((state) => selectModalType(state))

  useLayoutEffect(() => {
    if (isModalOpen) return // if any modal is open, do not scroll the page in response to clicks

    if (
      componentKey === currentComponentKey &&
      lastComponentKey !== currentComponentKey &&
      navEl.current &&
      !isVisible(navEl.current)
    ) {
      navEl.current.scrollIntoView({ behavior: "smooth" })
      setLastComponentKey(currentComponentKey)
    }
  }, [componentKey, currentComponentKey, lastComponentKey, isModalOpen])

  // From  https://blogreact.com/check-element-is-in-viewport/
  const isVisible = (el) => {
    const rect = el.getBoundingClientRect()
    const vWidth = window.innerWidth || document.documentElement.clientWidth
    const vHeight = window.innerHeight || document.documentElement.clientHeight
    const efp = (x, y) => document.elementFromPoint(x, y)

    // Return false if it's not in the viewport
    if (
      rect.right < 0 ||
      rect.bottom < 0 ||
      rect.left > vWidth ||
      rect.top > vHeight
    ) {
      return false
    }

    // Return true if any of its four corners are visible
    return (
      el.contains(efp(rect.left, rect.top)) ||
      el.contains(efp(rect.right, rect.top)) ||
      el.contains(efp(rect.right, rect.bottom)) ||
      el.contains(efp(rect.left, rect.bottom))
    )
  }

  const dispatch = useDispatch()
  const navClickHandler = (event) => {
    dispatch(setCurrentComponent(rootSubjectKey, rootPropertyKey, componentKey))
    event.stopPropagation()
  }

  return [navEl, navClickHandler]
}

export default useNavigableComponent
