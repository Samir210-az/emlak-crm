import { storage, storageRef, uploadBytes, getDownloadURL } from './firebase.js'

// Şəkli brauzerdə yükləmədən əvvəl kiçildir və sıxır.
function compressImage(file, maxWidth = 1600, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Şəkil sıxılması vaxtı bitdi (timeout)')), 20000)
    try {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = (e) => { img.src = e.target.result }
      reader.onerror = (e) => { clearTimeout(timeout); reject(new Error('Fayl oxunmadı: ' + (e?.message || 'naməlum'))) }
      img.onload = () => {
        try {
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
            (blob) => {
              clearTimeout(timeout)
              if (blob) resolve(blob)
              else reject(new Error('canvas.toBlob boş nəticə qaytardı'))
            },
            'image/jpeg',
            quality
          )
        } catch (err) {
          clearTimeout(timeout)
          reject(err)
        }
      }
      img.onerror = () => { clearTimeout(timeout); reject(new Error('Şəkil brauzerdə açılmadı (image decode xətası)')) }
      reader.readAsDataURL(file)
    } catch (err) {
      clearTimeout(timeout)
      reject(err)
    }
  })
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

// Bir şəkli sıxıb Firebase Storage-a BİR ZƏRBƏDƏ (resumable olmadan) yükləyir.
// Bu üsul bəzi məhdudlaşdırıcı şəbəkələrdə/proksilərdə resumable protokoldan daha etibarlıdır.
export async function uploadPropertyImage(tenantId, file, onStatus) {
  console.log('[uploadPropertyImage] başladı:', file.name, file.size, 'bytes')
  if (onStatus) onStatus('compressing', 0)

  let compressed
  try {
    compressed = await compressImage(file)
    console.log('[uploadPropertyImage] sıxıldı:', compressed.size, 'bytes')
  } catch (err) {
    console.error('[uploadPropertyImage] sıxma xətası:', err)
    throw new Error('Sıxma mərhələsində xəta: ' + err.message)
  }

  if (onStatus) onStatus('uploading', 0)

  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
  const path = `emlak_crm/properties/${tenantId}/${Date.now()}_${safeName}.jpg`
  const fileRef = storageRef(storage, path)

  try {
    await withTimeout(
      uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' }),
      30000,
      'Yükləmə 30 saniyədən sonra cavab vermədi. Şəbəkə Firebase Storage-a çata bilmir.'
    )
    console.log('[uploadPropertyImage] yükləndi, link alınır...')
    if (onStatus) onStatus('uploading', 90)
    const url = await withTimeout(
      getDownloadURL(fileRef),
      15000,
      'Link alınması 15 saniyədən sonra cavab vermədi.'
    )
    console.log('[uploadPropertyImage] tamamlandı:', url)
    if (onStatus) onStatus('done', 100)
    return url
  } catch (err) {
    console.error('[uploadPropertyImage] xəta:', err)
    if (err.code) {
      throw new Error(`Storage xətası (${err.code}): ${err.message}`)
    }
    throw err
  }
}

// Bir neçə şəkli ardıcıl yükləyir, hər birinin gedişatını bildirir.
export async function uploadPropertyImages(tenantId, files, onFileProgress) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadPropertyImage(tenantId, files[i], (stage, pct) => {
      if (onFileProgress) onFileProgress(i, pct, stage)
    })
    urls.push(url)
  }
  return urls
}
