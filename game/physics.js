import { TILE_TYPE } from '../map-tile-types.js';

// --- Hitbox Definitions (in tile units) ---

// Player hitbox: A rectangle at the player's feet.
// Centered horizontally, positioned at the bottom of the player's logical space.
const PLAYER_HITBOX_WIDTH = 0.6;
const PLAYER_HITBOX_HEIGHT = 0.3;

// Tree trunk hitbox: As specified, bottom 50% height, centered 12.5% width.
const TREE_TRUNK_HITBOX_WIDTH = 0.125;
const TREE_TRUNK_HITBOX_HEIGHT = 0.5;
const TREE_TRUNK_OFFSET_X = (1 - TREE_TRUNK_HITBOX_WIDTH) / 2; // ~0.4375

export function getPlayerHitbox(player) {
    return {
        x: player.pixelX - PLAYER_HITBOX_WIDTH / 2,
        y: player.pixelY - PLAYER_HITBOX_HEIGHT / 2, // Centered vertically on pixelY for now
        width: PLAYER_HITBOX_WIDTH,
        height: PLAYER_HITBOX_HEIGHT
    };
}

function getTreeTrunkHitbox(tileX, tileY) {
    return {
        x: tileX + TREE_TRUNK_OFFSET_X,
        y: tileY + (1 - TREE_TRUNK_HITBOX_HEIGHT), // Bottom half of the tile
        width: TREE_TRUNK_HITBOX_WIDTH,
        height: TREE_TRUNK_HITBOX_HEIGHT
    };
}


// --- Collision Detection ---

/**
 * Basic AABB collision check.
 * @param {object} rect1 - { x, y, width, height }
 * @param {object} rect2 - { x, y, width, height }
 * @returns {boolean} - True if the rectangles overlap.
 */
function checkAABBCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Checks a given rectangular hitbox against all solid objects in the world.
 * @param {object} rect - The hitbox to check { x, y, width, height }.
 * @param {GameMap} gameMap - The game map instance.
 * @returns {boolean} - True if a collision is detected.
 */
export function checkWorldCollision(rect, gameMap) {
    // Check collision with map boundaries
    if (rect.x < 0 || rect.x + rect.width > gameMap.width ||
        rect.y < 0 || rect.y + rect.height > gameMap.height) {
        return true;
    }

    // Determine the grid range to check for potential colliders
    const startX = Math.floor(rect.x);
    const endX = Math.ceil(rect.x + rect.width);
    const startY = Math.floor(rect.y);
    const endY = Math.ceil(rect.y + rect.height);

    // Check against trees in the vicinity
    for (let j = startY; j < endY; j++) {
        for (let i = startX; i < endX; i++) {
            if (i < 0 || i >= gameMap.width || j < 0 || j >= gameMap.height) {
                continue;
            }

            if (gameMap.grid[j][i] === TILE_TYPE.TREE) {
                const treeHitbox = getTreeTrunkHitbox(i, j);
                if (checkAABBCollision(rect, treeHitbox)) {
                    return true; // Collision detected
                }
            }
        }
    }

    return false; // No collision
}