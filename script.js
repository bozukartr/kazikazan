const symbols = ['🏆', '💎', '🍀', '🧲', '🔑', '🐞'];
const prizes = {
    '🏆': 8000000, // Altın bar - %0.0001
    '💎': 5000,    // Elmas - %0.001
    '🍀': 1000,    // Yonca - %0.01
    '🧲': 500,     // At nalı - %0.1
    '🔑': 250,     // Anahtar - %1
    '🐞': 100      // Uğur böceği - %15
};

// İkramiye ihtimalleri - Toplam 100%
const probabilities = {
    '🏆': 0.000001, // %0.0001
    '💎': 0.00001,  // %0.001
    '🍀': 0.0001,   // %0.01
    '🧲': 0.01,    // %1
    '🔑': 0.05,     // %5
    '🐞': 0.15      // %15
};

let gameActive = false;
let totalPrize = 0;

// Rastgele seri numarası oluşturma fonksiyonu
function generateSerialNumber() {
    const parts = [
        String(Math.floor(Math.random() * 100000)).padStart(5, '0'),
        String(Math.floor(Math.random() * 10000000)).padStart(7, '0'),
        String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    ];
    return parts.join('-');
}

// Rastgele sembol seçme fonksiyonu
function getRandomSymbol(rowIndex, cellIndex, existingSymbols = []) {
    const random = Math.random();
    
    // Eğer son hücreye yaklaşıyorsak ve önceki 2 sembol aynıysa, farklı bir sembol seç
    if (cellIndex >= 2 && existingSymbols[cellIndex - 1] === existingSymbols[cellIndex - 2]) {
        // Önceki sembolden farklı bir sembol seç
        let availableSymbols = symbols.filter(s => s !== existingSymbols[cellIndex - 1]);
        return availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
    }
    
    // Normal sembol seçimi
    if (random < 0.000001) return '🏆'; // %0.0001
    if (random < 0.00001) return '💎';  // %0.001
    if (random < 0.0001) return '🍀';   // %0.01
    if (random < 0.001) return '🧲';    // %0.1
    if (random < 0.01) return '🔑';     // %1
    if (random < 0.15) return '🐞';     // %15
    
    // Kalan ihtimalde rastgele sembol
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Bonus için para destesi çıkma olasılığını kontrol eden fonksiyon
function shouldShowMoneyStack() {
    return Math.random() < 0.0001; // %0.01 olasılık (40000 TL için)
}

function handleScratch(event) {
    if (!gameActive) return;
    
    const overlay = event.target;
    const cell = overlay.closest('.cell');
    if (!cell) return;
    
    cell.classList.add('scratched');
    checkWinningConditions();
}

function createCell(symbol) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    const hiddenSymbol = document.createElement('span');
    hiddenSymbol.className = 'hidden-symbol';
    hiddenSymbol.textContent = symbol;
    
    const placeholder = document.createElement('span');
    placeholder.className = 'placeholder';
    placeholder.textContent = '⭐';
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.addEventListener('click', handleScratch);
    
    cell.appendChild(hiddenSymbol);
    cell.appendChild(placeholder);
    cell.appendChild(overlay);
    
    return cell;
}

// Bonus için rastgele ödül miktarı belirleme fonksiyonu
function getBonusPrize() {
    const random = Math.random();
    if (random < 0.0001) { // %0.01 ihtimalle 5000 TL
        return 5000;
    } else if (random < 0.01) { // %0.09 ihtimalle 1000 TL
        return 1000;
    } else if (random < 0.1) { // %10 ihtimalle 500 TL
        return 500;
    } else if (random < 0.5) { // %50 ihtimalle 250 TL
        return 250;
    } else { // %49 ihtimalle 100 TL
        return 100;
    }
}

function initializeGame() {
    gameActive = true;
    totalPrize = 0;
    
    // Seri numarasını güncelle
    document.getElementById('serialNumber').textContent = generateSerialNumber();
    
    // Tüm row'ları temizle
    document.querySelectorAll('.row').forEach((row, rowIndex) => {
        row.classList.remove('completed', 'won');
        const rowNumber = row.querySelector('.row-number').cloneNode(true);
        const prizeOverlay = row.querySelector('.prize-overlay').cloneNode(true);
        row.innerHTML = '';
        row.appendChild(rowNumber);
        row.appendChild(prizeOverlay);
        
        // Her sıra için sembolleri sakla
        let rowSymbols = [];
        
        // Her sıra için 4 hücre oluştur
        for (let i = 0; i < 4; i++) {
            const symbol = getRandomSymbol(rowIndex, i, rowSymbols);
            rowSymbols.push(symbol);
            const cell = createCell(symbol);
            row.appendChild(cell);
        }
    });

    // Bonus alanını temizle ve yeniden oluştur
    const bonusArea = document.getElementById('bonus');
    bonusArea.innerHTML = '';
    bonusArea.classList.remove('completed', 'won');
    
    // Prize overlay ekle
    const prizeOverlay = document.createElement('div');
    prizeOverlay.className = 'prize-overlay';
    bonusArea.appendChild(prizeOverlay);
    
    // Bonus oyun alanını oluştur
    const showMoneyStack = Math.random() < 0.001; // %0.1 olasılık
    const bonusSymbol = showMoneyStack ? '💵' : getRandomSymbol(0, 0);
    const bonusPrize = showMoneyStack ? 40000 : getBonusPrize();
    
    const bonusCell = createCell(bonusSymbol);
    bonusArea.appendChild(bonusCell);

    const prizeBonusCell = createCell(bonusPrize + ' TL');
    bonusArea.appendChild(prizeBonusCell);
}

function checkWinningConditions() {
    totalPrize = 0; // Her kontrolde toplam kazancı sıfırla
    
    // Her sırayı kontrol et
    document.querySelectorAll('.row').forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('.cell'));
        const scratchedCount = cells.filter(cell => cell.classList.contains('scratched')).length;
        
        // Tüm hücreler kazındıysa
        if (scratchedCount === 4) {
            row.classList.add('completed');
            
            // Sembolleri topla
            const symbols = cells.map(cell => 
                cell.querySelector('.hidden-symbol').textContent
            );
            
            // Her sembolün kaç kez tekrar ettiğini say
            const symbolCount = {};
            symbols.forEach(symbol => {
                symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
            });
            
            // 3 veya daha fazla aynı sembol var mı kontrol et
            let winningSymbol = null;
            let prize = 0;
            
            for (let symbol in symbolCount) {
                if (symbolCount[symbol] >= 3 && prizes[symbol]) {
                    winningSymbol = symbol;
                    prize = prizes[symbol];
                    break;
                }
            }
            
            // Kazanç varsa
            if (prize > 0) {
                totalPrize += prize;
                row.classList.add('won');
                
                // Kazanan sembolleri highlight et
                cells.forEach(cell => {
                    if (cell.querySelector('.hidden-symbol').textContent === winningSymbol) {
                        cell.classList.add('winning-symbol');
                    }
                });
                
                // Kazanç miktarını göster
                const prizeOverlay = row.querySelector('.prize-overlay');
                prizeOverlay.textContent = `${prize.toLocaleString('tr-TR')} TL`;
                
                console.log(`Sıra ${rowIndex + 1}: ${winningSymbol} sembolünden ${prize} TL kazandı`);
            }
        }
    });

    // Bonus alanını kontrol et
    const bonusArea = document.getElementById('bonus');
    const bonusCells = bonusArea.querySelectorAll('.cell.scratched');
    if (bonusCells.length === 2) {
        bonusArea.classList.add('completed');
        const bonusSymbol = bonusCells[0].querySelector('.hidden-symbol').textContent;
        const bonusPrizeText = bonusCells[1].querySelector('.hidden-symbol').textContent;
        
        console.log('Bonus kontrol:', { bonusSymbol, bonusPrizeText });
        
        if (bonusSymbol === '💵') {
            const bonusPrize = parseInt(bonusPrizeText);
            totalPrize += bonusPrize;
            bonusArea.classList.add('won');
            
            // Kazanç miktarını göster
            const prizeOverlay = bonusArea.querySelector('.prize-overlay');
            prizeOverlay.textContent = `${bonusPrize.toLocaleString('tr-TR')} TL`;
            
            // Kazanan sembolleri highlight et
            bonusCells.forEach(cell => cell.classList.add('winning-symbol'));
            
            console.log(`Bonus kazandı: ${bonusPrize} TL`);
        }
    }

    // Tüm hücreler kazındı mı kontrol et
    const allCells = document.querySelectorAll('.cell');
    const scratchedCells = document.querySelectorAll('.cell.scratched');
    
    if (allCells.length === scratchedCells.length) {
        gameActive = false;
        console.log('Oyun bitti. Toplam kazanç:', totalPrize);
        setTimeout(() => {
            showModal(totalPrize);
        }, 500);
    }
}

// Modal işlemleri için fonksiyonlar
function showModal(prize) {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalPrize = modalOverlay.querySelector('.modal-prize');
    const modalButton = modalOverlay.querySelector('.modal-button');

    if (prize > 0) {
        modalPrize.textContent = `${prize.toLocaleString('tr-TR')} TL`;
    } else {
        modalOverlay.querySelector('.modal-title').textContent = 'Üzgünüz!';
        modalPrize.textContent = 'Bu sefer kazanamadınız.';
    }

    modalOverlay.style.display = 'flex';
    
    modalButton.onclick = () => {
        modalOverlay.style.display = 'none';
        initializeGame();
    };
}

// Event listener'ı ekle
document.addEventListener('DOMContentLoaded', () => {
    // Yeni oyun butonuna tıklama olayı ekle
    document.getElementById('newGame').addEventListener('click', initializeGame);
    
    // Hepsini Kazı butonuna tıklama olayı ekle
    document.getElementById('scratchAll').addEventListener('click', () => {
        if (!gameActive) return;
        
        // Tüm hücreleri kazı
        document.querySelectorAll('.cell:not(.scratched)').forEach(cell => {
            cell.classList.add('scratched');
        });
        
        // Kazanma durumunu kontrol et
        checkWinningConditions();
    });
    
    // Kart çevirme işlemleri
    const flipContainer = document.querySelector('.flip-container');
    const rulesNote = document.querySelector('.rules-note');
    const flipBackBtn = document.querySelector('.flip-back-btn');
    
    rulesNote.addEventListener('click', () => {
        flipContainer.classList.add('flipped');
    });
    
    flipBackBtn.addEventListener('click', () => {
        flipContainer.classList.remove('flipped');
    });
    
    // Modal dışına tıklandığında modalı kapat
    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.target.style.display = 'none';
            initializeGame();
        }
    });
    
    // Sayfa yüklendiğinde yeni oyun başlat
    initializeGame();
}); 