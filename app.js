/* -----------------------------

            VARIABLES

 -----------------------------   */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var unit = 20; // Unite du jeu (en pixel)

var width = 15; // in unit
var height = 20; // in unit

var move = 'none'; // Correspond au movement defini par les touches directionnelles

var boost = false;
var speed = 500;
var boostSpeed = 45;
var animation;
var map = []; // Contient les blocks qui seront positionnes

var collision = 'none';

var container; // Contient le block courant (qui est en mouvement)

// Structure d'un container (block tetris)
function Container (){
    this.position = {x : Math.floor(width / 2), y : 0}; // Positionne le block au milieu
    this.blocks = getRandomBlocks();
    this.color = "#F00000";
    this.moving = true;
}

// Modèles de blocks tetris
var containerModels = [
    [
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
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


/* -----------------------------

       INITIATLISATION

 -----------------------------   */

function init() {
    canvas.width = (width + 2) * unit;
    canvas.height = (height + 2) * unit;
    
    // Initialisation de la map
    initMap();

    // Definit une couleur de fond
    setFillStyle('#f00');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clear(); // Efface le fond
    
    // Lance le jeu
    animation = setInterval(loop, speed);
    generateContainer();
}

init();


/* -----------------------------

    FONCTIONS ELEMENTAIRES

 -----------------------------   */

// Efface la zone de jeu
function clear(){
    ctx.clearRect(unit, 0, canvas.width - 2 * unit, canvas.height - unit);
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

// Renvoie un modèle tetris aleatoire
function getRandomBlocks(){
    return getRandomItem(containerModels);
}

// Genere et ajoute un nouveau block tetris
function generateContainer(){
    container = new Container();
}

// Dessine les blocks tetris
function drawContainer(){
    ctx.fillStyle = 'black';
    
    if(container.moving == true){
        // Parcours les lignes
        for(var u = 0; u < container.blocks.length; u++){
            for(var k = 0; k < container.blocks[u].length; k++){
                var index = container.blocks[u][k];

                // Si j'ai un bloc à cet endroit precis
                if(index == 1){
                    ctx.fillRect((container.position.x + k) * unit, (container.position.y + u) * unit, unit, unit);
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
    ctx.setLineDash([5]);
    ctx.moveTo(unit, unit);
    ctx.lineTo(unit * (width + 1), unit);
    ctx.stroke();
}

// Dessine les elements
function drawElements(){
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
        // A BEBUGGER
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
                ctx.fillRect((j + 1) * unit, (i + 1) * unit, unit, unit);
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
    alert('perdu !');
}


/* -----------------------------

             LOOP

 -----------------------------   */


function loop(){
    checkLines();

    // Recupère s'il y a une collision
    collision = checkCollision(container);

    
    // Traitement de l'information de la collision laterale
    if((move == 'right' && collision == 'right') || (move == 'left' && collision == 'left')){ // S'il y a une collision, on arrete de se deplacer horizontalement et on change le boost en mode normal
        move = 'none';
        boost = false;
        setGameSpeed(speed);
    }
    
    // Traitement de l information de la collision verticale
    if(collision == 'bottom'){ // Si le block courant touche le sol
        container.moving = false;
    }

    
    // Si le block courant n'est plus en mouvement, on creait un nouveau block
    if(container.moving == false){

        // CODE A DEBUGGER
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
    
    clear();
    drawElements();
    
    
    if(checkLose(container)){
        lose();
    }
}

/* -----------------------------

     BOUTONS DIRECTIONNELS

 -----------------------------   */


// Detection des boutons directionnels (à l'appui)
addEventListener("keydown",function(e){
    var key = e.keyCode;
    
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
}, false);

// Detection des boutons directionnels (au lache)
addEventListener("keyup",function(e){
    move = 'none';
    setBoost(false);
}, false);
