import { useState } from 'react'

// Classes communes à tous les champs des formulaires d'authentification.
export const classeChamp = (invalide) =>
  `w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
   focus:ring-2 ${
     invalide
       ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
       : 'border-gray-300 focus:border-green-600 focus:ring-green-600/25'
   }`

// Étiquette visible + champ + message d'erreur lié au champ.
export function Champ({ id, label, erreur, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {erreur && (
        <p id={`${id}-erreur`} role="alert" className="text-sm text-red-600">
          {erreur}
        </p>
      )}
    </div>
  )
}

// Champ mot de passe avec bouton afficher / masquer.
export function MotDePasse({ id, value, onChange, autoComplete, invalide, required }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={invalide || undefined}
        aria-describedby={invalide ? `${id}-erreur` : undefined}
        className={`${classeChamp(invalide)} pr-24`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-3 text-sm font-medium text-green-700 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-600"
      >
        {visible ? 'Masquer' : 'Afficher'}
      </button>
    </div>
  )
}

function Logo({ clair = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          clair ? 'bg-green-50 text-green-800' : 'bg-green-700 text-white'
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z" />
          <path d="M5 19c3-4 6-7 10-9" />
        </svg>
      </span>
      <span className={`text-xl font-bold ${clair ? 'text-white' : 'text-green-800'}`}>CampusSave</span>
    </div>
  )
}

// Le « ticket » : un exemple d'offre, pour montrer tout de suite à quoi sert l'app.
function Ticket() {
  return (
    <div className="relative w-full max-w-sm -rotate-2 rounded-2xl bg-white text-gray-900 shadow-2xl shadow-green-950/40">
      <div className="p-6 pb-5">
        <p className="text-sm text-gray-500">Café Campus</p>
        <p className="mt-1 text-2xl font-bold">Sandwich thon</p>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="text-4xl font-bold text-green-700">3 DT</span>
          <span className="text-lg text-gray-400 line-through">6 DT</span>
        </p>
      </div>

      {/* Perforation du ticket */}
      <div className="relative">
        <div className="border-t-2 border-dashed border-gray-200" />
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-green-800" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-green-800" />
      </div>

      <div className="flex items-center justify-between p-6 pt-5 text-sm">
        <span className="text-gray-600">À retirer avant 18 h</span>
        <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800">
          2 restants
        </span>
      </div>
    </div>
  )
}

function PanneauMarque() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-green-800 p-12 text-green-50 lg:flex xl:p-16">
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-green-700/60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-900/40" aria-hidden="true" />

      <div className="relative">
        <Logo clair />
      </div>

      <div className="relative flex flex-col gap-10">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Des repas à prix réduit, près de ton campus.
          </h2>
          <p className="mt-4 text-lg text-green-100">
            Les commerçants proposent leurs invendus du jour. Tu réserves, tu paies, tu retires avec ton QR code.
          </p>
        </div>
        <Ticket />
      </div>

      <p className="relative text-sm text-green-200">Moins de gaspillage, plus de repas pour moins cher.</p>
    </aside>
  )
}

// Page d'authentification : panneau de marque à gauche, formulaire à droite.
// Sur mobile, le panneau disparaît et le logo passe au-dessus du formulaire.
export default function AuthLayout({ titre, sousTitre, children, pied }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <PanneauMarque />

      <main className="flex items-center justify-center bg-green-50 px-6 py-10 sm:px-10 lg:bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{titre}</h1>
          {sousTitre && <p className="mt-2 text-gray-600">{sousTitre}</p>}

          <div className="mt-8">{children}</div>

          {pied && <p className="mt-8 text-center text-sm text-gray-600">{pied}</p>}
        </div>
      </main>
    </div>
  )
}