import Container from './Container'
import Button from './Button'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-100 to-white" aria-hidden="true" />
      <Container className="relative py-12 md:py-20">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">Soft & Safe Toys for Little Explorers</h1>
            <p className="mt-4 text-slate-700">Discover adorable, high-quality baby toys designed to spark joy and curiosity, with gentle materials and playful colors.</p>
            <div className="mt-6">
              <Link to="/shop"><Button>Shop Now</Button></Link>
            </div>
          </div>
          <div className="md:justify-self-end">
            <div className="h-64 md:h-80 w-full card bg-brand-200/40 flex items-center justify-center">
              <div className="rounded-full h-40 w-40 bg-brand-300" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}