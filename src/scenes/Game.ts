import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  // variable & method definitions
  private player?: Phaser.GameObjects.Sprite
  private boxes: Phaser.GameObjects.Sprite[] = []
  private layer?: Phaser.Tilemaps.StaticTilemapLayer
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super('game')
  }

  // method run before the game has loaded
  preload() {
    // load the single spritesheet at run-time
    this.load.spritesheet('tiles', 'assets/sokoban_tilesheet.png', {
      frameWidth: 64,
      frameHeight: 64,
      startFrame: 0,
    })
  }

  // method run once after the game has loaded, but before the game starts
  create() {
    // define keyboard input
    this.cursors = this.input.keyboard.createCursorKeys()

    // the level
    // each number equates to the index position on the spritesheet
    const level = [
      [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      [100, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [100, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [100, 0, 0, 0, 51, 8, 0, 52, 0, 100],
      [100, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [100, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [100, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    ]

    // create the map from the level array
    const map = this.make.tilemap({
      data: level,
      tileWidth: 64,
      tileHeight: 64,
    })
    const tiles = map.addTilesetImage('tiles')

    // this.layer is now the spritesheet which has been divided into an array
    // each 64x64 tile has an index in that array
    // it is a single array, not 2d
    this.layer = map.createStaticLayer(0, tiles, 0, 0)

    // create the player sprite from the tile sheet
    this.player = this.layer
      .createFromTiles(52, 0, { key: 'tiles', frame: 52 })
      .pop()

    // center the player sprite in the middle of the tile
    this.player?.setOrigin(0)

    // use the extracted player animation method to create the animations
    this.createPlayerAnimations()

    // create the boxes, then map through all of the boxes to center each box sprite in the middle of the tile
    this.boxes = this.layer
      .createFromTiles(8, 0, { key: 'tiles', frame: 8 })
      .map(box => box.setOrigin(0))
  }

  // the game loop, repeatedly runs during run-time
  update() {
    // check for no cursor keys & return
    if (!this.cursors || !this.player) {
      return
    }

    // using the justDown method on each direction to prevent multiple presses in one movement
    const justLeft = Phaser.Input.Keyboard.JustDown(this.cursors.left!)
    const justRight = Phaser.Input.Keyboard.JustDown(this.cursors.right!)
    const justUp = Phaser.Input.Keyboard.JustDown(this.cursors.up!)
    const justDown = Phaser.Input.Keyboard.JustDown(this.cursors.down!)

    // determine which key has been pressed and associate the correct animation
    if (justLeft) {
      // see function definition for explanation
      this.tweenMovement(
        this.player.x - 32,
        this.player.y + 32,
        {
          x: '-=64',
        },
        'left'
      )
    } else if (justRight) {
      this.tweenMovement(
        this.player.x + 96,
        this.player.y + 32,
        {
          x: '+=64',
        },
        'right'
      )
    } else if (justUp) {
      this.tweenMovement(
        this.player.x + 32,
        this.player.y - 32,
        {
          y: '-=64',
        },
        'up'
      )
    } else if (justDown) {
      this.tweenMovement(
        this.player.x + 32,
        this.player.y + 96,
        {
          y: '+=64',
        },
        'down'
      )
    }
  }

  // checks to see if there is a box in the direction of movement, if not just moves the player
  // if there is a box moves both the player and the box together
  // passing a string to the onStart method to play the correct animation
  // param 1 & 2 : the adjusted x & y coordinates. These allow for the fact that the origin of the player is the center of the tile and not the 0, 0 corner
  // we want to check that the coordinates that we are checking allow for the 32px (50% of tile dimension)
  // param 3 : the tween value (amount that the tile will move in pixels)
  // param 4 : a string representing the cursor key direction
  private tweenMovement(
    x: number,
    y: number,
    tweenValue: any,
    direction: string
  ) {
    // checks to see if player is already moving, and if so does nothing
    if (this.tweens.isTweening(this.player!)) {
      return
    }
    // checks for walls, and if found do nothing (no movement)
    if (this.hasWallAt(x, y)) {
      return
    }

    // look for a box at the x, y location
    const box = this.getBoxAt(x, y)

    // if there is a box present, move the box by the tweenValue
    if (box) {
      this.tweens.add(
        Object.assign({}, tweenValue, {
          targets: box,
          duration: 500,
        })
      )
    }

    // move the player according to the tweenValue, and play the correct animation based on direction value
    this.tweens.add(
      Object.assign({}, tweenValue, {
        targets: this.player,
        duration: 500,
        onComplete: this.stopPlayerAnimation,
        onCompleteScope: this,
        onStart: () => this.player?.anims.play(direction, true),
      })
    )
  }

  // stop the animation
  private stopPlayerAnimation() {
    if (!this.player) {
      return
    }

    const key = this.player?.anims.currentAnim?.key
    if (!key.startsWith('idle-')) {
      this.player.anims.play(`idle-${key}`, true)
    }
  }

  // returns a boolean on whether a defined x & y coordinate has a wall tile (index 100)
  private hasWallAt(x: number, y: number) {
    if (!this.layer) {
      return false
    }
    const tile = this.layer.getTileAtWorldXY(x, y)
    if (!tile) {
      return false
    }
    return tile.index === 100
  }

  // this method loops through the boxes and returns the one box that has the x & y value specified
  private getBoxAt(x: number, y: number) {
    return this.boxes.find(box => {
      const rect = box.getBounds()
      return rect.contains(x, y)
    })
  }

  // create the animations
  private createPlayerAnimations() {
    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'tiles', frame: 52 }],
      frameRate: 10,
    })

    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'tiles', frame: 55 }],
      frameRate: 10,
    })

    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'tiles', frame: 81 }],
      frameRate: 10,
    })

    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'tiles', frame: 78 }],
      frameRate: 10,
    })

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('tiles', {
        start: 81,
        end: 83,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('tiles', {
        start: 78,
        end: 80,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('tiles', {
        start: 55,
        end: 57,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('tiles', {
        start: 52,
        end: 54,
      }),
      frameRate: 10,
      repeat: -1,
    })
  }
}
