import {type ErrorInfo, PureComponent, type ReactNode} from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: () => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {hasError: false, error: null}
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error}
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    window.scrollTo(0, 0)

    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback()
    }

    return this.props.children
  }
}
