import { useState } from 'react'
import Container from '../components/Container'

export default function About() {
  const [copied, setCopied] = useState(false)
  const supportEmail = 'support@babytoys.example'

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      setCopied(false)
    }
  }

  return (
    <Container className="mt-10 max-w-2xl">
      <h1 className="text-2xl font-semibold">About Us</h1>
      <p className="mt-4 text-slate-700">We curate safe, delightful toys for babies and toddlers.</p>

      <div className="mt-6 rounded-md border p-4">
        <p className="text-slate-700">Need help? Reach our support team:</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-medium">{supportEmail}</span>
          <button onClick={copyEmail} className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">{copied ? 'Copied!' : 'Copy'}</button>
          <a href="/contact" className="text-brand-600 hover:underline text-sm">Contact us</a>
        </div>
      </div>
    </Container>
  )
}