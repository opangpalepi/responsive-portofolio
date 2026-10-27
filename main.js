/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
   navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu')
   })
}

/* Menu hidden */
if (navClose) {
   navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu')
   })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
   // When we click on each nav__link, we remove the show-menu class
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
   const header = document.getElementById('header')
   // When the scroll is greater than 50 viewport height, add the blur-header class
   window.scrollY >= 50 ? header.classList.add('blur-header')
                        : header.classList.remove('blur-header')
}
window.addEventListener('scroll', blurHeader)

/*=============== CONTACT FORM (WhatsApp + Gmail) ===============*/
// ---- DATA PEMILIK ----
const OWNER = {
   whatsapp: '6285846964893',                    // 0858-4696-4893 -> format internasional (62...)
   email:    'muhammadnaufalfahlevi4@gmail.com'
}

// ---- EmailJS (opsional, agar email masuk OTOMATIS ke Gmail tanpa membuka Gmail) ----
// Daftar gratis di emailjs.com, lalu ganti 3 nilai di bawah. Selama masih 'YOUR_...',
// tombol Gmail akan membuka Gmail dengan pesan yang sudah terisi.
const EMAILJS = {
   serviceID:  'YOUR_SERVICE_ID',
   templateID: 'YOUR_TEMPLATE_ID',
   publicKey:  'YOUR_PUBLIC_KEY'
}

const contactForm    = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message'),
      contactBot     = document.getElementById('contact-bot')

if (contactForm) {
   const sendWaBtn   = document.getElementById('send-wa'),
         sendMailBtn = document.getElementById('send-mail')

   const emailjsReady = () =>
      typeof emailjs !== 'undefined' &&
      Object.values(EMAILJS).every(v => v && !v.startsWith('YOUR_'))

   // Ambil & bersihkan data form
   const readForm = () => ({
      name:    contactForm.user_name.value.trim().replace(/\s+/g, ' '),
      phone:   contactForm.user_phone.value.trim(),
      purpose: contactForm.user_purpose.value,
      message: contactForm.user_message.value.trim()
   })

   // Validasi: kembalikan teks error, atau '' jika valid
   const validate = (d) => {
      if (d.name.length < 2)                         return 'Nama wajib diisi (minimal 2 huruf).'
      const digits = d.phone.replace(/\D/g, '')
      if (!/^[0-9+\s().-]+$/.test(d.phone) || digits.length < 9 || digits.length > 15)
                                                     return 'Nomor telepon tidak valid (9–15 angka).'
      if (!d.purpose)                                return 'Pilih keperluan Anda.'
      if (d.message.length < 5)                      return 'Pesanan wajib diisi (minimal 5 karakter).'
      return ''
   }

   // Format pesan otomatis (nama, nomor telepon, keperluan, pesanan)
   const buildText = (d, bold = false) => {
      const b = (t) => bold ? `*${t}*` : t
      return `Halo, saya mengirim pesan dari website portofolio Anda.\n\n` +
             `${b('Nama')}: ${d.name}\n` +
             `${b('Nomor Telepon')}: ${d.phone}\n` +
             `${b('Keperluan')}: ${d.purpose}\n` +
             `${b('Pesanan')}: ${d.message}`
   }

   const subjectOf = (d) => `Pesan baru dari ${d.name} - ${d.purpose}`

   // Buka link di tab baru (aman, tidak diblokir popup karena dipicu klik)
   const openLink = (url) => {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
   }

   const showMessage = (text, type) => {
      contactMessage.textContent = text
      contactMessage.dataset.type = type || ''
   }

   // Balasan bot otomatis (memakai textContent -> aman dari XSS)
   const showBot = (d, statusText) => {
      contactBot.replaceChildren()

      const title = document.createElement('strong')
      title.textContent = '🤖 Bot Otomatis'

      const hello = document.createElement('p')
      hello.textContent = `Halo ${d.name}! ${statusText}`

      const list = document.createElement('ul')
      list.className = 'contact__bot-list'
      ;[['Nama', d.name], ['Nomor Telepon', d.phone], ['Keperluan', d.purpose], ['Pesanan', d.message]]
         .forEach(([label, value]) => {
            const li = document.createElement('li')
            const l = document.createElement('span')
            l.textContent = label + ':'
            li.append(l, ' ' + value)
            list.appendChild(li)
         })

      const bye = document.createElement('p')
      bye.textContent = 'Terima kasih, kami akan segera menghubungi Anda.'

      contactBot.append(title, hello, list, bye)
      contactBot.hidden = false
   }

   // Pengecekan bersama untuk kedua tombol
   const getValidData = () => {
      if (contactForm.website.value) return null            // bot spam terdeteksi -> abaikan diam-diam
      const data = readForm()
      const error = validate(data)
      if (error) { showMessage(error, 'error'); contactBot.hidden = true; return null }
      return data
   }

   // ---- Kirim ke WhatsApp ----
   sendWaBtn.addEventListener('click', () => {
      const data = getValidData()
      if (!data) return

      const url = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(buildText(data, true))}`
      openLink(url)
      showMessage('WhatsApp dibuka ✅', 'ok')
      showBot(data, 'WhatsApp sudah terbuka dengan pesan Anda. Tekan tombol Kirim di WhatsApp untuk menyelesaikannya.')
   })

   // ---- Kirim ke Gmail ----
   contactForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const data = getValidData()
      if (!data) return

      // A) Email otomatis lewat EmailJS (jika sudah dikonfigurasi)
      if (emailjsReady()) {
         sendMailBtn.disabled = true
         showMessage('Mengirim pesan...', '')

         emailjs.send(EMAILJS.serviceID, EMAILJS.templateID, {
            to_email:      OWNER.email,
            subject:       subjectOf(data),
            user_name:     data.name,
            user_phone:    data.phone,
            user_purpose:  data.purpose,
            user_message:  data.message
         }, { publicKey: EMAILJS.publicKey })
            .then(() => {
               showMessage('Pesan berhasil dikirim ✅', 'ok')
               showBot(data, 'Pesan Anda sudah masuk ke email kami.')
               contactForm.reset()
            })
            .catch(() => {
               showMessage('Pesan gagal dikirim ❌ Coba lagi atau gunakan tombol WhatsApp.', 'error')
            })
            .finally(() => { sendMailBtn.disabled = false })
         return
      }

      // B) Cadangan: buka Gmail dengan pesan yang sudah terisi
      const url = 'https://mail.google.com/mail/?view=cm&fs=1' +
                  `&to=${encodeURIComponent(OWNER.email)}` +
                  `&su=${encodeURIComponent(subjectOf(data))}` +
                  `&body=${encodeURIComponent(buildText(data))}`
      openLink(url)
      showMessage('Gmail dibuka ✅', 'ok')
      showBot(data, 'Gmail sudah terbuka dengan pesan Anda. Tekan tombol Kirim di Gmail untuk menyelesaikannya.')
   })
}

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
   const scrollUp = document.getElementById('scroll-up')
   // When the scroll is higher than 350 viewport height, add the show-scroll class
   window.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
                         : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
   const scrollDown = window.scrollY

   sections.forEach(current => {
      const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

      if (!sectionsClass) return

      if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
         sectionsClass.classList.add('active-link')
      } else {
         sectionsClass.classList.remove('active-link')
      }
   })
}
window.addEventListener('scroll', scrollActive)

/*=============== IMAGE SLIDER (detail pages) ===============*/
const slider = document.getElementById('slider')

if (slider) {
   const track   = document.getElementById('slider-track'),
         slides  = slider.querySelectorAll('.slider__slide'),
         dots    = document.querySelectorAll('.slider__dot'),
         prevBtn = document.getElementById('slider-prev'),
         nextBtn = document.getElementById('slider-next'),
         delay   = 4000 // geser otomatis tiap 4 detik

   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
   let index = 0, timer = null

   const goTo = (i) => {
      index = (i + slides.length) % slides.length   // berputar: 3 -> 1, 1 -> 3
      track.style.transform = `translateX(-${index * 100}%)`
      dots.forEach((dot, n) => {
         dot.classList.toggle('active', n === index)
         dot.toggleAttribute('aria-current', n === index)
      })
   }

   const stop  = () => { clearInterval(timer); timer = null }
   const start = () => {
      stop()
      if (!reduceMotion) timer = setInterval(() => goTo(index + 1), delay)
   }

   // Klik lingkaran panah
   prevBtn.addEventListener('click', () => { goTo(index - 1); start() })
   nextBtn.addEventListener('click', () => { goTo(index + 1); start() })

   // Klik lingkaran titik
   dots.forEach((dot, n) => dot.addEventListener('click', () => { goTo(n); start() }))

   // Berhenti saat kursor / fokus di atas slider, lanjut saat pergi
   slider.addEventListener('mouseenter', stop)
   slider.addEventListener('mouseleave', start)
   slider.addEventListener('focusin', stop)
   slider.addEventListener('focusout', start)

   // Keyboard: panah kiri / kanan
   slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(index - 1); start() }
      if (e.key === 'ArrowRight') { goTo(index + 1); start() }
   })

   // Swipe di layar sentuh
   let startX = 0
   slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop() }, { passive: true })
   slider.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - startX
      if (Math.abs(diff) > 40) goTo(diff < 0 ? index + 1 : index - 1)
      start()
   })

   // Hemat tenaga: berhenti saat tab tidak dilihat
   document.addEventListener('visibilitychange', () => document.hidden ? stop() : start())

   goTo(0)
   start()
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
if (typeof ScrollReveal !== 'undefined') {
   const sr = ScrollReveal({
      origin: 'top',
      distance: '60px',
      duration: 2500,
      delay: 300,
      // reset: true, // Animations repeat
   })

   sr.reveal('.home__data, .home__scroll')
   sr.reveal('.home__image', { origin: 'bottom', delay: 600 })
   sr.reveal('.work__card', { interval: 100 })
   sr.reveal('.about__img-box', { origin: 'left' })
   sr.reveal('.about__data', { origin: 'right' })
   sr.reveal('.experience, .skills', { interval: 100 })
   sr.reveal('.services__card', { interval: 100 })
   sr.reveal('.contact__form', { origin: 'left' })
   sr.reveal('.contact__social', { origin: 'right' })

   // Project detail pages
   sr.reveal('.project__head')
   sr.reveal('.slider', { origin: 'bottom', delay: 400 })
   sr.reveal('.project__intro', { delay: 500 })
   sr.reveal('.features__card', { interval: 100 })
   sr.reveal('.tech__tag', { interval: 60 })
   sr.reveal('.project-nav')
}
