import { useEffect, useState } from 'react'
import OfferCard from '../components/OfferCard'
import Navbar from '../components/Navbar'
import { api } from '../api'

// Catégories acceptées par le backend.
const categories = [
  'Plat chaud',
  'Sandwich',
  'Pâtisserie',
  'Boisson',
  'Fruits et légumes',
  'Autre',
]

const champ =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/25'

function Squelette() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm" aria-hidden="true">
      <div className="h-40 bg-gray-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-6 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  )
}

function Offers() {
  const [offres, setOffres] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [categorie, setCategorie] = useState('')

  useEffect(() => {
    api('/offers')
      .then((liste) =>
        setOffres(
          liste.map((o) => ({
            id: o.id,
            commerceId: o.commerceId,
            produit: o.titre,
            commerce: o.commerceNom,
            categorie: o.categorie,
            photo: o.photo,
            prixInitial: o.prixInitial,
            prixReduit: o.prixReduit,
            quantite: o.quantiteDisponible,
          }))
        )
      )
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const offresFiltrees = offres.filter((offer) => {
    const texte = recherche.toLowerCase()
    const correspondTexte =
      offer.produit.toLowerCase().includes(texte) ||
      offer.commerce.toLowerCase().includes(texte)
    const correspondPrix =
      prixMax === '' || offer.prixReduit <= Number(prixMax)
    const correspondCategorie =
      categorie === '' || offer.categorie === categorie
    return correspondTexte && correspondPrix && correspondCategorie
  })

  const filtresActifs = recherche !== '' || prixMax !== '' || categorie !== ''
  const reinitialiser = () => {
    setRecherche('')
    setPrixMax('')
    setCategorie('')
  }

  const puce = (actif) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${
      actif
        ? 'border-green-700 bg-green-700 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-green-500'
    }`

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Offres du moment</h1>
          <p className="mt-1 text-gray-600">
            Réserve avant la fermeture : les quantités sont limitées.
          </p>
        </div>

        {/* Filtres */}
        <section aria-label="Filtres" className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="recherche" className="text-sm font-medium text-gray-700">
                Produit ou commerce
              </label>
              <input
                id="recherche"
                type="search"
                placeholder="Sandwich, Café Campus…"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className={champ}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="prixMax" className="text-sm font-medium text-gray-700">
                Prix maximum (DT)
              </label>
              <input
                id="prixMax"
                type="number"
                min="0"
                placeholder="Ex. 5"
                value={prixMax}
                onChange={(e) => setPrixMax(e.target.value)}
                className={champ}
              />
            </div>
          </div>

          <div role="group" aria-label="Catégorie" className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategorie('')} aria-pressed={categorie === ''} className={puce(categorie === '')}>
              Toutes
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategorie(c)}
                aria-pressed={categorie === c}
                className={puce(categorie === c)}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Résultats */}
        {chargement ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Chargement des offres">
            <Squelette />
            <Squelette />
            <Squelette />
          </div>
        ) : erreur ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {erreur}
          </p>
        ) : offresFiltrees.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-green-200 bg-white px-6 py-14 text-center">
            <p className="text-lg font-semibold text-gray-800">Aucune offre ne correspond.</p>
            <p className="mt-1 text-gray-600">
              {filtresActifs
                ? 'Élargis ta recherche ou retire un filtre.'
                : "Reviens un peu plus tard, les commerçants publient leurs offres chaque jour."}
            </p>
            {filtresActifs && (
              <button
                type="button"
                onClick={reinitialiser}
                className="mt-5 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white transition hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600" aria-live="polite">
              {offresFiltrees.length} offre{offresFiltrees.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offresFiltrees.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Offers