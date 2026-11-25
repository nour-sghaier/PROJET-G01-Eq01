// Redimensionne et compresse une image, renvoie une chaîne base64 (data URL).
export function imageEnBase64(fichier, largeurMax = 800, qualite = 0.7) {
  return new Promise((resolve, reject) => {
    if (!fichier.type.startsWith('image/')) {
      return reject(new Error('Le fichier doit être une image.'))
    }
    const lecteur = new FileReader()
    lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    lecteur.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image invalide.'))
      img.onload = () => {
        const ratio = Math.min(1, largeurMax / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', qualite))
      }
      img.src = lecteur.result
    }
    lecteur.readAsDataURL(fichier)
  })
}