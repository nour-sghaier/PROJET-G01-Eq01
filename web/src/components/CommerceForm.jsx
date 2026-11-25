import { useState } from 'react'
import { api } from '../api'

function CommerceForm({ onCree }) {
  const [nom, setNom] = useState('')
  const [type, setType] = useState('CAFETERIA')
  const [adresse, setAdresse] = useState('')
  const [telephone, setTelephone] = useState('')
  const [description, setDescription] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      const commerce = await api('/commerces', {
        method: 'POST',
        body: JSON.stringify({ nom, type, adresse, telephone, description }),
      })
      onCree(commerce)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form
      onSubmit={soumettre}
      className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-3"
    >
      <h2 className="text-xl font-bold text-gray-800">Inscrire mon commerce</h2>
      <input type="text" placeholder="Nom du commerce" value={nom}
        onChange={(e) => setNom(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2" />
      <select value={type} onChange={(e) => setType(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2">
        <option value="CAFETERIA">Cafétéria</option>
        <option value="RESTAURANT">Restaurant</option>
      </select>
      <input type="text" placeholder="Adresse" value={adresse}
        onChange={(e) => setAdresse(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2" />
      <input type="text" placeholder="Téléphone (8 chiffres, facultatif)" value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2" />
      <input type="text" placeholder="Description (facultatif)" value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2" />
      {erreur && <p className="bg-red-100 text-red-700 p-3 rounded-lg">{erreur}</p>}
      <button type="submit" disabled={envoi}
        className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
        {envoi ? 'Envoi…' : 'Enregistrer mon commerce'}
      </button>
    </form>
  )
}

export default CommerceForm