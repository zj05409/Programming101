// import constants from "./const";

function getAtlasKey(symbol) {
  return constants.TILE_TO_ATLAS[symbol];
}

function getSprites(levelData, game, enemyCount) {
    if (enemyCount < 10) {
        enemyCount = 10;
    }
  return levelData
    .split(/\r\n|\r|\n/g)
    .map((row, i) => {
        if (i <= 3) {
            return row.split('').map(( c, i, cs ) => {
                if (enemyCount > 0 && c === '.' && cs[i + 1] === '.') {
                    enemyCount -= 1;
                    return '!';
                }
                return c;
            }).join('');
        } else {
            return row;
        }
    })
    .join("")
    .split("")
    .map((tileSymbol, tileIndex) => {
      var atlasKey = getAtlasKey(tileSymbol);
      if (typeof atlasKey == "undefined") {
        return null;
      }

      var args = [game, tileIndex, atlasKey, game.groups[constants.ATLAS_TO_ENTITY_TYPE[atlasKey]]];
      return getTerrainSprite.apply(null, args);
    })
    .filter(sprite => {
      return sprite != null;
    });
}

function getTerrainSprite(game, tileIndex, imageKey, group) {
    let sprite = null;
    if (imageKey === 'enemy_tank.png') {
        sprite = group.create(4 + xCoord(tileIndex), 4 + yCoord(tileIndex), "enemy_tank");
        sprite.extra = {
            entityType: constants.ATLAS_TO_ENTITY_TYPE[imageKey]
        };
    } else {
        sprite = group.create(4 + xCoord(tileIndex), 4 + yCoord(tileIndex), "sprites", imageKey);
        sprite.body.immovable = true;
        sprite.extra = {
            entityType: constants.ATLAS_TO_ENTITY_TYPE[imageKey]
        };
    }

    // const sprite =  game.physics.add.sprite(4 + xCoord(tileIndex), 4 + yCoord(tileIndex), "sprites", imageKey, group);
  // game.physics.arcade.enable(sprite);
  return sprite;
}

function xCoord(tileIndex) {
  return (tileIndex % 26) * 8;
}

function yCoord(tileIndex) {
  return Math.floor(tileIndex / 26) * 8;
}

// export default getSprites;
