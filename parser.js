// import constants from "./const";

function getAtlasKey(symbol) {
  return constants.TILE_TO_ATLAS[symbol];
}

function getSprites(levelData, game) {
  return levelData
    .split(/\r\n|\r|\n/g)
    .join("")
    .split("")
    .map((tileSymbol, tileIndex) => {
      var atlasKey = getAtlasKey(tileSymbol);
      if (typeof atlasKey == "undefined") {
        return null;
      }

      var args = [game, tileIndex, atlasKey];
      return getTerrainSprite.apply(null, args);
    })
    .filter(sprite => {
      return sprite != null;
    });
}

function getTerrainSprite(game, tileIndex, imageKey) {
   const sprite =  game.physics.add.sprite(4 + xCoord(tileIndex), 4 + yCoord(tileIndex), "sprites", imageKey);
  // game.physics.arcade.enable(sprite);
  sprite.body.immovable = true;
  sprite.extra = {
    entityType: constants.ATLAS_TO_ENTITY_TYPE[imageKey]
  };
  return sprite;
}

function xCoord(tileIndex) {
  return (tileIndex % 26) * 8;
}

function yCoord(tileIndex) {
  return Math.floor(tileIndex / 26) * 8;
}

// export default getSprites;
