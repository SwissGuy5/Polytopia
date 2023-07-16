class Tile {
    /**
     * Tile Object
     * @param {number} x 
     * @param {number} y 
     * @param {string} terrain 
        - field
        - water
        - ocean
     * @param {string} terrainResource
        - mountain
        - forest
        - city
        - village
        - null
     * @param {string} resource 
        - fruit
        - crop
        - animal
        - forest
        - metal
        - fish
        - whale
        - null
     * @param {string} biome
     */
    constructor(x, y, terrain) {
        this.x = x;
        this.y = y;
        this.terrain = terrain;
        this.terrainResource = null;
        this.resource = null;
        this.border = null;
        this.unit = null;
        this.exploredBy = [];
        this.biome = null;
        this.city = null;
        this.road = false;
        this.building = null;
    }

    get terrainAsset() {
        switch (this.terrain) {
            case 'field':
                return `./assets/Terrain/Ground/Ground_${this.biome}.png`;
            case 'water':
                if (this.biome == 'Polaris') {
                    return './assets/Terrain/Ground/Ground_Ice.png';
                } else {
                    return './assets/Terrain/Water/Water.png';
                }
            case 'ocean':
                return './assets/Terrain/Water/Ocean.png';
            default:
                return '';
        }
    }

    get terrainResourceAsset() {
        switch (this.terrainResource) {
            case 'forest':
                return `./assets/Resources/Forests/Forest_${this.biome}.png`;
                // return `./assets/Resources/Forests/Forest_Default.png`;
            case 'mountain':
                return `./assets/Terrain/Mountains/Mountain_${this.biome}.png`;
            case 'city':
                if (this.city.type == 'capital') {
                    return `./assets/Buildings/${this.city.tribe.name}/Default/Houses/House_3.png`;
                } else {
                    return `./assets/Buildings/${this.city.tribe.name}/Default/Houses/House_1.png`;
                }
            case 'village':
                return './assets/Buildings/Common/Village.png';
            default:
                return '';
        }
    }

    get resourceAsset() {
        switch (this.resource) {
            case 'fruit':
                return `./assets/Resources/Fruits/Fruit_${this.biome}.png`;
            case 'crop':
                return './assets/Resources/Other/Crop.png';
            case 'animal':
                return `./assets/Resources/Animals/Animal_${this.biome}.png`;
            case 'metal':
                return './assets/Resources/Other/Metal.png';
            case 'fish':
                return './assets/Resources/Other/Fish.png';
            case 'whale':
                return './assets/Resources/Other/Whale.png';
            default:
                return '';
        }
    }

    get unitAsset() {
        if (this.unit != null) {
            return this.unit.unitAsset;
        } else {
            return '';
        }
    }

    traversable(unit) {
        if (this.exploredBy.includes(game.currentTurnTribe.name)) {
            if (unit.carrying) {
                // if (this.terrain == 'ocean' && !game.currentTurnTribe.findTech('navigation').unlocked) {
                //     return false;
                // }
                return true;
            } else {
                if (this.terrain == 'water' && this.building == 'port' && game.currentTurnTribe.findTech('sailing').unlocked) {
                    return true;
                } else if (this.terrainResource == 'mountain' && game.currentTurnTribe.findTech('climbing').unlocked) {
                    return true;
                } else if (this.terrain == 'field' && this.terrainResource != 'mountain') {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    gfxAsset(gfx) {
        switch(gfx) {
            case 'target':
                let returnStatement = '';
                if (game.selectedUnit) {
                    game.selectedUnit.validMovement.forEach(validTile => {
                        if (this == validTile) {
                            returnStatement = './assets/Misc/moveTarget.png';
                        }
                    })
                    if (game.selectedUnit.canAttack) {
                        game.getSurroundingTiles(game.selectedUnit.tile, game.selectedUnit.range).forEach(borderingTile => {
                            if (borderingTile == this && borderingTile.unit && borderingTile.unit.tribe != game.selectedUnit.tribe && borderingTile.exploredBy.includes(game.currentTurnTribe.name)) {
                                returnStatement = './assets/Misc/attackTarget.png';
                            }
                        })
                    }
                }
                return returnStatement;
        }
    }

    get cloudAsset() {
        return `./assets/Terrain/Cloud.png`; 
    }

    get buildingAsset() {
        let actionAsset = null;
        barActions.forEach(barAction => {
            if (barAction.name == this.building) {
                actionAsset = barAction.asset;
            }
        })
        if (actionAsset) {
            return actionAsset;
        } else {
            return '';
        }
    }
}

class Tech {
    /**
     * Tech Template
     * @param {String} name Name of Tech
     * @param {Object} tier Tier of the technology (1 to 3)
     */
    constructor(name, tier) {
        this.name = name;
        this.tier = tier;
        this.unlocked = false;
        // this.type = null;
    }

    /**
     * Get the price of a tech
     * @param {Number} numOfCities tribe.cities.length
     * @returns 
     */
    price(numOfCities) {
        return this.tier * numOfCities + 4
    }
}

class Tribe {
    /**
     * Tribe for each player
     * @param {string} name 
        - XinXi
        - Imperius
        - Bardur
        - Oumaji
        - Kickoo
        - Hoodrick
        - Luxidoor
        - Vengir
        - Zebasi
        - AiMo
        - Quetzali
        - Yadakk
        - Aquarion
        - Elyrion
        - Polaris
        - Cymanti
     */
    constructor(name) {
        this.name = name;
        this.cities = [];
        this.units = [];
        this.balance = 4;
        this.multipliers = Tribe.innerMultipliers;
        this.techs = [
            new Tech ('default', 0), // Starting tech all tribes have for any action not requiring a tech
            new Tech ('climbing', 1),
            new Tech ('fishing', 1),
            new Tech ('hunting', 1),
            new Tech ('organisation', 1),
            new Tech ('riding', 1),
            new Tech ('archery', 2),
            new Tech ('farming', 2),
            new Tech ('forestry', 2),
            new Tech ('freeSpirit', 2),
            new Tech ('meditation', 2),
            new Tech ('mining', 2),
            new Tech ('roads', 2),
            new Tech ('sailing', 2),
            new Tech ('strategy', 2),
            new Tech ('whaling', 2),
            new Tech ('aquatism', 3),
            new Tech ('chivalry', 3),
            new Tech ('construction', 3),
            new Tech ('diplomacy', 3),
            new Tech ('mathematics', 3),
            new Tech ('navigation', 3),
            new Tech ('smithery', 3),
            new Tech ('spiritualism', 3),
            new Tech ('trade', 3),
            new Tech ('philosophy', 3),
        ];
        this.unlockStartingTechs();
        // this.setMultipliers();
    }

    get income() {
        let income = 0;
        this.cities.forEach(city => {
            income += city.cityIncome;
        })
        return income;
    }

    findTech(name) {
        let returnStatement = null;
        this.techs.forEach(tech => {
            if (tech.name == name) {
                returnStatement = tech;
            }
        })
        return returnStatement;
    }

    static innerMultipliers = {
        'fruit': 0.2,
        'crop': 0.2,
        'field': 0.06,
        'animal': 0.17,
        'forest': 0.17,
        'metal': 0.17,
        'mountain': 0.03,
        'fish': 0.5,
        'whale': 0.33
    };

    static outerMultipliers = {
        'fruit': 0.06,
        'crop': 0.06,
        'field': 0.34,
        'animal': 0.06,
        'forest': 0.28,
        'metal': 0.03,
        'mountain': 0.17,
        'fish': 0.5,
        'whale': 0.33
    };

    unlockStartingTechs() {
        let startingTech = null;
        switch (this.name) {
            case 'XinXi':
                startingTech = 'climbing';
                break;
            case 'Imperius':
                startingTech = 'organisation';
                break;
            case 'Bardur':
                startingTech = 'hunting';
                break;
            case 'Oumaji':
                startingTech = 'riding';
                break;
            case 'Kickoo':
                startingTech = 'fishing';
                break;
            case 'Hoodrick':
                startingTech = 'archery';
                break;
            // case 'Luxidoor':
            //     break;
            case 'Vengir':
                startingTech = 'smithery';
                break;
            case 'Zebasi':
                startingTech = 'farming';
                break;
            case 'AiMo':
                startingTech = 'meditation';
                break;
            case 'Quetzali':
                startingTech = 'strategy';
                break;
            case 'Yadakk':
                startingTech = 'roads';
                break;
            case 'Ancients':
                this.balance = 999;
                this.techs.forEach(tech => {
                    tech.unlocked = true;
                })
                break;
        };
        this.techs.forEach(tech => {
            // Unlock the default / starting tech
            if (tech.name == 'default') {
                tech.unlocked = true;
            }
            if (tech.name == startingTech) {
                tech.unlocked = true;
            }
        })
    }

    setMultipliers() {
        let proportionalAdjustements = {};
        switch (this.name) {
            case 'XinXi':
                proportionalAdjustements = {'mountain': 1.5, 'metal': 1.5};
                break;
            case 'Imperius':
                proportionalAdjustements = {'animal': 0.5, 'fruit': 2};
                break;
            case 'Bardur':
                proportionalAdjustements = {'fruit': 1.5, 'crop': 0};
                break;
            case 'Oumaji':
                proportionalAdjustements = {'forest': 0.2, 'animal': 0.2, 'mountain': 0.5}; //Water: 0.5
                break;
            case 'Kickoo':
                proportionalAdjustements = {'mountain': 0.5, 'fish': 1.5}; //Water: 2
                break;
            case 'Hoodrick':
                proportionalAdjustements = {'mountain': 0.5, 'forest': 1.5};
                break;
            case 'Luxidoor':
                break;
            case 'Vengir':
                proportionalAdjustements = {'metal': 2, 'animal': 0.1, 'fruit': 0.1, 'fish': 0.1};
                break;
            case 'Zebasi':
                proportionalAdjustements = {'mountain': 0.5, 'forest': 0.5, 'fruit': 0.5};
                break;
            case 'AiMo':
                proportionalAdjustements = {'mountain': 1.5, 'crop': 0.1};
                break;
            case 'Quetzali':
                proportionalAdjustements = {'fruit': 2, 'crop': 0.1};
                break;
            case 'Yadakk':
                proportionalAdjustements = {'mountain': 0.5, 'forest': 0.5, 'fruit': 1.5};
                break;
            case 'Ancients':
                proportionalAdjustements = {};
                break;
        }

        // Apply new multipliers
        let percentageAdded = 0;
        let percentageLeft = 1;
        let tempMultipliers = [];
        for (let key in this.multipliers) {
            tempMultipliers.push(key);
        }
        Object.keys(proportionalAdjustements).forEach(key => {
            for (let key2 of Object.keys(this.multipliers)) {
                if (key == key2) {
                    let prevValue = this.multipliers[key2];
                    this.multipliers[key2] *= proportionalAdjustements[key2];
                    percentageAdded += prevValue - this.multipliers[key2];
                    percentageLeft -= prevValue;
                    tempMultipliers.splice(tempMultipliers.indexOf(key2), 1);
                    break;
                }
            }
        });
        // console.log(tempMultipliers);
        tempMultipliers.splice(tempMultipliers.indexOf('fish'), 1);
        // tempMultipliers.splice(tempMultipliers.indexOf('whale'), 1);

        // Adjust remaining multipliers to equal 100%
        tempMultipliers.forEach(key => {
            let temp = this.multipliers[key];
            this.multipliers[key] *= percentageAdded / percentageLeft;
            this.multipliers[key] += temp;
        })
        console.log(this.name, this.multipliers);
    }
}

class City {
    /**
     * City Building
     * @param {*} x Tile.x
     * @param {*} y Tile.Y
     * @param {*} type 
        - village
        - city
        - capital
     * @param {*} tribe 
     */
    constructor(x, y, type, tribe) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.tribe = tribe;
        this.population = 1;
        this.tiles = [];
        this.upgrades = [];
        this.sieged = false;
        this.centroid = null;
    }

    get level() {
        let level = 0;
        let levelPopulation = this.population;
        while (true) {
            if (levelPopulation - (level + 1) >= 0) {
                levelPopulation -= level + 1;
                level++;
            } else {
                return level;
            }
        }
    }

    get cityIncome() {
        let income = this.level;
        if (this.upgrades.includes('workshop')) {
            income++;
        }
        this.tiles.forEach(tile => {
            if (tile.building == 'customsHouse') {
                income += this.getHubPopulation('customsHouse', tile) * 2
            }
        })
        return income;
    }

    getHubPopulation(hubName, tile) {
        let buildingToFind = null;
        switch(hubName) {
            case 'customsHouse':
                buildingToFind = 'port';
                break;
            case 'forge':
                buildingToFind = 'mine';
                break;
            case 'sawmill':
                buildingToFind = 'lumberHut';
                break;
            case 'windmill':
                buildingToFind = 'farm';
                break;
        }
        let resourceCount = 0;
        game.getSurroundingTiles(tile, 1).forEach(borderingTile => {
            if (borderingTile.building == buildingToFind) {
                resourceCount++;
            }
        });
        console.log(resourceCount);
        return resourceCount;
    }
}

// Units
class Unit {
    /**
     * Unit Constructor
     * @param {*} name Name of the unit, lower case
     * @param {*} citySupport The city this unit is affiliated to
     */
    constructor(name, tribe, citySupport) {
        this.name = name;
        this.tribe = tribe;
        this.citySupport = citySupport;
        this.maxHealth = null;
        this.health = null;
        this.damage = null;
        this.defence = null
        this.movement = null;
        this.range = null;
        this.skills = [];
        this.kills = 0;
        this.tile = null;
        this.promoted = false;
        this.canMove = false;
        this.canAttack = false;
        this.carrying = null;
        this.type = null;

        this.createUnit();
    }

    get unitAsset() {
        return `./assets/Units/${this.citySupport.tribe.name}/Default/${this.citySupport.tribe.name}_Default_${game.capitalise(this.name)}.png`;
    }

    get validMovement() {
        // console.log(this.tile);
        let array = [];
        if (this.canMove) {
            array = this.floodFill(this.tile, []);
            array.shift();
            array.forEach((tile, i) => {
                if (tile.unit != null) {
                    array.splice(i, 1);
                }
            })
        }
        return array;
    }

    floodFill(tile, visitedTiles) {
        if (tile.traversable(this) && !visitedTiles.includes(tile) && Math.abs(this.tile.x - tile.x) <= this.movement && Math.abs(this.tile.y - tile.y) <= this.movement) {
            visitedTiles.push(tile);
            // console.log(tile, visitedTiles);
            if (tile.y - 1 >= 0) {
                visitedTiles = this.floodFill(game.grid[tile.y - 1][tile.x], visitedTiles);
            }
            if (tile.x - 1 >= 0) {
                visitedTiles = this.floodFill(game.grid[tile.y][tile.x - 1], visitedTiles);
            }
            if (tile.y + 1 <= game.gridSize - 1) {
                visitedTiles = this.floodFill(game.grid[tile.y + 1][tile.x], visitedTiles);
            }
            if (tile.x + 1 <= game.gridSize - 1) {
                visitedTiles = this.floodFill(game.grid[tile.y][tile.x + 1], visitedTiles);
            }
        }
        return visitedTiles;
    }

    createUnit() {
        this.tribe.units.push(this);

        switch(this.name) {
            // Land
            case 'warrior':
                this.price = 2;
                this.health = 10;
                this.damage = 2;
                this.defence = 2;
                this.movement = 1;
                this.range = 1;
                this.skills = ['dash', 'fortify'];
                this.type = 'melee';
                break;
            case 'archer':
                this.price = 3;
                this.health = 10;
                this.damage = 2;
                this.defence = 1;
                this.movement = 1;
                this.range = 2;
                this.skills = ['dash', 'fortify'];
                this.type = 'ranged';
                break;
            case 'defender':
                this.price = 3;
                this.health = 15;
                this.damage = 1;
                this.defence = 3;
                this.movement = 1;
                this.range = 1;
                this.skills = ['fortify'];
                this.type = 'melee';
                break;
            case 'rider':
                this.price = 3;
                this.health = 10;
                this.damage = 2;
                this.defence = 1;
                this.movement = 2;
                this.range = 1;
                this.skills = ['dash', 'escape', 'fortify'];
                this.type = 'melee';
                break;
            case 'cloak':
                this.price = 8;
                this.health = 5;
                this.damage = 0;
                this.defence = .5;
                this.movement = 2;
                this.range = 1;
                this.skills = ['hide', 'sneak', 'infiltrate', 'dash'];
                this.type = 'melee';
                break;
            case 'dagger':
                this.price = null;
                this.health = 10;
                this.damage = 2;
                this.defence = 2;
                this.movement = 1;
                this.range = 1;
                this.skills = ['dash', 'surprise', 'independent'];
                this.type = 'melee';
                break;
            case 'mindBender':
                this.price = 5;
                this.health = 10;
                this.damage = 0;
                this.defence = 1;
                this.movement = 1;
                this.range = 1;
                this.skills = ['heal', 'convert', 'detect'];
                this.type = 'melee';
                break;
            case 'swordsman':
                this.price = 5;
                this.health = 15;
                this.damage = 3;
                this.defence = 3;
                this.movement = 1;
                this.range = 1;
                this.skills = ['dash', 'fortify'];
                this.type = 'melee';
                break;
            case 'catapult':
                this.price = 8;
                this.health = 10;
                this.damage = 4;
                this.defence = 0;
                this.movement = 1;
                this.range = 3;
                this.skills = [];
                this.type = 'ranged';
                break;
            case 'knight':
                this.price = 8;
                this.health = 10;
                this.damage = 3.5;
                this.defence = 1;
                this.movement = 3;
                this.range = 1;
                this.skills = ['dash', 'persist', 'fortify'];
                this.type = 'melee';
                break;
            case 'giant':
                this.price = null;
                this.health = 40;
                this.damage = 5;
                this.defence = 4;
                this.movement = 1;
                this.range = 1;
                this.skills = [];
                this.type = 'melee';
                break;
            case 'boat':
                this.price = null;
                this.health = null;
                this.damage = 1;
                this.defence = 1;
                this.movement = 2;
                this.range = 2;
                this.skills = ['dash', 'carry', 'float'];
                this.type = 'ranged';
                break;
            case 'ship':
                this.price = 5;
                this.health = null;
                this.damage = 2;
                this.defence = 2;
                this.movement = 3;
                this.range = 2;
                this.skills = ['dash', 'carry', 'float'];
                this.type = 'ranged';
                break;
            case 'battleship':
                this.price = 15;
                this.health = null;
                this.damage = 4;
                this.defence = 3;
                this.movement = 3;
                this.range = 2;
                this.skills = ['dash', 'scout', 'carry', 'float'];
                this.type = 'ranged';
                break;
            case 'dinghy':
                this.price = null;
                this.health = 5;
                this.damage = 0;
                this.defence = .5;
                this.movement = 2;
                this.range = 1;
                this.skills = ['carry', 'float', 'hide', 'sneak', 'infiltrate'];
                this.type = 'melee';
                break;
            case 'pirate':
                this.price = null;
                this.health = 10;
                this.damage = 2;
                this.defence = 2;
                this.movement = 1;
                this.range = 1;
                this.skills = ['dash', 'suprise', 'independent'];
                this.type = 'melee';
                break;
        }
        this.maxHealth = this.health;
    }
}

// Actions
const barActions = [
    // Resources
    {
        name: 'farm',
        displayName: 'Farm',
        type: 'resource',
        price: 5,
        techRequired: 'farming',
        asset: './assets/Buildings/Common/Farm.png'
    },
    {
        name: 'lumberHut',
        displayName: 'Lumber Hut',
        type: 'resource',
        price: 2,
        techRequired: 'forestry',
        asset: './assets/Buildings/Common/Lumber_Hut.png'
    },
    {
        name: 'mine',
        displayName: 'Mine',
        type: 'resource',
        price: 5,
        techRequired: 'mining',
        asset: './assets/Buildings/Common/Mine.png'
    },
    {
        name: 'port',
        displayName: 'Port',
        type: 'resource',
        price: 10,
        techRequired: 'sailing',
        asset: './assets/Buildings/Common/Port.png'
    },
    {
        name: 'growForest',
        displayName: 'Grow Forest',
        type: 'resource',
        price: 5,
        techRequired: 'spiritualism',
        asset: ''
    },
    // Hubs
    {
        name: 'customsHouse',
        displayName: 'Customs House',
        type: 'hub',
        price: 5,
        techRequired: 'trade',
        asset: './assets/Buildings/Common/Customs_House_1.png'
    },
    {
        name: 'forge',
        displayName: 'Forge',
        type: 'hub',
        price: 5,
        techRequired: 'smithery',
        asset: './assets/Buildings/Common/Forge_1.png'
    },
    {
        name: 'sawmill',
        displayName: 'Sawmill',
        type: 'hub',
        price: 5,
        techRequired: 'mathematics',
        asset: './assets/Buildings/Common/Sawmill_1.png'
    },
    {
        name: 'windmill',
        displayName: 'Windmill',
        type: 'hub',
        price: 2,
        techRequired: 'construction',
        asset: './assets/Buildings/Common/Windmill_1.png'
    },
    // Temples
    {
        name: 'temple',
        displayName: 'Temple',
        type: 'temple',
        price: 20,
        techRequired: 'freeSpirit',
        asset: './assets/Buildings/Common/Temple_1.png'
    },
    {
        name: 'forestTemple',
        displayName: 'Forest Temple',
        type: 'temple',
        price: 15,
        techRequired: 'spiritualism',
        asset: './assets/Buildings/Common/Forest_Temple_1.png'
    },
    {
        name: 'mountainTemple',
        displayName: 'Mountain Temple',
        type: 'temple',
        price: 20,
        techRequired: 'meditation',
        asset: './assets/Buildings/Common/Mountain_Temple_1.png'
    },
    {
        name: 'waterTemple',
        displayName: 'Water Temple',
        type: 'temple',
        price: 20,
        techRequired: 'aquatism',
        asset: './assets/Buildings/Common/Water_Temple_1.png'
    },
    // Harvestable Resources
    {
        name: 'harvesting',
        displayName: 'Harvesting',
        type: 'harvest',
        price: 2,
        techRequired: 'organisation',
        asset: './assets/Misc/Rainbowflame.png'
    },
    {
        name: 'animalHunting',
        displayName: 'Hunting',
        type: 'harvest',
        price: 2,
        techRequired: 'hunting',
        asset: './assets/Misc/Rainbowflame.png'
    },
    {
        name: 'fishHunting',
        displayName: 'Hunt Fish',
        type: 'harvest',
        price: 2,
        techRequired: 'fishing',
        asset: './assets/Misc/Rainbowflame.png'
    },
    {
        name: 'whaleHunting',
        displayName: 'Hunt Whale',
        type: 'harvest',
        price: 0,
        techRequired: 'whaling',
        asset: './assets/Misc/Rainbowflame.png'
    },
    {
        name: 'clearForest',
        displayName: 'Clear Forest',
        type: 'harvest',
        price: 0,
        techRequired: 'forestry',
        asset: ''
    },
    {
        name: 'burnForest',
        displayName: 'Burn Forest',
        type: 'harvest',
        price: 2,
        techRequired: 'chivalry',
        asset: ''
    },
    {
        name: 'destroy',
        displayName: 'Destroy',
        type: 'harvest',
        price: 0,
        techRequired: 'construction',
        asset: ''
    },
    // Units
    {
        name: 'warrior',
        displayName: 'Warrior',
        type: 'unit',
        price: 2,
        techRequired: 'default',
        asset: ''
    },
    {
        name: 'archer',
        displayName: 'Archer',
        type: 'unit',
        price: 3,
        techRequired: 'archery',
        asset: ''
    },
    {
        name: 'defender',
        displayName: 'Defender',
        type: 'unit',
        price: 3,
        techRequired: 'strategy',
        asset: ''
    },
    {
        name: 'rider',
        displayName: 'Rider',
        type: 'unit',
        price: 3,
        techRequired: 'riding',
        asset: ''
    },
    {
        name: 'cloak',
        displayName: 'Cloak',
        type: 'unit',
        price: 8,
        techRequired: 'diplomacy',
        asset: ''
    },
    {
        name: 'mindBender',
        displayName: 'Mind Bender',
        type: 'unit',
        price: 5,
        techRequired: 'philosophy',
        asset: ''
    },
    {
        name: 'swordsman',
        displayName: 'Swordsman',
        type: 'unit',
        price: 5,
        techRequired: 'smithery',
        asset: ''
    },
    {
        name: 'catapult',
        displayName: 'Catapult',
        type: 'unit',
        price: 8,
        techRequired: 'mathematics',
        asset: ''
    },
    {
        name: 'knight',
        displayName: 'Knight',
        type: 'unit',
        price: 8,
        techRequired: 'chivalry',
        asset: ''
    },
    // Naval
    {
        name: 'ship',
        displayName: 'Ship',
        type: 'unitUpgrade',
        price: 5,
        techRequired: 'sailing',
        asset: ''
    },
    {
        name: 'battleship',
        displayName: 'Battleship',
        type: 'unitUpgrade',
        price: 15,
        techRequired: 'navigation',
        asset: ''
    },
    // Actions
    {
        name: 'recover',
        displayName: 'Recover',
        type: 'unitAction',
        price: 0,
        techRequired: 'default',
        asset: ''
    },
    {
        name: 'disband',
        displayName: 'Disband',
        type: 'unitAction',
        price: 0,
        techRequired: 'freeSpirit',
        asset: ''
    },
    {
        name: 'healOthers',
        displayName: 'Heal Others',
        type: 'unitAction',
        price: 0,
        techRequired: 'default',
        asset: ''
    },
    {
        name: 'captureCity',
        displayName: 'Capture City',
        type: 'unitAction',
        price: 0,
        techRequired: 'default',
        asset: ''
    },
];

// Centroid
class Centroid {
    constructor(x, y, tribe) {
        this.x = x;
        this.y = y;
        this.tribe = tribe;
    }
}