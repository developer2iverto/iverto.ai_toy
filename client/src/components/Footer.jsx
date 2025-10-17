import Container from './Container'

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <Container className="py-8 text-sm text-slate-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Baby Toys Store</p>
          <p className="text-slate-500">Designed for a playful, gentle experience</p>
        </div>
      </Container>
    </footer>
  )
}