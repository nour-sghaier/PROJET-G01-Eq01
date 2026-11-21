import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Navbar from '../components/Navbar'

const commandesAttendues = {
  'CMD-1001': { produit: 'Pizza margherita', quantite: 2 },
  'CMD-1002': { produit: 'Croissant', quantite: 3 },
}

function ScanQR() {
  const [resultat, setResultat] = useState(null)
  const [codeManuel, setCodeManuel] = useState('')

  const verifier = (code) => {
    const commande = commandesAttendues[code.trim()]
    if (commande) {
      setResultat({
        ok: true,
        message: `Commande valide : ${commande.quantite} x ${commande.produit}. Remise au client.`,
      })
    } else {
      setResultat({ ok: false, message: `Code inconnu : ${code}` })
    }
  }

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'lecteur',
      { fps: 10, qrbox: 220 },
      false
    )
    scanner.render(
      (texte) => verifier(texte),
      () => {}
    )
    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Valider une commande
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div id="lecteur" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-3">
          <p className="text-gray-600">Ou saisir le code à la main :</p>
          <input
            type="text"
            placeholder="Ex : CMD-1001"
            value={codeManuel}
            onChange={(e) => setCodeManuel(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <button
            onClick={() => verifier(codeManuel)}
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Vérifier
          </button>
        </div>

        {resultat && (
          <p
            className={`mt-6 p-4 rounded-lg ${
              resultat.ok
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {resultat.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default ScanQR