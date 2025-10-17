import { useState } from 'react'
import Container from '../components/Container'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register({ name, email, password })
      navigate('/')
    } catch (err) {
      setError('Signup failed')
    }
  }

  return (
    <Container className="mt-10 max-w-md">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Name" className="w-full border rounded px-3 py-2" />
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />
        <Button type="submit" className="w-full">Create Account</Button>
        <p className="text-sm">Already have an account? <Link to="/login" className="text-brand-600">Login</Link></p>
      </form>
    </Container>
  )
}