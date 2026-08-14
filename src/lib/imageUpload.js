import { storage, storageRef, uploadBytesResumable, getDownloadURL } from './firebase.js'

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

// Bir şəkli sıxıb Firebase Storage-a yükləyir, endirmə linkini qaytarır.
// onStatus(stage, pct) -> stage: 'compressing' | 'uploading' | 'done'
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

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(fileRef, compressed, { contentType: 'image/jpeg' })

    let settled = false
    let stallTimer = null
    let lastBytes = -1

    // Timeout hər dəfə "canlı" siqnal (progress event) alanda YENİDƏN qurulur.
    // Əgər 20 saniyə ərzində HEÇ BİR yeni məlumat ötürülməsə (bytes dəyişməsə), xəta veririk.
    function armStallTimer() {
      if (stallTimer) clearTimeout(stallTimer)
      stallTimer = setTimeout(() => {
        if (settled) return
        settled = true
        console.error('[uploadPropertyImage] 20 saniyədir irəliləyiş yoxdur (real şəbəkə dayanması), dayandırılır')
        task.cancel()
        reject(new Error('Şəbəkə Firebase Storage-a qoşula bilmir və ya məlumat ötürülməsi dayanıb (20 saniyə heç bir irəliləyiş yoxdur). Zəhmət olmasa başqa bir Wi-Fi/mobil data ilə sına.'))
      }, 20000)
    }
    armStallTimer()

    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        console.log('[uploadPropertyImage] irəliləyiş:', pct + '%', snap.bytesTransferred, '/', snap.totalBytes)
        if (onStatus) onStatus('uploading', pct)
        // Yalnız real dəyişiklik olanda timer-i sıfırlayırıq — sabit 0%-də donub qalsa da tutulsun.
        if (snap.bytesTransferred !== lastBytes) {
          lastBytes = snap.bytesTransferred
          armStallTimer()
        }
      },
      (err) => {
        if (settled) return
        settled = true
        clearTimeout(stallTimer)
        console.error('[uploadPropertyImage] Storage xətası:', err.code, err.message)
        reject(new Error(`Storage xətası (${err.code}): ${err.message}`))
      },
      async () => {
        if (settled) return
        settled = true
        clearTimeout(stallTimer)
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          console.log('[uploadPropertyImage] tamamlandı:', url)
          if (onStatus) onStatus('done', 100)
          resolve(url)
        } catch (err) {
          console.error('[uploadPropertyImage] URL alınmadı:', err)
          reject(err)
        }
      }
    )
  })
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
