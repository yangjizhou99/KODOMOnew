export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container py-8 text-sm text-gray-600 grid md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold mb-2">Kodomo 2.0</div>
          <p>© {new Date().getFullYear()} Kodomo. All rights reserved.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <p>Address: 123 Sample Street</p>
          <p>Phone: 080-0000-0000</p>
          <p>Email: hello@kodomo.example</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Social</div>
          <p><a className="link" href="#">Instagram</a> / <a className="link" href="#">Facebook</a></p>
        </div>
      </div>
    </footer>
  )
}
