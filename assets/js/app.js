/* -----------------------------

            VARIABLES

 -----------------------------   */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Elements HTML
var home = document.querySelector('#home');
var game = document.querySelector('#game');
var startBtn = document.querySelector('#start');

var unit = 20; // Unite du jeu (en pixel)

var width = 15; // in unit
var height = 20; // in unit


var move = 'none'; // Correspond au movement defini par les touches directionnelles

var pause = false;

var score;
var boost = false;
var speed = 500;
var boostSpeed = 45;
var animation;
var map = []; // Contient les blocks qui seront positionnes

var collision = 'none';

limitThickness = 2; // In pixel

var container; // Contient le block courant (qui est en mouvement)

// Structure d'un container (block tetris)
function Container (){
    this.position = {x : Math.floor(width / 2), y : 0}; // Positionne le block au milieu
    this.blocks = getRandomBlocks();
    this.color = "#000";
    this.moving = true;
}

// Modèles de blocks tetris
var containerModels = [
    [
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ]
];

// Modèle de block vide
var copy = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

// Taille de la canvas
windowWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

windowHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

// Taille de la zone de jeu
gameWidth = (width + 2) * unit;
gameHeight = (height + 2) * unit;

gameOffsetX = (windowWidth - gameWidth)/2; // Centrer le jeu (decalage horizontal)
gameOffsetY = 170; // Decalage vertical

// Boutons
var buttons = {
  back : {
      x : 20,
      y : 20,
      text : 'Back',
      width : 100,
      height : 40
  },  
  pause : {
      x : windowWidth - 320,
      y : 20,
      text : 'Pause',
      width : 120,
      height : 40
  },  
  reset : {
      x : windowWidth - 170,
      y : 20,
      text : 'Reset',
      width : 120,
      height : 40
  },  
};



/* -----------------------------

       INITIATLISATION

 -----------------------------   */

function initCanvas() {
    canvas.width = windowWidth;
    canvas.height = windowHeight;
}

function init() {
    
    score = 0;
    clearInterval(animation);
    
    initMap(); // Initialisation de la map

    // Definit une couleur de fond
    setFillStyle('#df4c41');
    ctx.fillRect(gameOffsetX, gameOffsetY, gameWidth, gameHeight);
    
    clear(); // Efface le fond
    
    
    // Lance le jeu
    generateContainer();
    drawElements();
    animation = setInterval(loop, speed);
    
    setStatus('Jeu en cours'); // Infos
}


/* -----------------------------

    FONCTIONS ELEMENTAIRES

 -----------------------------   */

// Efface la zone de jeu
function clear(){
    ctx.clearRect(gameOffsetX + unit, gameOffsetY, gameWidth - 2 * unit, gameHeight - unit);
}

// Renvoie un element aleatoire dans un tableau
function getRandomItem(array){
    return array[Math.floor(Math.random()*array.length)];
}

// Defini la couleur de remplissage
function setFillStyle(color){
    ctx.fillStyle = color;
}

/* -----------------------------

       FONCTIONS DE JEU

 -----------------------------   */

// Initailse la map
function initMap(){
    for(var i = 0; i < height; i++){
        map[i] = [];
        for(var j = 0; j < width; j++){
            map[i][j] = 0;
        }
    }
}

// Change le status du jeu
function setStatus(status){
    ctx.clearRect(windowWidth - 320, 65, 120, 30);
    ctx.font = "13px Montserrat";
    ctx.fillStyle = "#df4c41";
    ctx.textAlign = "center";
    ctx.fillText(status, windowWidth - 262, 85); 
}

// Renvoie un modèle tetris aleatoire
function getRandomBlocks(){
    return getRandomItem(containerModels);
}

// Genere et ajoute un nouveau block tetris
function generateContainer(){
    score++;
    container = new Container();
}

// Dessine les blocks tetris
function drawContainer(){
    ctx.fillStyle = container.color;
    
    if(container.moving == true){
        // Parcours les lignes
        for(var u = 0; u < container.blocks.length; u++){
            for(var k = 0; k < container.blocks[u].length; k++){
                var index = container.blocks[u][k];

                // Si j'ai un bloc à cet endroit precis
                if(index == 1){
                    ctx.fillRect(gameOffsetX + (container.position.x + k) * unit, gameOffsetY + (container.position.y + u) * unit, unit, unit);
                }
            }
        }
    }
}

// Met à jour la position du block courant
function updateContainer(collision){  
    if(move == 'right'){
        container.position.x += 1;
    }else if(move == 'left'){
        container.position.x -= 1;
    }else if(move == 'bottom'){
        container.position.y += 1;
    }else{
        container.position.y += 1;
    }
}

// Effectue la rotation d'un block
function rotate(container){
        
    // Deplace les blocks dans un tableau de copie
    for(var k = 0; k < container.blocks.length; k++){
        for(var u = 0; u < container.blocks[k].length; u++){
            
            copy[3 - u][k] = container.blocks[k][u];
        }
    }
    
    // Verifie qu il n y a pas de collision avec les blocks deja poses
    for(var k = 0; k < container.blocks.length; k++){
        for(var u = 0; u < container.blocks[k].length; u++){
            
            var x = container.position.x + u;
            var y = container.position.y + k;
            
            if(copy[k][u] == 1 && map[y][x-1] == 1){
                return true;
            }
        }
    }
    
    // Verifie si la rotation est possible (a cause des murs)
    for(var k = 0; k < container.blocks.length; k++){
        for(var u = 0; u < container.blocks[k].length; u++){
            var x = container.position.x + u;
            var y = container.position.y + k;
            if(x <= 0 || x >= (width+1)){
                return true;
            }
        }
    }
            
    // Met à jour le tableau grâce à la copie
    for(var k = 0; k < container.blocks.length; k++){
        for(var u = 0; u < container.blocks[k].length; u++){
            container.blocks[k][u] = copy[k][u];
        }
    }
}

// Change de page
function switchPage(page){
    if(page == 'home'){
        home.style.display = 'block';
        game.style.display = 'none';
    }else if(page == 'game'){
        home.style.display = 'none';
        game.style.display = 'block';  
    }
}

//Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

//Function to check whether a point is inside a rectangle
function isInside(pos, button){
    return pos.x > button.x && pos.x < button.x+button.width && pos.y < button.y+button.height && pos.y > button.y;
}

// Dessine un bouton
function drawButton(x, y, width, height, text) {
    var radius = 22;
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.strokeStyle = "#DF4C41";
    ctx.fillStyle = "#DF4C41";
    ctx.fill();
    ctx.stroke();
    
    ctx.font = "15px Montserrat";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(text, x + width/2, y + 25); 
}

// Affiche les boutons
function drawButtons(){
    for(var button in buttons){
        var x = buttons[button].x;
        var y = buttons[button].y;
        var text = buttons[button].text;
        var width = buttons[button].width;
        var height = buttons[button].height;
        drawButton(x, y, width, height, text);
    }
}

// Definit la vitesse de rafraichissement du jeu
function setGameSpeed(speed){
    clearInterval(animation);
    animation = setInterval(loop, speed);
}

// Definit l activation du boost de rapidite
function setBoost(activate){
    clearInterval(animation);
    if(activate){
        boost = true;
        setGameSpeed(boostSpeed);
    }else{
        boost = false;
        setGameSpeed(speed);
    }
}

// Dessine la limite (en haut du jeu)
function drawLimit(){
    ctx.beginPath();
    ctx.setLineDash([10]);
    ctx.moveTo(gameOffsetX + unit, gameOffsetY + limitThickness);
    ctx.lineTo(gameOffsetX + unit * (width + 1), gameOffsetY + limitThickness);
    ctx.lineWidth = limitThickness;
    ctx.strokeStyle = "#afafaf";
    ctx.stroke();
}

// Dessine les elements
function drawElements(){
    clear();
    drawContainer();
    drawMap();
    drawLimit();
}

// Verifie qu une ligne horizontale est complete
function checkLines(){
    for(var i = 0; i < height; i++){
        var total = 0;
        for(var j = 0; j < width; j++){
            if(map[i][j] == 1){
                total++;
            }
        }
        
        // Si une ligne est faite
        if(total == width){
            var line = i;
            for(var u = 1; u < line; u++){
                for(var k = 0; k < width; k++){
                    map[u+1][k] = map[u][k];
                }
            }
        }
    }
}

// Revoie le cote dans lequel on se cogne (renvoie none si il n y a pas de collision)
function checkCollision(container){
    // Verifie si on touche le sol OU un block dans la map
    for(var i = 0; i < container.blocks.length; i++){
        for(var j = 0; j < container.blocks[i].length; j++){
            if(container.blocks[i][j] == 1){
                var x = container.position.x + j;
                var y = container.position.y + i;
                
                
                if(y == height){
                    return 'bottom';
                }
            
                for(var k = 0; k < height; k++){
                    for(var l = 0; l < width; l++){
                        if(y == k && x == (l+1) && map[k][l] == 1 && (move == 'none' || move == 'bottom')){
                            return 'bottom';
                        }
                    }
                }

            }
        }
    }
    
    // Verifie si on touche un cote (de mur OU de la map)
    for(var i = 0; i < container.blocks.length; i++){
        for(var j = 0; j < container.blocks[i].length; j++){
            if(container.blocks[i][j] == 1){
                var x = container.position.x + j;
                var y = container.position.y + i;
                
                for(var k = 0; k < height; k++){
                    for(var l = 0; l < width; l++){

                    
                        if(y == k && x == l && map[k][l] == 1 && move == 'right'){
                            return 'right';
                        }else if(y == k && x == (l+2) && map[k][l] == 1 && move == 'left'){
                            return 'left';
                        }
                    }
                }

                // Si le bloc est a cote d'un obstacle
                if(x == 1){
                    return 'left';
                }else if(x == width){
                    return 'right';
                }

            }
        }
    }
    return 'none';
}

// Dessine la map (blocks positionnes)
function drawMap(){
    for(var i = 0; i < height; i++){
        for(var j = 0; j < width; j++){

            // Si j'ai un bloc à cet endroit precis
            if(map[i][j] == 1){
                ctx.fillRect(gameOffsetX + (j + 1) * unit, gameOffsetY + (i + 1) * unit, unit, unit);
            }
        }
    }
}

// Verifie si le joueur a perdu
function checkLose(container){
    for(var i = 0; i < container.blocks.length; i++){
        for(var j = 0; j < container.blocks[i].length; j++){
            if(container.blocks[i][j] == 1){
                var x = container.position.x + j;
                var y = container.position.y + i;
                
                
            
                for(var l = 0; l < width; l++){
                    if(x == (l+1) && map[1][l] == 1){
                        return true;
                    }
                }

            }
        }
    }
    return false;
}

// A executer lorsque le joueur perd
function lose(){
    clearInterval(animation);
    alert('Vous avez perdu ! Vous avez fait un score de : '+score);
    var newGame = prompt('Voulez-vous rejouer ? (oui ou non)');
    if(newGame == 'oui'){
       init();
    }else{
        switchPage('home');
    }
}

// Execute une pause (ou reprend le jeu)
function togglePause(){
    if(pause == false){
        pause = true;
        setStatus('Jeu en pause');
        clearInterval(animation);
    }else{
        pause = false;
        setStatus('Jeu en cours');
        setGameSpeed(speed);
    }
}


/* -----------------------------

             LOOP

 -----------------------------   */


function loop(){
    checkLines();

    // Recupère s il y a une collision
    collision = checkCollision(container);

    
    // Traitement de l information de la collision laterale
    if((move == 'right' && collision == 'right') || (move == 'left' && collision == 'left')){ // S il y a une collision, on arrete de se deplacer horizontalement et on change le boost en mode normal
        move = 'none';
        boost = false;
        setGameSpeed(speed);
    }
    
    // Traitement de l information de la collision verticale
    if(collision == 'bottom'){ // Si le block courant touche le sol
        container.moving = false;
    }

    
    // Si le block courant n est plus en mouvement, on creait un nouveau block
    if(container.moving == false){
        
        for(var i = 0; i < container.blocks.length; i++){
            for(var j = 0; j < container.blocks[i].length; j++){
                if(container.blocks[i][j] == 1){
                    var x = container.position.x + j;
                    var y = container.position.y + i;

                    if(map[y-1]){
                        map[y-1][x-1] = 1;
                    }
                }
            }
        }
        
        generateContainer();
    }
    
    for(var i = 0; i < container.blocks.length; i++){
        for(var j = 0; j < container.blocks[i].length; j++){
            
            if(container.blocks[i][j] == 1){
                var x = container.position.x + j;
                var y = container.position.y + i;
            }
        }
    }
    
    // On met à jour la position des blocks puis on les affiche
    updateContainer(collision);
    
    drawElements();
    
    if(checkLose(container)){
        lose();
    }
}


/* -----------------------------

            EVENEMENTS

 -----------------------------   */


// Detection des boutons directionnels (à l'appui)
addEventListener("keydown",function(e){
    var key = e.keyCode;
    
    if(key == 80){
        togglePause();
    }
    
    if(pause == false){

        collision = checkCollision(container);

        if(key == 37 && collision != 'left'){ // si la direction est differente de la precedente
            move = 'left';
            setBoost(true);
        }else if(key == 38){
            move = 'top';
            clearInterval(animation); 
            rotate(container);
            drawElements();
        }else if(key == 39 && collision != 'right'){
            move = 'right';
            setBoost(true);
        }else if(key == 40){
            move = 'bottom';
            if(boost == false){
                setBoost(true);
            }
        }
        
    }
}, false);

// Detection des boutons directionnels (au lache)
addEventListener("keyup",function(e){
    if(pause == false){
        move = 'none';
        setBoost(false);
    }
}, false);

// Clic sur le bouton de la page d accueil
startBtn.addEventListener('click', function(){
    home.style.display = 'none';
    game.style.display = 'block';
    
    initCanvas();
    drawButtons();
    init();
});

// Clic sur les boutons
canvas.addEventListener('click', function(evt) {
    var mousePosition = getMousePos(canvas, evt);

    if (isInside(mousePosition, buttons.back)) {
        switchPage('home');
    }else if(isInside(mousePosition, buttons.pause)) {
        console.log('pause');
        togglePause();
    }else if(isInside(mousePosition, buttons.reset)) {
        init();
    }
    
}, false);



