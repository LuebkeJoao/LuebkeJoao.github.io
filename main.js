var game = new Phaser.Game("100", "100", Phaser.CANVAS, null, {
    preload: preload,
    create: create,
    update: update
});

var layer1;
var layer2;
var layer3;
var layer4;
var passagens = 1;
var passou = false;


function preload() {
    game.load.spritesheet('player', './jogador.png', 50, 37);
    game.load.image('tileset', './inferno/tileset.png');
    game.load.tilemap('inferno', './inferno/hell.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('inimigo', './skeleton.png', 44, 52);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    map = game.add.tilemap('inferno');
    map.addTilesetImage('tileset', 'tileset');
    map.setCollisionBetween(0, 999, true, 'lava');
    map.setCollisionBetween(0, 999, true, 'colisao');

    layer2 = map.createLayer('chao');
    layer1 = map.createLayer('lava');
    layer4 = map.createLayer('semColisao');
    layer3 = map.createLayer('colisao');

    layer1.setScale(2);
    layer2.setScale(2);
    layer3.setScale(2);
    layer4.setScale(2);

    layer1.resizeWorld();
    layer2.resizeWorld();
    layer3.resizeWorld();
    layer4.resizeWorld();

    spawnarInimigos();

    player = game.add.sprite(game.world.width * 0.5, game.world.height * 0.5, 'player');
    player.frame = 1;
    player.animations.add('walking', [9, 10, 11, 12, 13], true);
    player.animations.add('attacking', [49, 50, 51, 52, 53, 54, 55, 56]), true;
    player.animations.add('death', [64, 65, 66]), true;
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(1.5);
    player.health = 100;
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.immovable = true;

    game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

    game.time.events.loop(Phaser.Timer.SECOND * 2, contadorDeDano, this);

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    game.physics.arcade.collide(player, layer1);
    game.physics.arcade.collide(player, layer2);
    game.physics.arcade.collide(player, layer3);
    game.physics.arcade.collide(enemies, layer1);
    game.physics.arcade.collide(enemies, layer2);
    game.physics.arcade.collide(enemies, layer3);

    playerAndar();
    playerAtacar();
    inimigosSeguirPlayer();
    checarVitalidade();
    miniMap();
}

var posX = [100, 425, 600, 730, 1430, 2170, 1470, 500, 1730, 970];
var posY = [200, 425, 670, 470, 260, 600, 1080, 1030, 630, 1050];
var enemy;

function spawnarInimigos() {
    enemies = game.add.physicsGroup();
    game.physics.enable(enemies, Phaser.Physics.ARCADE);

    for (var i = 0; i < 30; i++) {
        enemy = enemies.create(game.world.randomX, game.world.randomY, 'inimigo');
        enemy.anchor.setTo(0.5, 0.5);
        enemy.scale.setTo(1.5);
        enemy.frame = 1;
        enemy.animations.add('walking', [0, 1, 2, 3, 4, 5, 6, 7], true);
        enemy.animations.add('attacking', [0, 5], false);
        enemy.health = 100;
    }
}

var skeletons = new Array();

function inimigosSeguirPlayer() {
    passagens++

    for (let i = 0; i < 30; i++) {
        skeletons[i] = enemies.children[i];

        if (Phaser.Math.distance(skeletons[i].position.x, skeletons[i].position.y, player.position.x, player.position.y) < 200 && skeletons[i].alive && player.alive) {
            game.physics.arcade.moveToObject(skeletons[i], player, 150, 0);
            if (Phaser.Math.distance(skeletons[i].position.x, skeletons[i].position.y, player.position.x, player.position.y) <= 65) {
                skeletons[i].body.velocity.set(0, 0);
            }
        } else {
            if (skeletons.length == 30 && !passou) {
                for (let l = 0; l < skeletons.length; l++) {
                    skeletons[l].body.velocity.set(game.rnd.integerInRange(-50, 50), 0);
                }
                passou = !passou
            }

            if (passagens >= 100) {
                passou = !passou;
                passagens = 0;
            }

        }

        if (skeletons[i].body.velocity.x > 0 && skeletons[i].alive) {
            skeletons[i].angle = 180;
            skeletons[i].scale.y = -1.5;
            skeletons[i].animations.play('walking', 10);
        } else if (skeletons[i].body.velocity.x < 0 && skeletons[i].alive) {
            skeletons[i].angle = 0;
            skeletons[i].scale.y = 1.5;
            skeletons[i].animations.play('walking', 10);
        } else if (skeletons[i].body.velocity.x == 0 && Phaser.Math.distance(skeletons[i].position.x, skeletons[i].position.y, player.position.x, player.position.y) > 65 && skeletons[i].alive) {
            skeletons[i].animations.stop('walking');
            skeletons[i].frame = 1;
        }
    }
}

function contadorDeDano() {
    skeletons.forEach(skeleton => {
        if (Phaser.Math.distance(skeleton.position.x, skeleton.position.y, player.position.x, player.position.y) <= 65 && skeleton.alive && player.alive) {
            player.damage(20);
            skeleton.animations.play('attacking', 2);
        }
    });
}

var vivo = true;

function checarVitalidade() {
    var healthBar = document.querySelector('#healthbar');
    healthBarSize = player.health;
    healthBar.style.width = `${healthBarSize}%`;

    if (!player.alive && vivo) {
        player.exists = true
        die = player.animations.play('death', 2)
        die.onComplete.addOnce(function () {
            player.exists = false;
            vivo = false;
        }, this);
    }
}

function playerAndar() {
    teclaW = game.input.keyboard.addKey(Phaser.Keyboard.W);
    teclaA = game.input.keyboard.addKey(Phaser.Keyboard.A);
    teclaS = game.input.keyboard.addKey(Phaser.Keyboard.S);
    teclaD = game.input.keyboard.addKey(Phaser.Keyboard.D);

    player.body.velocity.set(0, 0);

    if (teclaW.isDown && player.alive) {
        player.body.velocity.y = - 200;
        player.animations.play('walking', 15);
    }
    else if (teclaS.isDown && player.alive) {
        player.body.velocity.y = + 200;
        player.animations.play('walking', 15);
    }
    
    if (teclaA.isDown && player.alive) {
        player.body.velocity.x = - 200;
        player.animations.play('walking', 15);
        player.angle = 180;
        player.scale.y = -1.7;
    }
    else if (teclaD.isDown && player.alive) {
        player.body.velocity.x = + 200;
        player.animations.play('walking', 15);
        player.angle = 0;
        player.scale.y = 1.7;
    }

    if (!teclaW.isDown && !teclaA.isDown && !teclaS.isDown && !teclaD.isDown && player.frame >= 9 && player.frame <= 13 && player.alive) {
        player.animations.stop('walking');
        player.frame = 1;
    }
}
function playerAtacar() {
    if (cursors.up.isDown && player.body.velocity.x == 0 && player.body.velocity.y == 0 && player.alive) {
        player.animations.play('attacking', 10);
        player.angle = 0;
        player.scale.y = 1.7;
    }
    else if (cursors.down.isDown && player.body.velocity.x == 0 && player.body.velocity.y == 0 && player.alive) {
        player.animations.play('attacking', 10);
        player.angle = 180;
        player.scale.y = -1.7;
    }

    if (cursors.left.isDown && player.body.velocity.x == 0 && player.body.velocity.y == 0 && player.alive) {
        player.animations.play('attacking', 10);
        player.angle = 180;
        player.scale.y = -1.7;
    }
    else if (cursors.right.isDown && player.body.velocity.x == 0 && player.body.velocity.y == 0 && player.alive) {
        player.animations.play('attacking', 10);
        player.angle = 0;
        player.scale.y = 1.7;
    }

    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown && player.frame >= 49 && player.frame <= 56 && player.alive) {
        player.animations.stop('attacking');
        player.frame = 1;
    }

    skeletons.forEach(skeleton => {
        var distancia = Phaser.Math.distance(skeleton.position.x, skeleton.position.y, player.position.x, player.position.y);
        if (player.body.velocity.x == 0 && player.body.velocity.y == 0 && cursors.right.isDown && distancia <= 65 && skeleton.angle == 0 && player.alive) {
            skeleton.damage(1);
        } else if (player.body.velocity.x == 0 && player.body.velocity.y == 0 && cursors.left.isDown && distancia <= 65 && skeleton.scale.y == -1.5 && player.alive) {
            skeleton.damage(1);
        }
    });
}

function miniMap() {
    var posX = player.position.x / 32;
    var posY = player.position.y / 20;
    var miniPlayer = document.querySelector('#miniPlayer');
    miniPlayer.style.left = `${posX}px`;
    miniPlayer.style.top = `${posY}px`;
}
