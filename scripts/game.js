class Game {
    /**
     * Initialise Game Type
     * @param {string} mapType
        - Dryland: Entirely Land, water tribes with a few water tiles
        - Lakes: Small bodies of water, all tribes connected
        - Continents: Bigger seperations between land masses, landmasses still mostly connected
        - Archipelago: Discontinuous landmasses, almost every city is coastal
        - Water World: Covered in water, small island like landmasses
     * @param {string} mapSize
        - Tiny: 121 tiles, 11x11, 8
        - Small: 196 tiles, 14x14, 15
        - Normal: 256 tiles, 16x16, 15
        - Large: 324 tiles, 18x18, 15
        - Huge: 400 tiles, 20x20, 15
        - Massive: 900 tiles, 30x30, 15
     * @param {Integer} tileSize Size of each tile
     * @param {array} tribes
        - Xinxi
        - Imperius
        - Bardur
        - Oumaji
        - Kickoo
        - Hoodrick
        - Luxidoor
        - Vengir
        - Zebasi
        - Aimo
        - Quetzali
        - Yaddakk
     */
    constructor(mapType, mapSize, tileSize, tribes) {
        this.mapType = mapType;
        this.tileSize = tileSize;
        this.tribes = tribes;
        this.grid = [];
        this.zoomLevel = 1;
        this.turn = -1;
        this.unitSelected =  null;
        this.tileSelected = null;
        
        switch (mapSize) {
            case 'tiny':
                this.gridSize = 11;
                this.numOfVilages = 6 + this.randInt(2);
                break;
            case 'small':
                this.gridSize = 14;
                this.numOfVilages = 8 + this.randInt(4);
                break;
            case 'normal':
                this.gridSize = 16;
                this.numOfVilages = 10 + this.randInt(6);
                break;
            case 'large':
                this.gridSize = 18;
                this.numOfVilages = 12 + this.randInt(8);
                break;
            case 'huge':
                this.gridSize = 20;
                this.numOfVilages = 14 + this.randInt(10);
                break;
            case 'massive':
                this.gridSize = 30;
                this.numOfVilages = 20 + this.randInt(15);
                break;
            default:
                throw new Error('Map Size is Invalid');
        }
    }

    get currentTurnTribe() {
        return this.tribes[this.turn % this.tribes.length];
    }

    getSurroundingTiles(tile) {
        let surroundingTiles = [];
        for (let y = -1; y < 2; y++) {
            for (let x = -1; x < 2; x++) {
                if (!(x == 0 && y == 0) && (tile.y + y >= 0 && tile.x + x >= 0 && tile.y + y <= this.gridSize - 1 && tile.x + x <= this.gridSize - 1)) {
                    surroundingTiles.push(this.grid[tile.y + y][tile.x + x]);
                }
            }
        }
        return surroundingTiles;
    }

    initialiseGame() {
        this.setupGrid(); // Create Terrain & Biomes
        this.generateGrid(); // Display Grid
        this.generateActions(); // Add actions to the actions bar
        this.nextTurn(); // Start the turn and update clouds
        this.eventListeners(); //Listen for inputs
        this.display(1); // Display the main board
    }

    // Generate Terrain
    setupGrid() {
        switch (this.mapType) {
            case 'dryland':
                this.generateTerrain(1, 1, 0);
                break;
            case 'lakes':
                this.generateTerrain(5, 10, 3);
                break;
            case 'continents':
                this.generateTerrain(5, 10, 4);
                break;
            case 'archipelago':
                this.generateTerrain(3, 10, 5);
                break;
            case 'water world':
                this.generateTerrain(1, 10, 7);
                break;
        }
        this.generateVillages();
        this.generateResources();
    }

    /**
     * @param {Integer} divider The number dividing x and y in the simplexNoise function
     * @param {Integer} multiplier The number multiplied with the simplexNoise function
     * @param {Integer} waterTerrainLevel The height of water
     */
    generateTerrain(divider, multiplier, waterTerrainLevel) {
        const simplexNoise = new SimplexNoise();
        for (let y = 0; y < this.gridSize; y++) {
            this.grid.push([]);
            for (let x = 0; x < this.gridSize; x++) {
                const terrainLevel = this.normalise(simplexNoise.noise((x + 100)/divider, (y + 100)/divider, 0)) * multiplier;
                if (terrainLevel < waterTerrainLevel) {
                    this.grid[y].push(new Tile(x, y, 'ocean'));
                } else {
                    this.grid[y].push(new Tile(x, y, 'field'));
                }
            }
        }

        // Change ocean tiles near land to shallow water tiles
        this.getTiles(this.grid).forEach(tile => {
            if (tile.terrain == 'ocean') {
                let x = tile.x;
                let y = tile.y;
                if (x + 1 <= this.gridSize - 1 && this.grid[y][x + 1].terrain == 'field') {
                    tile.terrain = 'water';
                } else if (x - 1 >= 0 && this.grid[y][x - 1].terrain == 'field') {
                    tile.terrain = 'water';
                } else if (y + 1 <= this.gridSize - 1 && this.grid[y + 1][x].terrain == 'field') {
                    tile.terrain = 'water';
                } else if (y - 1 >= 0 && this.grid[y - 1][x].terrain == 'field') {
                    tile.terrain = 'water';
                }
            }
        });
    }
    
    // Generate the villages and capitals
    generateVillages() {
        let capitalsArray = [];
        let villagesArray = [];
        let suitablePlaces = [];
        for (let tile of this.getTiles(this.grid)) {
            if (tile.terrain == 'field' && tile.x > 0 && tile.x < this.gridSize - 1 && tile.y > 0 && tile.y < this.gridSize - 1) {
                suitablePlaces.push(tile);
            }
        }
        for (let villages = 0; villages < this.numOfVilages; villages++) {
            if (suitablePlaces.length != 0) {
                let newVillageCoordinate = suitablePlaces[this.randInt(suitablePlaces.length)];

                // Add capitals and villages
                const city = new City(newVillageCoordinate.x, newVillageCoordinate.y, null, null);
                city.type = 'village';
                this.grid[newVillageCoordinate.y][newVillageCoordinate.x].terrainResource = 'village';
                this.grid[newVillageCoordinate.y][newVillageCoordinate.x].city = city;
                villagesArray.push(city);

                // Remove tiles in a 5x5 radius from the suitable places array
                for (let y = -2; y < 3; y++) {
                    for (let x = -2; x < 3; x++) {
                        if (newVillageCoordinate.y + y >= 0 && newVillageCoordinate.x + x >= 0 && newVillageCoordinate.y + y <= this.gridSize - 1 && newVillageCoordinate.x + x <= this.gridSize - 1) {
                            let tile = this.grid[newVillageCoordinate.y + y][newVillageCoordinate.x + x];

                            // Remove tile from suitablePlaces array
                            suitablePlaces.forEach((suitableTile, index) => {
                                if (suitableTile == tile) {
                                    suitablePlaces.splice(index, 1);
                                }
                            });
                        }
                    }
                }
            } else {
                console.log('No suitable places found.')
            }
        }
        
        let centroids = [];
        for (let i = 0; i < this.tribes.length; i++) {
            centroids.push(new Centroid(villagesArray[i].x, villagesArray[i].y, this.tribes[i]));
        }
        for (let i = 0; i < 30; i++) {
            this.converge(villagesArray, centroids);
        }

        for (let tile of this.getTiles(this.grid)) {
            let nearestCentroid = Infinity;
            centroids.forEach(centroid => {
                let dist = this.distance(centroid.x, centroid.y, tile.x, tile.y);
                if (dist <= nearestCentroid) {
                    nearestCentroid = dist;
                    // Generate Biomes
                    tile.biome = centroid.tribe.name;
                }
            })
        }

        // Add capitals
        centroids.forEach(centroid => {
            let nearestVillageDist = Infinity;
            let nearestVillage;
            villagesArray.forEach(village => {
                let dist = this.distance(centroid.x, centroid.y, village.x, village.y);
                if (dist <= nearestVillageDist) {
                    nearestVillageDist = dist;
                    nearestVillage = village;
                }
            })
            nearestVillage.type = 'capital';
            this.grid[nearestVillage.y][nearestVillage.x].terrainResource = 'city';
            nearestVillage.tribe = nearestVillage.centroid.tribe;
            nearestVillage.tribe.cities.push(nearestVillage);
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    let tile = this.grid[nearestVillage.y + y][nearestVillage.x + x];
                    tile.border = nearestVillage;
                    tile.biome = nearestVillage.centroid.tribe.name;
                    nearestVillage.tiles.push(tile);
                }
            }
            for (let y = -2; y < 3; y++) {
                for (let x = -2; x < 3; x++) {
                    if (nearestVillage.y + y >= 0 && nearestVillage.x + x >= 0 && nearestVillage.y + y <= this.gridSize - 1 && nearestVillage.x + x <= this.gridSize - 1) {
                        let tile = this.grid[nearestVillage.y + y][nearestVillage.x + x];
                        tile.exploredBy.push(nearestVillage.tribe.name);
                    }
                }
            }
        })
    }

    converge(villagesArray, centroids) {
        // Assign each Point to a Centroid
        villagesArray.forEach(village => {
            let nearestCentroid = Infinity;
            centroids.forEach(centroid => {
                let dist = this.distance(centroid.x, centroid.y, village.x, village.y);
                if (dist <= nearestCentroid) {
                    village.centroid = centroid;
                    nearestCentroid = dist;
                }
            })
        })

        // Update average Centroid position
        centroids.forEach(centroid => {
            let listOfVillages = [];
            let xAverage = 0;
            let yAverage = 0;
            let nearestVillageDist = Infinity;
            let nearestVillage;
            villagesArray.forEach(village => {
                if (village.centroid.tribe.name == centroid.tribe.name) {
                    listOfVillages.push(village);
                    xAverage += village.x;
                    yAverage += village.y;
                    let dist = this.distance(centroid.x, centroid.y, village.x, village.y);
                    if (dist <= nearestVillageDist) {
                        nearestVillageDist = dist;
                        nearestVillage = village;
                    }
                }
            })
            if (listOfVillages.length != 0) {
                xAverage /= listOfVillages.length;
                yAverage /= listOfVillages.length;
                centroid.x = xAverage;
                centroid.y = yAverage;
            } else {
                // If no villages near Centroid, randomly replace the centroid
                let bool = true;
                while (bool) {
                    let randNumX = randInt(this.gridSize);
                    let randNumY = randInt(this.gridSize);
                    for (let i = 0; i < centroids.length; i++) {
                        if (centroids[i].x != randNumX && centroids[i].y != randNumY) {
                            if (i == centroids.length - 1) {
                                centroid.x = randNumX;
                                centroid.y = randNumY;
                                bool = false;
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        })
    }

    generateResources() {
        for (let tile of this.getTiles(this.grid)) {
            let randNum = Math.random();
            if (tile.border && tile.border.type == 'capital' && tile.city == null) {
                if (tile.terrain == 'water') {
                    randNum <= tile.border.tribe.multipliers['fish'] ? tile.resource = 'fish' : tile.resource = null;
                } else if (tile.terrain == 'ocean') {
                    randNum <= tile.border.tribe.multipliers['whale'] ? tile.resource = 'whale' : tile.resource = null;
                } else {
                    if (randNum <= tile.border.tribe.multipliers['fruit']) {
                        tile.resource = 'fruit';
                    } else if (randNum <= tile.border.tribe.multipliers['fruit'] + tile.border.tribe.multipliers['crop']) {
                        tile.resource = 'crop';
                    } else if (randNum <= tile.border.tribe.multipliers['fruit'] + tile.border.tribe.multipliers['crop'] + tile.border.tribe.multipliers['animal']) {
                        tile.resource = 'animal';
                    } else if (randNum <= tile.border.tribe.multipliers['fruit'] + tile.border.tribe.multipliers['crop'] + tile.border.tribe.multipliers['animal'] + tile.border.tribe.multipliers['forest']) {
                        tile.terrainResource = 'forest';
                    } else if (randNum <= tile.border.tribe.multipliers['fruit'] + tile.border.tribe.multipliers['crop'] + tile.border.tribe.multipliers['animal'] + tile.border.tribe.multipliers['forest'] + tile.border.tribe.multipliers['metal']) {
                        tile.terrainResource = 'mountain';
                        tile.resource = 'metal';
                    } else if (randNum <= tile.border.tribe.multipliers['fruit'] + tile.border.tribe.multipliers['crop'] + tile.border.tribe.multipliers['animal'] + tile.border.tribe.multipliers['forest'] + tile.border.tribe.multipliers['metal'] + tile.border.tribe.multipliers['mountain']) {
                        tile.terrainResource = 'mountain';
                        tile.resource = null;
                    } else {
                        tile.resource = null;
                    }
                }
            }
            else if (tile.city == null) {
                if (tile.terrain == 'water') {
                    randNum <= Tribe.outerMultipliers['fish'] ? tile.resource = 'fish' : tile.resource = null;
                } else if (tile.terrain == 'ocean') {
                    randNum <= Tribe.outerMultipliers['whale'] ? tile.resource = 'whale' : tile.resource = null;
                } else {
                    if (randNum <= Tribe.outerMultipliers['fruit']) {
                        tile.resource = 'fruit';
                    } else if (randNum <= Tribe.outerMultipliers['fruit'] + Tribe.outerMultipliers['crop']) {
                        tile.resource = 'crop';
                    } else if (randNum <= Tribe.outerMultipliers['fruit'] + Tribe.outerMultipliers['crop'] + Tribe.outerMultipliers['animal']) {
                        tile.resource = 'animal';
                    } else if (randNum <= Tribe.outerMultipliers['fruit'] + Tribe.outerMultipliers['crop'] + Tribe.outerMultipliers['animal'] + Tribe.outerMultipliers['forest']) {
                        tile.terrainResource = 'forest';
                    } else if (randNum <= Tribe.outerMultipliers['fruit'] + Tribe.outerMultipliers['crop'] + Tribe.outerMultipliers['animal'] + Tribe.outerMultipliers['forest'] + Tribe.outerMultipliers['metal']) {
                        tile.terrainResource = 'mountain';
                        tile.resource = 'metal';
                    } else if (randNum <= Tribe.outerMultipliers['fruit'] + Tribe.outerMultipliers['crop'] + Tribe.outerMultipliers['animal'] + Tribe.outerMultipliers['forest'] + Tribe.outerMultipliers['metal'] + Tribe.outerMultipliers['mountain']) {
                        tile.terrainResource = 'mountain';
                        tile.resource = null;
                    } else {
                        tile.resource = null;
                    }
                }
            }
        }
    }

    // Create grid container
    generateGrid() {
        const gridContainer = document.createElement('div');
        gridContainer.id = 'gridContainer'
        gridContainer.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gridContainer.style.height = `${this.tileSize * this.gridSize}px`;
        gridContainer.style.width = `${this.tileSize * this.gridSize}px`;
        document.body.appendChild(gridContainer);

        // Set Body Size
        const body = document.body;
        const containerSize = document.getElementById('gridContainer').getBoundingClientRect();
        body.style.height = `${Math.abs(containerSize.top) + Math.abs(containerSize.bottom)}px`;
        body.style.width = `${Math.abs(containerSize.left) + Math.abs(containerSize.right)}px`;
        body.style.margin = '150px';

        this.generateGridItems();
    }

    // Create and display grid items
    generateGridItems() {
        const gridContainer = document.getElementById('gridContainer');
        for (let tile of this.getTiles(this.grid)) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridContainer.appendChild(gridItem);

            // Terrain Tile (Land / Water)
            const terrain = document.createElement('div');
            terrain.className = 'tile terrain';
            gridItem.appendChild(terrain);

            // Terrain Resource Tile (Mountain / Trees / City / Village)
            const terrainResource = document.createElement('div');
            terrainResource.className = 'tile terrainResource';
            gridItem.appendChild(terrainResource);

            // City Caption
            if (tile.terrainResource == 'city') {
                // Create a tag displaying the city's name and star income per turn
            }

            // Resource Tile (Fruit / Crop / Animal / Metal / Fish / Whale)
            const resource = document.createElement('div');
            resource.className = 'tile resource';
            gridItem.appendChild(resource);

            // Building TIle
            const building = document.createElement('div');
            building.className = `tile building hidden`;
            gridItem.appendChild(building);

            // Cloud Tile
            const cloud = document.createElement('div');
            cloud.className = `tile cloud`;
            cloud.style.backgroundImage = `url(${tile.cloudAsset})`;
            gridItem.appendChild(cloud);

            // === Display Units === //

            // Inner Text Div
            const gridItemText = document.createElement('div');
            gridItemText.className = 'tile text';
            gridItemText.innerText = `(${tile.x}, ${tile.y})`;
            gridItemText.style.width = `${this.tileSize - 2}px`;
            gridItemText.style.height = `${this.tileSize - 2}px`;
            gridItem.appendChild(gridItemText);
        }
    }

    // Update the grid to show / hide clouds
    updateGridItems() {
        // const gridContainer = document.getElementById('gridContainer');
        [...document.getElementsByClassName('grid-item')].forEach((gridItem, i) => {
            let tile = this.getTiles(this.grid)[i];

            // Update the assets of each tile
            const terrain = gridItem.querySelector('.terrain');
            terrain.className = `tile terrain${tile.terrainAsset.includes('Water') ? ' water' : ''}${tile.terrainAsset.includes('Ground') ? ' land' : ''}`;
            terrain.style.backgroundImage = `url(${tile.terrainAsset})`;

            const terrainResource = gridItem.querySelector('.terrainResource');
            terrainResource.className = `tile terrainResource${tile.terrainResourceAsset.includes('Mountains') ? ' mountain' : ''}${tile.terrainResourceAsset.includes('Forests') ? ' forest' : ''}${tile.terrainResourceAsset.includes('Houses') ? ' city' : ''}${tile.terrainResourceAsset.includes('Village') ? ' village' : ''}`;
            terrainResource.style.backgroundImage = `url(${tile.terrainResourceAsset})`;

            const resource = gridItem.querySelector('.resource');
            resource.className = `tile resource${tile.resourceAsset.includes('Fruit') ? ' fruit' : ''}${tile.resourceAsset.includes('Crop') ? ' crop' : ''}${tile.resourceAsset.includes('Animal') ? ' animal' : ''}${tile.resourceAsset.includes('Metal') ? ' metal' : ''}${tile.resourceAsset.includes('Fish') ? ' fish' : ''}${tile.resourceAsset.includes('Whale') ? ' whale' : ''}`;
            resource.style.backgroundImage = `url(${tile.resourceAsset})`;

            const building = gridItem.querySelector('.building');
            building.className = `tile building`;
            building.style.backgroundImage = `url(${tile.buildingAsset})`

            const cloud = gridItem.querySelector('.cloud')
            cloud.className = `tile cloud${tile.exploredBy.includes(this.currentTurnTribe.name) ? ' hidden' : ''}`;

            // Hide all tiles under a cloud
            [...gridItem.querySelectorAll('.tile')].forEach(terrainElement => {
                // Explored by current tribe -> Show terrain
                if (terrainElement != cloud) {
                    if (tile.exploredBy.includes(this.currentTurnTribe.name)) {
                        terrainElement.classList.contains('hidden') ? terrainElement.classList.remove('hidden') : null;
                    } else { // Not explored by current tribe -> Hide terrain under clouds
                        terrainElement.classList.contains('hidden') ? null : terrainElement.classList.add('hidden');
                    }
                }
            });
        });
    }

    // Adds each exisitng buildings to the actions bar
    generateActions() {
        // Building Actions
        for (let action of barActions) {
            const actionsBar = document.getElementById('actionsBar');
            let span = document.createElement('span');
            span.id = action.name;
            let btn = document.createElement('button');
            btn.onclick = () => { this.handleActions(action); }
            btn.innerText = action.price;
            let text = document.createElement('p');
            text.innerText = action.displayName;
            span.appendChild(btn);
            span.appendChild(text);
            actionsBar.appendChild(span);
        }
    }

    // Hide all unavailable / unaplicable actions
    updateActions(tile) {
        // Building Action Updates
        const actionsBarSpan = document.querySelectorAll('#actionsBar span');

        // Hide all actions
        actionsBarSpan.forEach((action) => {
            action.classList.contains('hidden') ? null : action.classList.add('hidden');
        });

        // Check if tile is a city
        if (tile.terrainResource == 'city') {

        // Check if tile is within a city's border
        } else if (tile.border != null && (tile.border.type == 'capital' || tile.border.type == 'city') && tile.border.tribe == this.tribes[this.turn % this.tribes.length]) {
            // --- Harvestable Resources --- //
            if (tile.resource == 'fruit') { // Harvest Fruit
                this.updateActionDisplay(document.getElementById('harvesting'));
            } else if (tile.resource == 'animal') { // Hunt Animal
                this.updateActionDisplay(document.getElementById('animalHunting'));
            } else if (tile.resource == 'fish') { // Hunt Fish
                this.updateActionDisplay(document.getElementById('fishHunting'));
            } else if (tile.resource == 'whale') { // Hunt Whale
                this.updateActionDisplay(document.getElementById('whaleHunting'));
            } else if (tile.building != null) { // Hunt Whale
                this.updateActionDisplay(document.getElementById('destroy'));
            }

            if (tile.terrain == 'field') {
                // --- Tile Upgrades --- //
                if (tile.resource == 'crop') {
                    this.updateActionDisplay(document.getElementById('farm'));
                }
                if (tile.resource == 'metal') {
                    this.updateActionDisplay(document.getElementById('mine'));
                }
                if (tile.terrainResource == 'mountain') {
                    this.updateActionDisplay(document.getElementById('mountainTemple'));
                } else if (tile.terrainResource == 'forest') {
                    this.updateActionDisplay(document.getElementById('lumberHut'));
                    this.updateActionDisplay(document.getElementById('forestTemple'));
                    this.updateActionDisplay(document.getElementById('clearForest'));
                    this.updateActionDisplay(document.getElementById('burnForest'));
                } else {
                    // Non-obstructed field
                    this.updateActionDisplay(document.getElementById('temple'));
                    this.updateActionDisplay(document.getElementById('growForest'));

                    // --- Hubs --- //
                    let numOfBuildings;
                    let existingHub;
                    // Customs House
                    existingHub = false;
                    this.tileSelected.border.tiles.forEach(borderingTile => {
                        if (borderingTile.building == 'customsHouse') {
                            existingHub = true;
                        }
                    });
                    if (existingHub == false ) {
                        numOfBuildings = false;
                        this.getSurroundingTiles(tile).forEach(newTile => {
                            if (newTile.building == 'port') {
                                numOfBuildings++;
                            }
                        })
                        if (numOfBuildings > 0) {
                            this.updateActionDisplay(document.getElementById('customsHouse'));
                        }
                    }

                    // Forge
                    existingHub = false;
                    this.tileSelected.border.tiles.forEach(borderingTile => {
                        if (borderingTile.building == 'forge') {
                            existingHub = true;
                        }
                    });
                    if (existingHub == false ) {
                        numOfBuildings = 0;
                        this.getSurroundingTiles(tile).forEach(newTile => {
                            if (newTile.building == 'mine') {
                                numOfBuildings++;
                            }
                        })
                        if (numOfBuildings > 0) {
                            this.updateActionDisplay(document.getElementById('forge'));
                        }
                    }

                    // Sawmill
                    existingHub = false;
                    this.tileSelected.border.tiles.forEach(borderingTile => {
                        if (borderingTile.building == 'sawmill') {
                            existingHub = true;
                        }
                    });
                    if (existingHub == false ) {
                        numOfBuildings = 0;
                        this.getSurroundingTiles(tile).forEach(newTile => {
                            if (newTile.building == 'lumberHut') {
                                numOfBuildings++;
                            }
                        })
                        if (numOfBuildings > 0) {
                            this.updateActionDisplay(document.getElementById('sawmill'));
                        }
                    }

                    // Windmill
                    existingHub = false;
                    this.tileSelected.border.tiles.forEach(borderingTile => {
                        if (borderingTile.building == 'windmill') {
                            existingHub = true;
                        }
                    });
                    if (existingHub == false ) {
                        numOfBuildings = 0;
                        this.getSurroundingTiles(tile).forEach(newTile => {
                            if (newTile.building == 'farm') {
                                numOfBuildings++;
                            }
                        })
                        if (numOfBuildings > 0) {
                            this.updateActionDisplay(document.getElementById('windmill'));
                        }
                    }
                }
            } else if (tile.terrain == 'water') {
                // Port
                this.updateActionDisplay(document.getElementById('port'));

                // Water Temple
                this.updateActionDisplay(document.getElementById('waterTemple'));
            } else if (tile.terrain == 'ocean') {
                // Water Temple
                this.updateActionDisplay(document.getElementById('waterTemple'));
            }
        }
    }

    updateActionDisplay(action) {
        let actionTechUnlocked = false;
        let actionAffordable = false;
        this.currentTurnTribe.techs.forEach(tech => {
            barActions.forEach(barAction => {
                if (barAction.name == action.id && barAction.techRequired == tech.name && tech.unlocked) {
                    actionTechUnlocked = true;
                    if (this.currentTurnTribe.balance >= barAction.price) {
                        actionAffordable = true;
                    }
                }
            });
        });

        if (actionTechUnlocked) {
            action.classList.contains('hidden') ? action.classList.remove('hidden') : null;
            action.querySelector('button').style.backgroundColor = 'rgb(16, 141, 236)';
            if (actionAffordable) {
                action.querySelector('button').style.borderColor = 'white';
            } else {
                action.querySelector('button').style.borderColor = 'red';
            }
        } else {
            action.querySelector('button').style.backgroundColor = 'black';
            action.querySelector('button').style.borderColor = 'grey';
        }
    }

    handleActions(action) {
        let techUnlocked = false;
        this.currentTurnTribe.techs.forEach(tech => {
            if (action.techRequired == tech.name && tech.unlocked) {
                techUnlocked = true;
            }
        });
        let city = this.tileSelected.border;
        if (this.currentTurnTribe.balance >= action.price && techUnlocked && city) {
            this.currentTurnTribe.balance -= action.price;
            
            // Get the tile HTML from a tile object
            let tileSelectedHTML;
            this.getTiles(this.grid).forEach((tile, i) => {
                if (tile == this.tileSelected) {
                    tileSelectedHTML = [...document.getElementsByClassName('grid-item')][i]
                }
            })
            // Upadate HTML based on the action type
            if (action.type == 'resource' || action.type == 'hub' || action.type == 'temple') {
                this.tileSelected.building = action.name;
                this.tileSelected.resource = null;
                if (action.name == 'growForest') {
                    this.tileSelected.terrainResource = 'forest';
                } else if (action.type == 'hub') {
                    city.population += city.getHubPopulation(action.name, this.tileSelected);
                } else if (action.type == 'temple') {
                    city.population++;
                } else if (action.type == 'resource') {
                    if (action.name == 'port' || action.name == 'farm' || action.name == 'mine') {
                        city.population += 2;
                    } else {
                        city.population++;
                    }
                    this.getSurroundingTiles(this.tileSelected).forEach(nearbyTile => {
                        if ((nearbyTile.building == 'customsHouse' && this.tileSelected.building == 'port') || (nearbyTile.building == 'windmill' && this.tileSelected.building == 'farm') || (nearbyTile.building == 'forge' && this.tileSelected.building == 'mine') || (nearbyTile.building == 'sawmill' && this.tileSelected.building == 'lumberHut')) {
                            city.population += 1; // If a hub is near, add 1 extra citizen
                        }
                    })
                }
            } else if (action.type == 'harvest') {
                if (action.name == 'clearForest') {
                    this.tileSelected.terrainResource = null;
                    city.tribe.balance += 1;
                } else if (action.name == 'burnForest') {
                    this.tileSelected.terrainResource = null;
                    this.tileSelected.resource = 'crop';
                } else if (action.name == 'whaleHunting') {
                    this.tileSelected.resource = null;
                    city.tribe.balance += 10;
                } else if (action.name == 'destroy') {
                    if (this.tileSelected.building == 'customsHouse' || this.tileSelected.building == 'windmill' || this.tileSelected.building == 'forge' || this.tileSelected.building == 'sawmill') {
                        city.population -= city.getHubPopulation(this.tileSelected.building, this.tileSelected);
                    } else {
                        this.getSurroundingTiles(this.tileSelected).forEach(nearbyTile => {
                            if ((nearbyTile.building == 'customsHouse' && this.tileSelected.building == 'port') || (nearbyTile.building == 'windmill' && this.tileSelected.building == 'farm') || (nearbyTile.building == 'forge' && this.tileSelected.building == 'mine') || (nearbyTile.building == 'sawmill' && this.tileSelected.building == 'lumberHut')) {
                                city.population -= 1; // If a hub is near, remove 1 from the hub, remove the rest later
                            }
                        })
                        this.tileSelected.building == 'port' || this.tileSelected.building == 'farm' || this.tileSelected.building == 'mine' ? city.population -= 2 : city.population -= 1;
                    }
                    // === Add a check for hubs === ///
                    this.tileSelected.building = null;
                } else {
                    city.population++;
                    this.tileSelected.resource = null;
                }
            }
            this.display(1);
        }
    }

    // Event listeneners
    eventListeners() {
        // Drag Map
        const body = document.body;
        body.addEventListener("mousedown", ()=>{
            body.addEventListener("mousemove", this.onDrag);
        });
        body.addEventListener("mouseup", ()=>{
            body.removeEventListener("mousemove", this.onDrag);
        });

        document.addEventListener('keypress', this.keyboardInputs);

        // Change the HTMLCollection into an iterable array on which 'foreach' can be used
        [...document.getElementsByClassName('grid-item')].forEach((gridItem, i) => {
            // Detect when tile is clicked
            let startX;
            let startY;
            gridItem.addEventListener('mousedown', function (event) {
                // if (event.target !== this) {
                    startX = event.clientX;
                    startY = event.clientY;
                // }
            });
            
            gridItem.addEventListener('mouseup', (event) => {
                // console.log(event.target, gridItem);
                // if (event.target !== this) {
                    const diffX = Math.abs(event.clientX - startX);
                    const diffY = Math.abs(event.clientY - startY);
                    if (diffX < 6 && diffY < 6) {
                        this.tileSelected = this.getTiles(this.grid)[i];
                        this.display(2, this.getTiles(this.grid)[i]);
                    }
                // }
            });
        });
        [...document.getElementsByTagName('path')].forEach(pathTag => {
            if (pathTag.outerHTML.includes('url(#techtreev5-fillStyle')) {
                pathTag.addEventListener('click', (event) => {
                    console.log(pathTag);
                });
            }
        })
    }

    // Keyboard inputs
    keyboardInputs (event) {
        var keyID = event.keyCode;
        switch (keyID) {
            case 43: // +
            case 46: // .
                game.zoom('plus');
                break;
            case 45: // -
            case 44: // ,
                game.zoom('minus');
                break;
            case 61: // =
            case 47: // /
                game.zoom('equal');
                break;
            case 119: // w
                game.onDrag({'movementX': 0, 'movementY': 100});
                break;
            case 115: // s
                game.onDrag({'movementX': 0, 'movementY': -100});
                break;
            case 97: // a
                game.onDrag({'movementX': 100, 'movementY': 0});
                break;
            case 100: // d
                game.onDrag({'movementX': -100, 'movementY': 0});
                break;
        }
    }

    nextTurn() {
        this.turn++;
        
        this.updateGridItems();
        this.currentTurnTribe.balance += this.currentTurnTribe.income;

        document.getElementById('balance').innerText = this.currentTurnTribe.balance;
        document.getElementById('turn').innerText = `${Math.floor(this.turn / this.tribes.length)}/30`;
        document.getElementById('tribeTurn').innerText = this.currentTurnTribe.name;
        console.log(`Turn: ${this.turn}, Income: ${this.currentTurnTribe.income}`);
    }

    // Dragging the grid around
    onDrag({movementX, movementY}){
        scrollBy(-movementX, -movementY);
    }

    // Zoom in and out
    zoom(result) {
        const gridContainer = document.getElementById('gridContainer');
        if (result == 'plus' && this.zoomLevel < 2) {
            this.zoomLevel += 0.2;
        } else if (result == 'minus' & this.zoomLevel > 0.5) {
            this.zoomLevel -= 0.2;
        } else if (result == 'equal') {
            zoomLevel = 1;
        }
        
        if (!this.zoomLevel < 2 || !this.zoomLevel > 0.5) {
            gridContainer.style.transform = `rotate(45deg) skew(-14deg, -14deg) scale(${this.zoomLevel})`;
        }
    }

    /**
     * Changes the CSS of elements to change the current display
     * @param {*} display
        - 0: Title Screen
        - 1: Default State (Stats and Menu)
        - 2: Detail State (Stats and Details)
     * @param {*} other 
     */
    display(display, tile) {
        const gridContainer = document.getElementById('gridContainer')
        const bottomBar = document.getElementById('bottomBar');
        const actionsBarSpan = document.querySelectorAll('#actionsBar span');
        const menuBar = document.getElementById('menuBar');
        const closeBtn = document.getElementById('closeBtn');
        const techTree = document.getElementById('techTree');
        const zoomBar = document.getElementById('zoomBar');
        const terrainDetailName = document.getElementById('terrainDetailName');
        const terrainDetailImg = document.getElementById('terrainDetailImg');

        switch (display) {
            case 0: // Main Menu
                console.log('The Menu hasn\'t yet been implemented');
                break;
            case 1: // Game Screen
                menuBar.style.display = 'block';
                gridContainer.style.display = 'grid';
                zoomBar.style.display = 'block'
                bottomBar.style.display = 'none';
                techTree.style.display = 'none';
                closeBtn.style.display = 'none';
                this.tileSelected = null;
                document.getElementById('balance').innerText = this.currentTurnTribe.balance;
                this.updateGridItems();
                break;
            case 2: // Tile Info
                menuBar.style.display = 'none';
                gridContainer.style.display = 'grid';
                bottomBar.style.display = 'block';
                if (tile.resource != null) {
                    terrainDetailName.innerText = this.capitalise(tile.resource);
                    terrainDetailImg.src = tile.resourceAsset;
                } else if (tile.terrainResource != null) {
                    terrainDetailName.innerText = this.capitalise(tile.terrainResource);
                    terrainDetailImg.src = tile.terrainResourceAsset;
                } else {
                    terrainDetailName.innerText = this.capitalise(tile.terrain);
                    terrainDetailImg.src = tile.terrainAsset;
                }
                console.log(tile);
                this.updateActions(tile);
                break;
            case 3: // Tech Tree
                techTree.style.display = 'block';
                closeBtn.style.display = 'block';
                menuBar.style.display = 'none';
                gridContainer.style.display = 'none';
                zoomBar.style.display = 'none';
                techTree.scrollIntoView();
        }
    }

    // Use to map out a range of keys from -1 and 1 to 0 and 1
    normalise(num) {
        let difference = num / 2;
        return 0.5 + difference;
    }

    /**
     * Returns a random number between 0 and specified number
     * @param {number} num Not included
     * @returns {number} Num between 0 and specified number
     */
    randInt(num) {
        return Math.floor(Math.random() * num);
    }

    distance(Ax, Ay, Bx, By) {
        return Math.hypot(Bx - Ax, By - Ay);
    }
    
    // Shuffles an array
    shuffleArray(array) {
        let counter = 0;
        let newArray = [];
        for (let i = array.length; i > 0; i--) {
            let randNum = this.randInt(array.length);
            newArray.push(array[randNum]);
            array.splice(randNum, 1);
            counter++;
        }
        return newArray;
    }

    // get all tiles from 2D grid array
    getTiles(array) {
        let newArray = [];
        array.forEach(element => {
            element.forEach(obj => {
                newArray.push(obj);
            })
        })
        return newArray;
    }

    capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

const game = new Game('continents', 'large', 100, [new Tribe('Ancients'), new Tribe('AiMo'), new Tribe('Zebasi'), new Tribe('Oumaji'), new Tribe('Polaris'), new Tribe('Quetzali')]);