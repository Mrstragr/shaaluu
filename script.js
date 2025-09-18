document.addEventListener('DOMContentLoaded', () => {
    const giftBox = document.getElementById('giftBox');
    const photoContainer = document.getElementById('photoContainer');
    const birthdaySound = document.getElementById('birthdaySound');
    const replayBtn = document.getElementById('replayBtn');
    const muteBtn = document.getElementById('muteBtn');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const roundCounter = document.getElementById('roundCounter');

    // List of all your photos (15-20 photos total)
    const allPhotos = [
        { src: '14.jpeg', alt: 'A funny picture of your sister making a face.' },
        { src: '13.jpeg', alt: 'Your sister in a silly outfit.' },
        { src: '12.jpeg', alt: 'A candid shot of her laughing uncontrollably.' },
        { src: '11.jpeg', alt: 'A throwback photo from childhood.' },
        { src: '10.jpeg', alt: 'Your sister with a birthday cake.' },
        { src: '9.jpeg', alt: 'A silly selfie moment.' },
        { src: '8.jpeg', alt: 'Dancing like nobody\'s watching.' },
        { src: '7.JPG', alt: 'Making funny faces at the camera.' },
        { src: '6.jpeg', alt: 'A candid laugh caught on camera.' },
        { src: '5.jpeg', alt: 'Your sister in her favorite outfit.' },
        { src: '4.jpeg', alt: 'A throwback to childhood memories.' },
        { src: '3.jpeg', alt: 'Caught in a funny pose.' },
        { src: '2.jpg', alt: 'Your sister being her goofy self.' },
        { src: '1.jpg', alt: 'A moment of pure joy and laughter.' },
      //  { src: 'photo15.jpg', alt: 'Your sister with her best smile.' },
        //{ src: 'photo16.jpg', alt: 'A candid moment of happiness.' },
       /// { src: 'photo17.jpg', alt: 'Your sister in a funny situation.' },
       // { src: 'photo18.jpg', alt: 'A precious memory captured.' },
       // { src: 'photo19.jpg', alt: 'Your sister being absolutely adorable.' },
       // { src: 'photo20.jpg', alt: 'A perfect birthday moment.' }
    ];

    let currentPhotoIndex = 0;
    let currentRound = 1;
    const PHOTOS_PER_ROUND = 4;
    const TOTAL_ROUNDS = Math.ceil(allPhotos.length / PHOTOS_PER_ROUND);

    // Get next 4 photos for rotation
    function getNextPhotos() {
        const photos = [];
        for (let i = 0; i < PHOTOS_PER_ROUND; i++) {
            const index = (currentPhotoIndex + i) % allPhotos.length;
            photos.push(allPhotos[index]);
        }
        currentPhotoIndex = (currentPhotoIndex + PHOTOS_PER_ROUND) % allPhotos.length;
        currentRound = Math.floor(currentPhotoIndex / PHOTOS_PER_ROUND) + 1;
        if (currentRound > TOTAL_ROUNDS) currentRound = 1;
        return photos;
    }

    // Update round counter display
    function updateRoundCounter() {
        roundCounter.textContent = `Round ${currentRound} of ${TOTAL_ROUNDS}`;
    }

    // Preload images
    const preloadedImages = new Map();
    function preloadPhotos(list) {
        return Promise.all(list.map(item => new Promise(resolve => {
            const img = new Image();
            img.src = item.src;
            img.onload = () => { preloadedImages.set(item.src, img); resolve(true); };
            img.onerror = () => { resolve(false); };
        })));
    }

    let isOpened = false;

    function clearPhotos() {
        while (photoContainer.firstChild) {
            photoContainer.removeChild(photoContainer.firstChild);
        }
    }

    async function openGift() {
        if (isOpened) return;
        isOpened = true;
        giftBox.classList.add('open');

        // Only start playing if not already playing
        if (!birthdaySound.muted && birthdaySound.paused) {
            birthdaySound.currentTime = 0;
            birthdaySound.play().catch(() => {});
        }

        triggerConfettiBurst();

        // Get next 4 photos for this round
        const currentPhotos = getNextPhotos();
        updateRoundCounter();
        
        // Ensure photos are preloaded (or attempted) before animating
        await preloadPhotos(currentPhotos).catch(() => {});

        currentPhotos.forEach((photo, index) => {
            setTimeout(() => {
                const img = document.createElement('img');
                img.src = preloadedImages.get(photo.src)?.src || photo.src;
                img.alt = photo.alt;
                img.loading = 'lazy';
                photoContainer.appendChild(img);

                const x = (Math.random() - 0.5) * 400 + 'px';
                const y = (Math.random() - 0.5) * 400 + 'px';
                const rot = (Math.random() - 0.5) * 60 + 'deg';

                img.style.setProperty('--x', x);
                img.style.setProperty('--y', y);
                img.style.setProperty('--rot', rot);
                img.style.animation = `photo-pop 1s forwards`;
                img.addEventListener('error', () => {
                    img.alt = 'Photo failed to load';
                    img.style.opacity = '0.3';
                });
            }, index * 200);
        });
    }

    function resetGift() {
        isOpened = false;
        giftBox.classList.remove('open');
        clearPhotos();
        // Don't restart the song - let it continue playing
        // Don't reset the round counter - let it continue from where it left off
    }

    giftBox.addEventListener('click', openGift);

    replayBtn.addEventListener('click', () => {
        resetGift();
        // small delay so CSS state settles before re-open
        setTimeout(openGift, 50);
    });

    muteBtn.addEventListener('click', () => {
        const nextMuted = !birthdaySound.muted;
        birthdaySound.muted = nextMuted;
        muteBtn.setAttribute('aria-pressed', String(nextMuted));
        muteBtn.textContent = nextMuted ? 'Unmute' : 'Mute';
    });

    // Auto-repeat the song when it ends
    birthdaySound.addEventListener('ended', () => {
        birthdaySound.currentTime = 0;
        birthdaySound.play().catch(() => {});
    });

    // Confetti implementation
    function triggerConfettiBurst() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const ctx = confettiCanvas.getContext('2d');
        resizeCanvas();

        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd'];
        const particles = Array.from({ length: 120 }, () => createParticle());
        let animationFrameId;
        let life = 0;

        function createParticle() {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 4;
            return {
                x: confettiCanvas.width / 2,
                y: confettiCanvas.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 6,
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.2,
            };
        }

        function tick() {
            life += 1;
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            particles.forEach(p => {
                p.vy += 0.15; // gravity
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vr;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            if (life < 180) {
                animationFrameId = requestAnimationFrame(tick);
            } else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                cancelAnimationFrame(animationFrameId);
            }
        }

        function resizeCanvas() {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas, { once: true });
        tick();
    }
});