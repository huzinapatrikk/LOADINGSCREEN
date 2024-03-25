const maxId = 1; // Hány zene van
const maxImageId = 8; // Hány kép van.
const imageData = [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000] // mennyit jelennek megjelenítve a képek. Min 1600.

function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const audioFolder = 'assets/sound/';
let currentId = randomNumber(1, maxId);
let audioElement;

function playNextAudio() {
    const audioUrl = audioFolder + currentId + '.mp3';

    if (currentId <= maxId) {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.removeEventListener("ended", playNextAudio);
        }

        audioElement = new Audio(audioUrl);
        audioElement.play();
        audioElement.volume = $('.volume-slider').val() / 100;

        audioElement.addEventListener("ended", playNextAudio);

        currentId++;
    } else {
        currentId = 1;
        playNextAudio();
    }
}

function changeWidth(val) {
    $('.inner-div').css('width', `${val}%`);
    $('.center-text').text(`Betöltés: ${val}%`)
}

function changeText(val) {
    if ($('.front-text').text() !== val) {
        $('.front-text').css('opacity', '0')
        setTimeout(() => {
            $('.front-text').text(val);
            $('.front-text').css('opacity', '1')
        }, 200)
    }
}

function isElement(obj) {
    try {
        return obj instanceof HTMLElement;
    } catch (e) {
        return (typeof obj === "object") &&
            (obj.nodeType === 1) && (typeof obj.style === "object") &&
            (typeof obj.ownerDocument === "object");
    }
}

$(document).ready(function() {
    setUpImage();
    playNextAudio();

    const volumeSlider = $(".volume-slider");
    const volumePercentage = $(".volume-percentage");
    const volumeIcon = $(".sound-container i");
    
    let volumeValue = 50;

    const storedVolumeValue = localStorage.getItem("volumeValue");
    if (storedVolumeValue !== null) {
        volumeValue = parseInt(storedVolumeValue, 10);
    }

    let isMuted = volumeValue == 0; 
    
    function updateUI() {
        volumeSlider.val(volumeValue);
        volumePercentage.text(`${volumeValue}%`);
        if (isElement(audioElement)) {
            audioElement.volume = volumeValue / 100;
        }

        if (isMuted) {
            volumeIcon.removeClass("fa-volume-up").addClass("fa-volume-mute");
        } else {
            volumeIcon.removeClass("fa-volume-mute").addClass("fa-volume-up");
        }

        localStorage.setItem("volumeValue", volumeValue);
    }
    
    updateUI();
    
    volumeIcon.on("click", function() {
        if (isMuted) {
            volumeValue = 100;
        } else {
            volumeValue = 0;  
        }
        
        isMuted = !isMuted;
        updateUI();
    });
    
    volumeSlider.on("input", function() {
        volumeValue = $(this).val();
        isMuted = volumeValue == 0;

        updateUI();
    });
});

/*
    Image Handler Query
*/

let currentImageId = randomNumber(1, maxImageId) - 1;

function switchImage() {
    $("#image-1").css('opacity', '0')
    $("#image-2").css('opacity', '1')

    currentImageId++;

    if (currentImageId >= maxImageId) {
        $('#image-1').css('background-image', `url("assets/img/${currentImageId}.png")`);
        currentImageId = 0;
        $('#image-2').css('background-image', `url("assets/img/${currentImageId + 1}.png")`);
    } else {
        $('#image-1').css('background-image', `url("assets/img/${currentImageId}.png")`);
        $('#image-2').css('background-image', `url("assets/img/${currentImageId + 1}.png")`);
    }

    setTimeout(() => {
        $('#image-1').css('background-image', $('#image-2').css('background-image'));
        $("#image-1").css('opacity', '1');

        setTimeout(() => {
            $("#image-2").css('opacity', '0');
        }, 500, 1)
    }, 500, 1)
    
    setTimeout(switchImage, imageData[currentImageId])
}

function setUpImage() {
    $('#image-1').css('background-image', `url("assets/img/${currentImageId + 1}.png")`);
    $('#image-1').css('opacity', 1)

    setTimeout(switchImage, imageData[currentImageId]);
}

/*
    Loading Handler.
*/
let count = 0;
let thisCount = 0;
const texts = {
    0: 'Adatok betöltése folyamatban...',
    25: 'Karakter szinkronizációk betöltése folyamatban...',
    50: 'Szinkronizációk folyamatban...',
    75: 'Belépés a szerverre...',
};
let oldValue = 0;

const handlers = {
    startInitFunctionOrder(data) {
        count = data.count;
    },

    initFunctionInvoking(data) {
        const newValue = Math.max(0, Math.min(100, Math.floor((data.idx / count) * 100)));

        /*if (newValue >= 75) {
            changeText(texts[3]);
        } else if (newValue >= 50) {
            changeText(texts[2]);
        } else if (newValue >= 25) {
            changeText(texts[1]);
        } else if (newValue >= 0) {
            changeText(texts[0]);
        }
        */

        if (texts[oldValue]) {
            changeText(texts[oldValue]);
        }

        oldValue = newValue;

        changeWidth(newValue);
    },

    startDataFileEntries(data) {
        count = data.count;
    },

    performMapLoadFunction(data) {
        ++thisCount;
        const newValue = Math.max(0, Math.min(100, Math.floor((thisCount / count) * 100)));

        changeText('Map betöltése folyamatban...');
        changeWidth(newValue);
    },
};

window.addEventListener('message', function (e) {
    (handlers[e.data.eventName] || function () { })(e.data);
});