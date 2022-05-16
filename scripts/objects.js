// Terrain
class Terrain {
    constructor(position, tribe, suitability) {
        this.position = position;
        this.tribe = tribe;
        this.suitability = suitability;
        this.defaultColor = undefined;
    }

    getPosX() {
        return this.position[0];
    }

    getPosY() {
        return this.position[1];
    }

    getColor() {
        return this.defaultColor;
    }

    getClassName() {
        return this.constructor.name;
    }
}

class Field extends Terrain {
    constructor(position, tribe, suitability, outerCity) {
        super(position, tribe);
        this.suitability = suitability;
        this.outerCity = outerCity;
        this.defaultColor = '#808080';
    }

    getColor() {
        switch (this.tribe) {
            case 'neutral':
                return '#83c95b';
            case 'imperius':
                return '#83c95b';
            case 'bardur':
                return '#2e6e2e'
            case 'oumaji':
                return '#faf3a2';
            case 'polaris':
                return '#c9f5f0';
            case 'temp':
                return "#ff0000";
            default:
                return '#808080';
        }
    }
}

class Water extends Terrain {
    constructor(position, tribe) {
        super(position, tribe);
        this.suitability = false;
        this.defaultColor = '#64caf5';
    }
}

class Ocean extends Terrain {
    constructor(position, tribe) {
        super(position, tribe);
        this.suitability = false;
        this.defaultColor = '#143bff';
    }
}

class Village extends Terrain {
    constructor(position, tribe) {
        super(position, tribe);
        this.suitability = false;
        this.defaultColor = '#fcc43f';
    }
}

class Capital extends Village {
    constructor(position, tribe, suitability) {
        super(position, tribe, suitability);
        this.tribe = tribe;
        this.defaultColor = '#fc973f';
    }
}

class VillageBorder extends Village {
    constructor(position, tribe, suitability) {
        super(position, tribe, suitability);
        this.defaultColor = '#fce090';
    }
}

class Mountain extends Terrain {
    constructor(position, tribe) {
        super(position);
        this.tribe = tribe;
        this.defaultColor = '#999999';
        // this.imgLink = "./assets/mountain.png";
    }
}

class Cloud extends Terrain {
    constructor(position, tribe) {
        super(position);
        this.tribe = tribe;
        this.defaultColor = '#ededed';
    }
}

class PerlinMapObject extends Terrain {
    constructor(position, tribe, color) {
        super(position);
        this.tribe = tribe;
        this.defaultColor = color;
    }
}

// Tribes
class Tribes {
    constructor() {
        this.baseInnerMultipliers = [
            0.19, // Fruit [0]
            0.19, // Crop [1]
            0.08, // Field [2]
            0.17, // Animal [3]
            0.17, // Forest [4]
            0.17, // Metal [5]
            0.03 // Mountain [6]
        ];
        this.baseOuterMultipliers = [
            0.06, // Fruit [0]
            0.06, // Crop [1]
            0.34, // Field [2]
            0.06, // Animal [3]
            0.28, // Forest [4]
            0.03, // Metal [5]
            0.17 // Mountain [6]
        ]
        // this.multipliers = {
        //     'Fruit': 0.2,
        //     'Crop': 0.2,
        //     'Field': 0.08,
        //     'Animal': 0.17,
        //     'Forest': 0.17,
        //     'Metal': 0.17,
        //     'Mountain': 0.03
        // };
    }

    setMultipliers() {

    }
}

class Xinxi extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Imperius extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Bardur extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Oumaji extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Kickoo extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Hoodrick extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Luxidoor extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Vengir extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Zebasi extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Aimo extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Quetzali extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

class Yadakk extends Tribes {
    constructor(baseInnerMultipliers, baseOuterMultipliers) {
        super(baseInnerMultipliers, baseOuterMultipliers);
    }
}

// Buildings


// Troops


// Techs