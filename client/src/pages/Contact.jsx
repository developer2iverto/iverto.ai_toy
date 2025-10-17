import { useState } from 'react'
import Container from '../components/Container'
import { sendContactMessage } from '../services/api'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const n = name.trim()
    const em = email.trim()
    const m = message.trim()
    if (!n || !em || !m) {
      setError('Please fill in name, email, and message.')
      return
    }

    setLoading(true)
    try {
      const res = await sendContactMessage({ name: n, email: em, message: m })
      if (res?.ok) {
        setSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch (err) {
      const apiErrors = err?.response?.data?.errors
      if (Array.isArray(apiErrors) && apiErrors.length) {
        setError(apiErrors.map((x) => x.msg).join(', '))
      } else {
        setError(err?.message || 'Failed to send message.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-10 max-w-2xl">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-4 text-slate-700">Email us at support@babytoys.example</p>

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-green-700">Thanks! Your message has been sent.</div>
      )}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            disabled={loading}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-pink-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-pink-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            rows={5}
            required
            disabled={loading}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-pink-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 font-medium text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </Container>
  )
}