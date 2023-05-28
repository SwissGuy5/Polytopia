let count = 0;
// Main Tile
class Tile {
    /**
     * Tile Object
     * @param {number} x 
     * @param {number} y 
     * @param {string} terrain 
        - field
        - water
        - ocean
        - mountain
        - village
        - city
     * @param {object} border city it belongs to
     * @param {string} resource 
        - fruit
        - crop
        - animal
        - forest
        - metal
        - fish
        - whale
        - null
     * @param {*} unit 
     * @param {*} cloud 
     * @param {string} city 
        - null (normal tile)
        - TRIBE_NAME (city)
     */
    constructor(x, y, terrain, unit, cloud, biome) {
        this.x = x;
        this.y = y;
        this.terrainResource = null;
        this.resource = null;
        this.terrain = terrain;
        this.border = null;
        this.unit = unit;
        this.cloud = cloud;
        this.biome = biome;
        this.city = null;
        this.road = false;
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
                return `./assets/Buildings/${this.city.tribe.name}/Default/Houses/House_1.png`;
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
}

// // Terrain
// class Field extends Terrain {
//     constructor(position, tribe, suitability, outerCity) {
//         super(position, tribe);
//         this.suitability = suitability;
//         this.outerCity = outerCity;
//         this.defaultColor = '#808080';
//     }

//     getColor() {
//         switch (this.tribe) {
//             case 'neutral':
//                 return '#83c95b';
//             case 'imperius':
//                 return '#83c95b';
//             case 'bardur':
//                 return '#2e6e2e'
//             case 'oumaji':
//                 return '#faf3a2';
//             case 'polaris':
//                 return '#c9f5f0';
//             case 'temp':
//                 return "#ff0000";
//             default:
//                 return '#808080';
//         }
//     }
// }

// Tribes
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
        this.visibleTiles = [];
        this.multipliers = Tribe.innerMultipliers;
        this.startingTech = [];
        // this.setMultipliers();
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
        this.population = 0;
        this.tiles = [];
        this.upgrades = [];
        this.units = 0;
        this.income = 0;
    }
}

// Troops


// Techs