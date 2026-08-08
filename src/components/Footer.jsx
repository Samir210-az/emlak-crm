import InstallButton from './InstallButton.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-center">
      <a
        href="https://instagram.com/securtiy_group"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-amber-400 transition-colors hover:text-amber-300"
      >
        By securtiy_group
      </a>
      <div className="mt-3">
        <InstallButton />
      </div>
    </footer>
  )
}
