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
     * @param {String} type
        - Improvement
        - Unit
        - Building
        - Special (Other)
     * @param {Object} tier Tier of the technology (1 to 3)
     */
    constructor(name, tier) {
        this.name = name;
        // this.type = type;
        this.tier = tier;
        this.unlocked = false;
    }

    /**
     * Get the price of a tech
     * @param {Number} numOfCities tribe.cities.length
     * @returns 
     */
    price(numOfCities) {
        let tierPrice;
        switch (this.tier) {
            case 1:
                tierPrice = 5;
                break;
            case 2:
                tierPrice = 6;
                break;
            case 3:
                tierPrice = 7;
                break;
        }
        return tierPrice * numOfCities + 4
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
        return this.level;
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
        game.getSurroundingTiles(tile).forEach(borderingTile => {
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
    constructor(name, health, damage, defence, movement, range, skills, citySupport) {
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.defence = defence
        this.movement = movement;
        this.range = range;
        this.skills = skills;
        this.citySupport = citySupport;
        this.kills = 0;
        this.promoted = false;
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
    }
];

// Centroid
class Centroid {
    constructor(x, y, tribe) {
        this.x = x;
        this.y = y;
        this.tribe = tribe;
    }
}