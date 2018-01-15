/* -----------------------------

            VARIABLES

 -----------------------------   */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var containers = []; // Contient tous les blocks tetris
var currentContainer = null;

var unit = 20; // Unité du jeu (en pixel)

var width = 15; // in unit
var height = 20; // in unit

var move = 'none'; // Correspond au movement défini par les touches directionnelles

var loopBeforeGenerating = 5; // Nombre de boucle avant de générer un nouveau block tetris
var currentLoopBeforeGenerating = loopBeforeGenerating;


var lateralStop = 'none';
var boost = false;
var speed = 500;
var boostSpeed = 45;
var animation;
var map = [];


// Structure d'un container (block tetris)
function Container (){
    this.position = {x : Math.floor(width / 2), y : 0};
    this.blocks = getRandomBlocks();
    this.color = "#F00000";
    this.moving = true;
}

// Modèles de blocks tetris
var containerModels = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [1, 0, 0, 0],
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
    //console.log(map);

    // Définit une couleur de fond
    setFillStyle('#ff2f2f');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clear();
    animation = setInterval(loop, speed);
}

init();

/* -----------------------------

    FONCTIONS ELEMENTAIRES

 -----------------------------   */

function initMap(){
    for(var i = 0; i < height; i++){
        map[i] = [];
        for(var j = 0; j < width; j++){
            map[i][j] = 0;
        }
    }
}

// Renvoie une valeur aléatoire dans un tableau
function getRandomItem(array){
    return array[Math.floor(Math.random()*array.length)];
}

// Renvoie un modèle tetris aléatoire
function getRandomBlocks(){
    return getRandomItem(containerModels);
}

// Défini la couleur de remplissage
function setFillStyle(color){
    ctx.fillStyle = color;
}

// Génére et ajoute un nouveau block tetris
function generateContainer(){
    var container = new Container();
    if(currentContainer == null){
        currentContainer = 0;
    }
    currentContainer++;
    containers.push(container);
}

// Dessine les blocks tetris
function drawContainers (){
    clear();
    ctx.fillStyle = 'black';
    
    // Parcours les containers
    for(var i = 0; i < containers.length; i++){
        var container = containers[i];
        if(container.moving == true){
            
            var blocks = containers[i].blocks;

            // Parcours les blocks
            for(var u = 0; u < blocks.length; u++){
                var row = blocks[u];

                // Parcours les lignes
                for(var k = 0; k < row.length; k++){
                    var index = row[k];

                    // Si j'ai un bloc à cet endroit précis
                    if(row[k] == 1){
                        ctx.fillRect((container.position.x + k) * unit, (container.position.y + u) * unit, unit, unit);
                    }
                }
            }
            
        }
    }
}

// Met à jour les blocks tetris
function updateContainers(){
    
    // Parcours les containers
    for(var i = 0; i < containers.length; i++){        
        if(move == 'right'){
            containers[i].position.x += 1;
        }else if(move == 'left'){
            containers[i].position.x -= 1;
        }else if(move == 'bottom'){
            containers[i].position.y += 1;
        }else{
            containers[i].position.y += 1;
        }
    }
}

// Effectue la rotation d'un block tetris
function rotate(blocks){
    // Deplace les blocks dans un tableau de copie
    for(var k = 0; k < blocks.length; k++){
        for(var u = 0; u < blocks[k].length; u++){
            copy[3 - u][k] = blocks[k][u];
        }
    }

    // Met à jour le tableau grâce à la copie
    for(var k = 0; k < blocks.length; k++){
        for(var u = 0; u < blocks[k].length; u++){
            blocks[k][u] = copy[k][u];
        }
    }
}

// Efface les blocks
function clear(){
    ctx.clearRect(unit, 0, canvas.width - 2 * unit, canvas.height - unit);
}

// Definit la vitesse de rafraichissement du jeu
function setGameSpeed(speed){
    clearInterval(animation);
    animation = setInterval(loop, speed);
}

// Définit l'activation du boost de rapidité
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

// Revoie le côté dans lequel on se cogne (renvoie none si il n'y a pas de collision)
function checkCollision(container){
    for(var i = 0; i < container.blocks.length; i++){
        for(var j = 0; j < container.blocks[i].length; j++){
            if(container.blocks[i][j] == 1){
                var x = container.position.x + j;
                var y = container.position.y + i;

                                 
                console.log('y: '+y);            
                if(y >= height){
                    return 'bottom';
                }
                
                for(var k = 0; k < height; k++){
                    for(var l = 0; l < width; l++){

                    
                        if(y == k && x == l && map[k][l] == 1 && (move == 'none' || move == 'bottom')){
                            return 'bottom';
                        }else if(y == k && x == (l-1) && map[k][l] == 1 && move == 'right'){
                            return 'right';
                        }else if(y == k && x == (l+1) && map[k][l] == 1 && move == 'left'){
                            return 'left';
                        }
                    }
                }

                
                // Si le bloc est a coté d'un obstacle
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

/* -----------------------------

             LOOP

 -----------------------------   */


generateContainer();


var collision = 'none';

function loop(){
    // Recupère s'il y a une collision
    collision = checkCollision(containers[containers.length-1]);
    //console.log(collision);
    
    // Traitement de l'information de la collision latérale
    if((move == 'right' && collision == 'right') || (move == 'left' && collision == 'left')){ // S'il y a une collision, on arrete de se déplacer horizontalement et on change le boost en mode normal
        move = 'none';
        boost = false;
        setGameSpeed(speed);
    }
    
    // Traitement de l'information de la collision verticale
    if(collision == 'bottom'){ // Si le block courant touche le sol
        containers[containers.length-1].moving = false;
    }
    


    
    // Si le block courant n'est plus en mouvement, on créait un nouveau block
    if(containers[containers.length-1].moving == false){

        // CODE A DEBUGGER
        container = containers[containers.length-1];
        for(var i = 0; i < container.blocks.length; i++){
            //console.log(map);
            for(var j = 0; j < container.blocks[i].length; j++){
                if(container.blocks[i][j] == 1){
                    var x = container.position.x + j;
                    var y = container.position.y + i;


                    if(map[y-1]){
                        map[y-1][x] = 1;
                    }
                }
            }
        }
        
        generateContainer();
    }
    
    // On met à jour la position des blocks puis on les affiche
    updateContainers();

    drawElements();
}

function drawElements(){
    drawContainers();
    drawMap();
}

function drawMap(){
    for(var i = 0; i < height; i++){
        for(var j = 0; j < width; j++){

            // Si j'ai un bloc à cet endroit précis
            if(map[i][j] == 1){
                ctx.fillRect(j * unit, (i + 1) * unit, unit, unit);
            }
        }
    }
}

/* -----------------------------

     BOUTONS DIRECTIONNELS

 -----------------------------   */


// Detection des boutons directionnels (à l'appui)
addEventListener("keydown",function(e){
    var key = e.keyCode;
    
    collision = checkCollision(containers[containers.length-1]);
    
    if(key == 37 && collision != 'left'){ // si la direction est différente de la précédente
        move = 'left';
        setBoost(true);    
    }else if(key == 38){
        move = 'top';
        clearInterval(animation); 
        rotate(containers[currentContainer-1].blocks);
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

// Detection des boutons directionnels (au lâché)
addEventListener("keyup",function(e){
    move = 'none';
    setBoost(false);
}, false);



