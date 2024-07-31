const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let vidas = 5;
let pontuacao = 0;

function desenharVidas() {
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Vidas: ' + vidas, 2000, 500); 
}

class Fantasma {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.image = new Image();
        this.image.src = "images/ghost.png"; 
        this.normalImage = this.image.src;
        this.blueImage = "images/fantasmaAzul.png"; 
        this.whiteImage = "images/fantasmaBranco.png";
        this.isFrightened = false;
        this.frightenedStartTime = 0;
        this.frightenedDuration = 10000; 
        this.blinkDuration = 2000; 
        this.piscarImediato = false;
        this.directions = [
            { x: 1, y: 0 },  
            { x: -1, y: 0 }, 
            { x: 0, y: 1 },  
            { x: 0, y: -1 }  
        ];

        this.currentDirection = this.directions[Math.floor(Math.random() * this.directions.length)];
        this.moveSpeed = 0;
    }

    move() {

        if (Math.abs(this.x - this.targetX) < this.moveSpeed && Math.abs(this.y - this.targetY) < this.moveSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.chooseNewDirection();
        } else {

            this.x += Math.sign(this.targetX - this.x) * this.moveSpeed;
            this.y += Math.sign(this.targetY - this.y) * this.moveSpeed;
        }
    }

    chooseNewDirection() {
        const possibleDirections = [
            this.currentDirection,
            { x: this.currentDirection.y, y: -this.currentDirection.x },  
            { x: -this.currentDirection.y, y: this.currentDirection.x },  
            { x: -this.currentDirection.x, y: -this.currentDirection.y }  
        ];

        for (let direcao of possibleDirections) {
            const newX = this.x + direcao.x * 50;
            const newY = this.y + direcao.y * 50;
            const mapCol = Math.floor(newX / 50);
            const mapRow = Math.floor(newY / 50);

            if (map[mapRow] && map[mapRow][mapCol] != '-' && map[mapRow] && map[mapRow][mapCol] != '0') {
                this.currentDirection = direcao;
                this.targetX = newX;
                this.targetY = newY;
                return;
            }
        }
    }

    draw() {
        const elapsedFrightenedTime = Date.now() - this.frightenedStartTime;
        const blinkInterval = 100; 

        if (this.isFrightened) {
            if (elapsedFrightenedTime < this.blinkDuration && this.piscarImediato) {
                if (Math.floor(elapsedFrightenedTime / blinkInterval) % 2 === 0) {
                    this.image.src = this.whiteImage;
                } else {
                    this.image.src = this.blueImage;
                }
            } else if (elapsedFrightenedTime < this.frightenedDuration - this.blinkDuration) {
                this.image.src = this.blueImage;
            } else {
                if (Math.floor(elapsedFrightenedTime / blinkInterval) % 2 === 0) {
                    this.image.src = this.whiteImage;
                } else {
                    this.image.src = this.blueImage;
                }
            }

            if (elapsedFrightenedTime > this.frightenedDuration) {
                this.isFrightened = false;
                this.image.src = this.normalImage;
            }
        } else {
            this.image.src = this.normalImage;
        }

        ctx.drawImage(this.image, this.x, this.y, 50, 50);
    }

    frightened() {
        this.isFrightened = true;
        this.piscarImediato = true;
        this.frightenedStartTime = Date.now();

        setTimeout(() => {
            this.piscarImediato = false;
        }, this.blinkDuration);
    }
}

class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.currentImageIndex = 0;
        this.pacmanImages = [];

        this.loadPacmanImages();
    }

    loadPacmanImages() {
        const pacmanImage1 = new Image();
        pacmanImage1.src = "images/pac0.png";

        const pacmanImage2 = new Image();
        pacmanImage2.src = "images/pac1.png";

        const pacmanImage3 = new Image();
        pacmanImage3.src = "images/pac2.png";

        const pacmanImage4 = new Image();
        pacmanImage4.src = "images/pac1.png";

        this.pacmanImages = [
            pacmanImage1,
            pacmanImage2,
            pacmanImage3,
            pacmanImage4
        ];
    }

    draw() {
        ctx.drawImage(this.pacmanImages[this.currentImageIndex], this.x, this.y, 50, 50);
    }

    updateImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.pacmanImages.length;
    }
}

let pacmanPosition = { linha: 8, coluna: 10 }; 
let pacman = new Pacman(pacmanPosition.coluna * 50, pacmanPosition.linha * 50); 

window.addEventListener("keydown", function(event) {
    var tecla = event.keyCode;
    let novaLinha = pacmanPosition.linha;
    let novaColuna = pacmanPosition.coluna;
    
    if (tecla == 39) { 
        novaColuna++;
    }
    if (tecla == 37) { 
        novaColuna--;
    }
    if (tecla == 38) { 
        novaLinha--;
    }
    if (tecla == 40) {
        novaLinha++;
    }

    if (map[novaLinha][novaColuna] != '-' && map[novaLinha][novaColuna] != '0') {
        pacmanPosition.linha = novaLinha;
        pacmanPosition.coluna = novaColuna;
        pacman.x = pacmanPosition.coluna * 50; 
        pacman.y = pacmanPosition.linha * 50; 

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        desenharLimites();
        desenharPontos();
        desenharFantasmas();
        pacman.draw(); 
    }
});

class Limite {
    static width = 50;
    static height = 50;

    constructor({ position }) {
        this.position = position;
        this.width = 50;
        this.height = 50;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Ponto {
    static normalRadius = 5;
    static largeRadius = 10;

    constructor({ position, isLarge = false }) {
        this.position = position;
        this.isLarge = isLarge;
        this.radius = isLarge ? Ponto.largeRadius : Ponto.normalRadius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x + 25, this.position.y + 25, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

const map = [
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', '-'],
    ['-', '2', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-'],
    ['-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', '2', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', '-', '-'],
    ['0', '0', '0', '0', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', '0', '0', '0', '0'],
    ['-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '0', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', '0', '0', '0', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['-', '-', '-', '-', '-', ' ', '-', ' ', '-', '0', '0', '0', '-', ' ', '-', ' ', '-', '-', '-', '-', '-'],
    ['0', '0', '0', '0', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', '0', '0', '0', '0'],
    ['-', '-', '-', '-', '-', ' ', ' ', ' ', '-', '-', '-', '-', '-', ' ', ' ', ' ', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-'],
    ['-', ' ', ' ', '2', '-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-'],
    ['-', '-', ' ', ' ', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', ' ', ' ', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', '-', '-', '2', '-'],
    ['-', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
];

const pacmanInitialPosition = { linha: 8, coluna: 10 };

let limites = [];
let pontos = [];
let fantasmas = [];

function desenharLimites() {
    for (let linha = 0; linha < map.length; linha++) {
        for (let coluna = 0; coluna < map[linha].length; coluna++) {
            if (map[linha][coluna] === '-') {
                const position = { x: coluna * 50, y: linha * 50 };
                const limite = new Limite({ position });
                limites.push(limite);
                limite.draw();
            }
        }
    }
}

function desenharPontos() {
    for (let ponto of pontos) {
        ponto.draw();
    }
}

function desenharFantasmas() {
    for (let fantasma of fantasmas) {
        fantasma.draw();
    }
}

function verificarColisaoPacManPonto() {
    pontos = pontos.filter(ponto => {
        const distX = pacman.x - ponto.position.x;
        const distY = pacman.y - ponto.position.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance <= 25 + ponto.radius) {
            if (ponto.isLarge) {
                pontuacao += 10; 
                fantasmas.forEach(fantasma => fantasma.frightened());
            } else {
                pontuacao += 5; 
            }
            return false;
        }
        return true;
    });
}


function desenharPontuacao() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Pontuação: ' + pontuacao, 2000, 250); 
}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharLimites();
    desenharPontos();
    pacman.draw();
    pacman.updateImage();
    verificarColisaoPacManPonto();
    verificarColisaoPacManFantasma();
    fantasmas.forEach(fantasma => {
        fantasma.move();
        fantasma.draw();
    });
    desenharPontuacao();
    requestAnimationFrame(animate);
}


function verificarColisaoPacManFantasma() {
    fantasmas = fantasmas.filter(fantasma => {
        const distX = pacman.x - fantasma.x;
        const distY = pacman.y - fantasma.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance <= 25 + 25) { 
            if (fantasma.isFrightened) {
                pontuacao += 20; 
                return false; 
            } else {

                vidas--;
                if (vidas === 0) {
                    alert("Game Over! Pontuação final: " + pontuacao);
                    location.reload(); 
                } else {
                    pacmanPosition = { linha: 8, coluna: 10 };
                    pacman.x = pacmanPosition.coluna * 50;
                    pacman.y = pacmanPosition.linha * 50;
                }
            }
        }
        return true;
    });
}




function iniciarJogo() {
    limites.length = 0;
    pontos.length = 0;
    fantasmas.length = 0;
    vidas = 5;

    map.forEach((row, linha) => {
        row.forEach((symbol, coluna) => {
            const position = { x: Limite.width * coluna, y: Limite.height * linha };
            if (symbol === '-') {
                const limite = new Limite({ position });
                limites.push(limite);
            } else if (symbol != '-' && symbol != '0') {
                const isLarge = symbol === '2';
                const ponto = new Ponto({ position, isLarge });
                pontos.push(ponto);
            }
            if (symbol === '1') {
                const fantasma = new Fantasma(position.x, position.y);
                fantasmas.push(fantasma);
            }
        });
    });

    desenharLimites();
    desenharPontos();
    desenharFantasmas();
    pacman.draw();
    desenharVidas();
}




iniciarJogo();
animate();
