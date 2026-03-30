/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t: any) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: Array<(state: any) => void> = []
let memoryState = { toasts: [] }

function dispatch(action: any) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function toast(props: Omit<ToasterToast, "id">) {
  const id = Math.random().toString()
  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id },
  })

  return {
    id,
    dismiss: () => dispatch({ type: "REMOVE_TOAST", toastId: id }),
  }
}

export function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "REMOVE_TOAST", toastId }),
  }
}