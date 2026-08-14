import { storage, storageRef, uploadBytesResumable, getDownloadURL } from './firebase.js'

// Şəkli brauzerdə yükləmədən əvvəl kiçildir və sıxır.
// Standart telefon şəkli (3-8 MB) belə ~150-350 KB-a düşür, keyfiyyət gözlə fərqlənmir.
function compressImage(file, maxWidth = 1600, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => { img.src = e.target.result }
    reader.onerror = reject
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Sıxma alınmadı'))),
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Bir şəkli sıxıb Firebase Storage-a yükləyir, endirmə linkini qaytarır.
export function uploadPropertyImage(tenantId, file, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const compressed = await compressImage(file)
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const path = `emlak_crm/properties/${tenantId}/${Date.now()}_${safeName}.jpg`
      const fileRef = storageRef(storage, path)
      const task = uploadBytesResumable(fileRef, compressed, { contentType: 'image/jpeg' })
      task.on(
        'state_changed',
        (snap) => {
          if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
        },
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          resolve(url)
        }
      )
    } catch (err) {
      reject(err)
    }
  })
}

// Bir neçə şəkli ardıcıl yükləyir, hər birinin gedişatını bildirir.
export async function uploadPropertyImages(tenantId, files, onFileProgress) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadPropertyImage(tenantId, files[i], (pct) => {
      if (onFileProgress) onFileProgress(i, pct)
    })
    urls.push(url)
  }
  return urls
}
