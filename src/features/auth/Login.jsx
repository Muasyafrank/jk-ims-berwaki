import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import { Field, Input } from '../../components/ui/Field.jsx'
import { checkCredentials } from '../../config/auth.js'
import { COMPANY_DEALS_IN, DEFAULT_COMPANY, PRODUCT } from '../../config/company.js'
import BedLamp from './BedLamp.jsx'

export default function Login({ onSignIn }) {
  const [lampOn, setLampOn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const usernameRef = useRef(null)

  useEffect(() => {
    if (lampOn) usernameRef.current?.focus()
  }, [lampOn])

  const submit = (event) => {
    event.preventDefault()
    if (checkCredentials(username, password)) onSignIn()
    else setError('Invalid username or password.')
  }

  return (
    <main className="login">
      <div className="login__brand">
        <div className="login__company">{DEFAULT_COMPANY.bizName.toUpperCase()}</div>
        <h1 className="login__product">{PRODUCT.name}</h1>
        <div className="login__tagline">{PRODUCT.fullName}</div>
      </div>

      <div className="login__card">
        <BedLamp lampOn={lampOn} onToggle={() => setLampOn((on) => !on)} />
        <form onSubmit={submit}>
          <fieldset className="login__form" disabled={!lampOn}>
            <Field label="Username">
              <Input
                ref={usernameRef}
                autoComplete="username"
                placeholder="ADMIN"
                value={username}
                onChange={(event) => { setUsername(event.target.value); setError('') }}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError('') }}
              />
            </Field>
            {error && <div className="login__error" role="alert">{error}</div>}
            <Button type="submit" variant="gold" block className="login__submit">Sign In →</Button>
            <div className="login__hint">Lamp must be ON to log in</div>
          </fieldset>
        </form>
      </div>
      <span className="sr-only">{COMPANY_DEALS_IN}</span>
    </main>
  )
}
