import { useState } from 'react'
import OfferCard from '../components/OfferCard'
import Navbar from '../components/Navbar'
import { fakeOffers, categories } from '../data/fakeOffers'

function Offers() {
  const [recherche, setRecherche] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [categorie, setCategorie] = useState('')

  const offresFiltrees = fakeOffers.filter((offer) => {
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

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Offres du moment
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher un produit ou un commerce..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 bg-white"
          />

          <input
            type="number"
            placeholder="Prix maximum (DT)"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            className="w-full md:w-1/4 border border-gray-300 rounded-lg px-4 py-2 bg-white"
          />

          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full md:w-1/4 border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {offresFiltrees.length === 0 ? (
          <p className="text-gray-600">Aucune offre trouvée.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offresFiltrees.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Offers