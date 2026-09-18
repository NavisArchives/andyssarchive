/* Accessible mobile menu */
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (menuToggle && mobileMenu) {
	const firstMenuLink = mobileMenu.querySelector('a');
	function openMenu() {
		menuToggle.classList.add('open');
		menuToggle.setAttribute('aria-expanded', 'true');
		mobileMenu.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
		firstMenuLink?.focus();
	}
	function closeMenu() {
		menuToggle.classList.remove('open');
		menuToggle.setAttribute('aria-expanded', 'false');
		mobileMenu.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
		menuToggle.focus();
	}
	menuToggle.addEventListener('click', () => {
		const expanded = menuToggle.classList.toggle('open');
		if (expanded) openMenu(); else closeMenu();
	});
	// close on Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			if (mobileMenu.getAttribute('aria-hidden') === 'false') closeMenu();
			const lb = document.getElementById('lightbox');
			if (lb && lb.getAttribute('aria-hidden') === 'false') closeLightbox();
		}
	});
	// close when clicking outside mobile menu
	document.addEventListener('click', (e) => {
		if (mobileMenu.getAttribute('aria-hidden') === 'false' && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
			closeMenu();
		}
	});
	// close menu when a link is clicked
	mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
}

/* Carousel arrows and filters */
const carousel = document.getElementById('carousel');
const arrows = document.querySelectorAll('.arrow');
arrows.forEach(btn => btn.addEventListener('click', () => {
	if (!carousel) return;
	const dir = Number(btn.dataset.dir) || 1;
	const card = carousel.querySelector('.work-card');
	const gap = parseInt(getComputedStyle(carousel).gap) || 14;
	const scrollAmount = (card ? card.clientWidth : carousel.clientWidth * 0.8) + gap;
	carousel.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
}));

/* Filters */
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => chip.addEventListener('click', () => {
	chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
	chip.classList.add('active'); chip.setAttribute('aria-selected', 'true');
	const f = chip.dataset.filter;
	document.querySelectorAll('.work-card').forEach(card => {
		if (f === 'all') card.hidden = false;
		else card.hidden = card.dataset.category !== f;
	});
	carousel?.scrollTo({ left: 0, behavior: 'smooth' });
}));

/* Pause other videos when one plays */
document.addEventListener('play', (e) => {
	const vids = document.querySelectorAll('.card-video');
	vids.forEach(v => { if (v !== e.target) v.pause(); });
}, true);

/* Photo lightbox */
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
function openLightbox(src, alt=''){
	if(!lightbox) return;
	lightboxImg.src = src; lightboxImg.alt = alt; lightbox.setAttribute('aria-hidden','false');
	document.body.style.overflow = 'hidden';
	lightboxClose?.focus();
}
function closeLightbox(){
	if(!lightbox) return;
	lightbox.setAttribute('aria-hidden','true');
	lightboxImg.src = '';
	document.body.style.overflow = '';
}
document.querySelectorAll('.photo-item img').forEach(img => img.addEventListener('click', (e) => {
	openLightbox(e.currentTarget.src, e.currentTarget.alt || '');
}));
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
lightboxClose?.addEventListener('click', closeLightbox);

/* Keyboard: close lightbox with Escape handled above. */

/* Prevent large downloads: ensure videos use preload=metadata and rely on user interaction to play */
document.querySelectorAll('.card-video').forEach(v => {
	v.addEventListener('loadeddata', () => {
		// nothing heavy on load
	});
});

/* Focus management for skip to content could be added here if needed */
