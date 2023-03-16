class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createElement("h2");
    this.leadeboardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.leftKeyActive = false;
    this.playerMoving = false;
  }
  //BP
  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  //BP
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  // AM
  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    Resetbutton = createSprite(window / 2 + 100);

    cars = [car1, car2];
    
    fuels = new Group()
  
    powerCoins = new Group()

    obstacles = new Group()

    var obstaclesPositions = [
      {x:width / 2 + 250, y:height - 800, image:obstacle2img},
      {x:width / 2 - 150, y:height - 1300, image:obstacle1img},
      {x:width / 2 + 250, y:height - 1800, image:obstacle1img},
      {x:width / 2 - 180, y:height - 2300, image:obstacle2img},
      {x:width / 2 , y:height - 2800, image:obstacle2img},
      {x:width / 2 - 180, y:height - 3300, image:obstacle1img},
      {x:width / 2 + 180, y:height - 3300, image:obstacle2img},
      {x:width / 2 + 250, y:height - 3800, image:obstacle2img},
      {x:width / 2 - 150, y:height - 4300, image:obstacle1img},
      {x:width / 2 + 250, y:height - 4800, image:obstacle2img},
      {x:width / 2 , y:height - 5300, image:obstacle1img},
      {x:width / 2 - 180, y:height - 5500, image:obstacle2img}
    ];

    this.addSprites(fuels,6,fuelImage,0.02);
    this.addSprites(powerCoins,21,powerCoinImage,0.09);

    this.addSprites(obstacles,obstaclesPositions.length,obstacle1img,0.04,obstaclesPositions);
    

  }

  addSprites(spriteGroup,numberOfSprites,spriteImage,scale,positions = []){
      for(var i = 0; i < numberOfSprites; i++){
        var x,y;
        x = random(width / 2 + 150,width / 2 - 150);
        y = random(-height * 4.5,height - 400);

        var sprite = createSprite(x,y);
        sprite.addImage("sprite",spriteImage);

        sprite.scale = scale;

        spriteGroup.add(sprite);

      }
  }




  //BP
  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar juego"); 
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40); 

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100); 

    this.leadeboardTitle.html("Tabla de puntuación"); 
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40); 

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80); 

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);


  }

  // AA
  play() {
    this.handleElements();

    const finishLine = height * 6 - 100;

    Player.getPlayersInfo(); // Agregado

    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      // indice del arreglo
      var index = 0;
      for (var plr in allPlayers) {
        // Usa datos de la base de datos para mostrar los autos en dirección x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index].position.x = x;
        cars[index].position.y = y;

        // Agrega 1 al índice en cada ciclo
        index = index + 1;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleObstacleCollision(index);

          camera.position.y = cars[index-1].position.y;
          camera.position.x = width/2;
        }

        if(player.positionY > finishLine){
          gameState = 2;
          player.rank += 1;
          player.updateCarsAtEnd(player.rank);
          player.update();
          this.showRank;
        }

      }
      
      this.handlePlayerControls();

      drawSprites();
    }
  }

  handleFuel(index){
    cars[index - 1].overlap(fuels,function(collector,collected){
        player.fuel = 185;
        collected.remove();

    });
  }

  handlePowerCoins(index){
    cars[index - 1].overlap(powerCoins,function(collector,collected){
      player.score += 20;
      player.update();
      collected.remove();
    })
  }

  handleObstacleCollision(index){
    if(cars[index-1].collide(obstacles)){
      if(this.leftKeyActive){
        player.positionX += 100;
      }else{
        player.positionX -= 100;
      }
      if(player.life > 0){
        player.life -= 185/4;
      }
      player.update()
    }
  }

  handleResetButton(){
    this.resetButton.mousePressed(() =>{
      database.ref("/").set({
        carsAtEnd: 0,
        playerCount: 0, 
        gameState: 0,
        players: {}
      });
      window.location.reload();
    });
  }

  handlePlayerControls(){

      if (keyIsDown(UP_ARROW)) {
        this.playerMoving = true;
        player.positionY += 10;
        player.update();
      }

      if (keyIsDown(LEFT_ARROW) && player.positionX > width/3 - 50) {
        this.leftKeyActive = true;
     player.positionX -= 5;
     player.update();
       }

       if (keyIsDown(RIGHT_ARROW) && player.positionX < width/2 +300) {
        this.leftKeyActive = false;
        player.positionX += 5;
        player.update();
          }
  }
    showLeaderboard(){
      var leader1, leader2;
      var players = Object.values(allPlayers);
      if((players[0].rank === 0 && players[1].rank === 0)|| players[0].rank === 1){
        leader1 =
        player[0].rank + 
        "&emsp;" + 
        players[0].name +
        "&emsp;" +
        players[0].score;

        leader2 =
        player[1].rank + 
        "&emsp;" + 
        players[1].name +
        "&emsp;" +
        players[1].score;
      }
      if(player[1].rank === 1){
        
        leader1 =
        player[1].rank + 
        "&emsp;" + 
        players[1].name +
        "&emsp;" +
        players[1].score;

        leader2 =
        player[0].rank + 
        "&emsp;" + 
        players[0].name +
        "&emsp;" +
        players[0].score;
      }
      this.leader1.html(leader1);
      this.leader2.html(leader2);

    }

    showRank(){
      swal({
        title:`Bien hecho ${"\n"}posición ${"\n"} ${player.rank}`,
        text:"ganaste",
        imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imageSize : "100 x 100",
        confirmButtonText: "ok"
      });
    }

    gameOver(){
      swal({
        title:`fin del juego`,
        text: "perdiste",
        imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
        imageSize: "100 x 100",
        confirmButtonText: "lo intentaste"
      })
    }

    showLife(){
      push();
      image(liveimg,width/2-130,height-player.positionY-550,20,20);
      fill("white");
      rect(width/2-100,height-player.positionY-550,185,20);
      fill("black");
      rect(width/2-100,height-player.positionY-550,player.life,20);
      noStroke();
      pop();
    }
    
    showFuelBar(){
      push();
      image(fuelImage,width/2-130,height-player.positionY-100,20,20);
      fill("white");
      rect(width/2-100,height-player.positionY-100,185,20);
      fill("black");
      rect(width/2-100,height-player.positionY-550,player.fuel,20);
      noStroke();
      pop();
    }

}