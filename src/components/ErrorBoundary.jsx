import { Component } from 'react'
import Button from './ui/Button.jsx'

/** Keeps a crash in one screen from blanking the whole app. Remount it (via `key`) to reset. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) { return { error } }

  componentDidCatch(error, info) { console.error('Screen crashed:', error, info.componentStack) }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="page">
        <div className="card" role="alert">
          <h2 className="card__title">Something went wrong on this page</h2>
          <p className="card__note card__note--spaced">Your data is safe. Try again, or pick another page from the menu.</p>
          <Button onClick={() => this.setState({ error: null })}>Try again</Button>
        </div>
      </div>
    )
  }
}
