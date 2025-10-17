import { useState } from 'react'
import Container from '../components/Container'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <Container className="mt-10 max-w-md">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />
        <Button type="submit" className="w-full">Login</Button>
        <p className="text-sm">No account? <Link to="/signup" className="text-brand-600">Sign up</Link></p>
      </form>
    </Container>
  )
}