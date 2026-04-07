document.addEventListener('DOMContentLoaded', () => {

    const startScreen = document.getElementById('start-screen');
    const videoScreen = document.getElementById('video-screen');
    const characterSelect = document.getElementById('character-select');
    const contentScreen = document.getElementById('content-screen');

    const startupVideo = document.getElementById('startup-video');
    const skipBtn = document.getElementById('skip-btn');

    const charVideoScreen = document.getElementById('char-video-screen');
    const charStartupVideo = document.getElementById('char-startup-video');
    const charSkipBtn = document.getElementById('char-skip-btn');
    const fadeOverlay = document.getElementById('fade-overlay');

    const charCards = document.querySelectorAll('.character-card');
    const backBtn = document.getElementById('back-btn');
    const volumeSlider = document.getElementById('volume-slider');

    const contentIlyas = document.getElementById('content-ilyas');
    const contentKeyzz = document.getElementById('content-keyzz');

    const audioWys = document.getElementById('audio-wys');
    const audioFs3 = document.getElementById('audio-fs3');

    let currentAudio = null;

    audioWys.volume = 0.15;
    audioFs3.volume = 0.15;
    volumeSlider.value = 0.15;

    volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        audioWys.volume = vol;
        audioFs3.volume = vol;
    });

    function playAudio(audioElem) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        audioElem.play().catch(e => console.log(e));
        currentAudio = audioElem;
    }

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
        }
    }


    let audioCtx = null;
    const initAudio = () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    };

    const Snd = {
        getVol: () => parseFloat(volumeSlider.value),
        beep: (freq = 440, duration = 0.1, type = 'square', volume = 0.05) => {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            const finalVol = volume * (Snd.getVol() / 0.15);
            gain.gain.setValueAtTime(finalVol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        },
        confirm: () => {
            Snd.beep(600, 0.1, 'square', 0.05);
            setTimeout(() => Snd.beep(800, 0.1, 'square', 0.05), 50);
        },
        cancel: () => {
            Snd.beep(400, 0.1, 'square', 0.05);
            setTimeout(() => Snd.beep(300, 0.1, 'square', 0.05), 50);
        },
        click: () => Snd.beep(1000, 0.05, 'sine', 0.03),
        static: () => {
            initAudio();
            const bufferSize = audioCtx.sampleRate * 0.1;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.02 * (Snd.getVol() / 0.15), audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            source.connect(gain);
            gain.connect(audioCtx.destination);
            source.start();
        }
    };

    function switchScreen(hideScreen, showScreen, withTvEffect = true) {
        if (withTvEffect) {
            document.body.classList.add('tv-powering');
            Snd.static();
            setTimeout(() => {
                hideScreen.classList.remove('active');
                showScreen.classList.add('active');
                document.body.classList.remove('tv-powering');
                document.body.classList.add('tv-on');
                setTimeout(() => document.body.classList.remove('tv-on'), 400);
            }, 400);
        } else {
            hideScreen.classList.remove('active');
            showScreen.classList.add('active');
        }
    }

    async function transitionWithFade(hideScreen, showScreen, midAction = null, fadeOutAfter = true) {
        fadeOverlay.classList.add('active');
        await new Promise(r => setTimeout(r, 600));

        hideScreen.classList.remove('active');
        showScreen.classList.add('active');

        if (midAction) midAction();

        if (fadeOutAfter) {
            await new Promise(r => setTimeout(r, 100));
            fadeOverlay.classList.remove('active');
        }
    }

    const biosScreen = document.getElementById('bios-screen');
    const biosContent = document.getElementById('bios-content');
    const biosLines = [
        "KEYZZ-BIOS (C) 2026 KEYZZILLA CORP.",
        "CPU: INTEL(R) CORE(TM) I9-12900K @ 5.20GHZ",
        "MEMORY TEST: 32768MB OK",
        "WAITING FOR DISK... FOUND",
        "BOOTING FROM 'KEYZZILLA.EXE'...",
        "INITIALIZING INTERFACE...",
        "SYSTEM READY."
    ];

    async function playBiosSequence() {
        biosScreen.classList.add('active');
        biosContent.innerHTML = '';
        for (const line of biosLines) {
            const div = document.createElement('div');
            div.className = 'bios-line visible';
            div.textContent = "> " + line;
            biosContent.appendChild(div);
            Snd.click();
            await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        }
        await new Promise(r => setTimeout(r, 500));

        await transitionWithFade(biosScreen, characterSelect, () => {
            document.body.style.backgroundImage = "url('assets/bliss.png')";
        });
    }

    startScreen.addEventListener('click', () => {
        Snd.confirm();
        switchScreen(startScreen, videoScreen);
        startupVideo.volume = 0.5;
        startupVideo.play().catch(e => {
            playBiosSequence();
        });
    });

    startupVideo.addEventListener('ended', () => {
        playBiosSequence();
    });

    skipBtn.addEventListener('click', () => {
        Snd.cancel();
        startupVideo.pause();
        playBiosSequence();
    });

    async function selectCharacter(charId) {
        Snd.confirm();


        await transitionWithFade(characterSelect, charVideoScreen, () => {
            if (charId === 'ilyas') {
                charStartupVideo.src = 'mtz startup.mp4';
            } else if (charId === 'keyzz') {
                charStartupVideo.src = 'keyzz x startup.mp4';
            }
            charStartupVideo.load();
        }, false);

        charStartupVideo.volume = 0.5;
        charStartupVideo.play().then(() => {
            fadeOverlay.classList.remove('active');
        }).catch(e => {
            showCharacterContent(charId);
        });

        window.selectedChar = charId;
    }

    async function showCharacterContent(charId) {
        await transitionWithFade(charVideoScreen, contentScreen, () => {
            contentIlyas.classList.remove('active');
            contentKeyzz.classList.remove('active');

            if (charId === 'ilyas') {
                document.body.style.backgroundImage = "url('assets/slides.gif')";
                contentIlyas.classList.add('active');
                playAudio(audioWys);
            } else if (charId === 'keyzz') {
                document.body.style.backgroundImage = "url('assets/kc wper.jpeg')";
                contentKeyzz.classList.add('active');
                playAudio(audioFs3);
            }
        });
    }

    charStartupVideo.addEventListener('ended', () => {
        showCharacterContent(window.selectedChar);
    });

    charSkipBtn.addEventListener('click', () => {
        Snd.cancel();
        charStartupVideo.pause();
        showCharacterContent(window.selectedChar);
    });

    charCards.forEach(card => {
        card.addEventListener('mouseenter', () => Snd.beep(440, 0.05));
        card.addEventListener('click', () => {
            const charId = card.getAttribute('data-character');
            selectCharacter(charId);
        });
    });

    backBtn.addEventListener('click', () => {
        Snd.cancel();
        stopAudio();
        transitionWithFade(contentScreen, characterSelect, () => {
            document.body.style.backgroundImage = "url('assets/bliss.png')";
        });
    });

    const networkTrigger = document.getElementById('network-trigger');
    if (networkTrigger) {
        networkTrigger.addEventListener('click', () => {
            const opening = !networkTrigger.classList.contains('active');
            if (opening) Snd.confirm(); else Snd.cancel();
            networkTrigger.classList.toggle('active');
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && (startScreen.classList.contains('active') || videoScreen.classList.contains('active'))) {
            if (startScreen.classList.contains('active')) startScreen.click();
            if (videoScreen.classList.contains('active')) skipBtn.click();
        }
        if (e.code === 'Backspace' && contentScreen.classList.contains('active')) {
            backBtn.click();
        }
        if (e.code === 'Enter' && (videoScreen.classList.contains('active') || charVideoScreen.classList.contains('active'))) {
            if (videoScreen.classList.contains('active')) skipBtn.click();
            if (charVideoScreen.classList.contains('active')) charSkipBtn.click();
        }
    });

});
