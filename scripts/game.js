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

    initialiseGame() {
        this.setupGrid(); // Create Terrain & Biomes
        this.displayGrid(); // Display Grid
        this.eventListeners(); //Listen for inputs
        this.nextTurn();
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
            case 'simplexNoise':
                for (let x = 0; x < this.gridSize; x++) {
                    for (let y = 0; y < this.gridSize; y++) {
                        let i = x * this.gridSize + y;
                        const terrainLevel = this.normalise(simplexNoise.noise((x)/10, (y)/10, 0)) * 10;
                        if (terrainLevel < 1) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#ffffff')]);
                        } else if (terrainLevel < 2) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#cccccc')]);
                        } else if (terrainLevel < 3) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#a8a8a8')]);
                        } else if (terrainLevel < 4) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#8c8c8c')]);
                        } else if (terrainLevel < 5) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#6e6e6e')]);
                        } else if (terrainLevel < 6) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#6e6e6e')]);
                        } else if (terrainLevel < 7) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#525252')]);
                        } else if (terrainLevel < 8) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#383838')]);
                        } else if (terrainLevel < 9) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#212121')]);
                        } else if (terrainLevel < 10) {
                            this.grid.push([new simplexNoiseMapObject([x, y], 'neutral', '#000000')]);
                        }
                    }
                }
                break;
        }
        this.generateVillages();
        // this.generateBiomes();
        this.generateResources();
        // console.log(this.grid);
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
                    // this.grid.push([new Ocean([x, y], 'neutral')]);
                    this.grid[y].push(new Tile(x, y, 'ocean', null, false, 'Default'));
                } else {
                    this.grid[y].push(new Tile(x, y, 'field', null, false, 'Default'));
                    // if (x > 0 && x < this.gridSize - 1 && y > 0 && y < this.gridSize - 1) {
                        // this.grid.push([new Field([x, y], 'neutral', true, true)]);
                        // this.grid[y].push(new Tile(x, y, 'field', null, null, false, 'neutral'));
                    // } else {
                        // this.grid.push([new Field([x, y], 'neutral', false, true)]);
                    // }
                }
            }
        }

        // Change ocean tiles near land to shallow water tiles
        // for (let object of this.grid) {
        this.getTiles(this.grid).forEach(tile => {
            if (tile.terrain == 'ocean') {
                let x = tile.x;
                let y = tile.y;
                // console.log(this.grid[y * this.gridSize + x + 1]);
                // console.log(this.grid[y][x]);
                if (x + 1 <= this.gridSize - 1 && this.grid[y][x + 1].terrain == 'field') {
                    tile.terrain = 'water';
                    // object.unshift(new Water([x, y], 'neutral'));
                    // object.pop();
                } else if (x - 1 >= 0 && this.grid[y][x - 1].terrain == 'field') {
                    tile.terrain = 'water';
                    // object.unshift(new Water([x, y], 'neutral'));
                    // object.pop();
                } else if (y + 1 <= this.gridSize - 1 && this.grid[y + 1][x].terrain == 'field') {
                    tile.terrain = 'water';
                    // object.unshift(new Water([x, y], 'neutral'));
                    // object.pop();
                    // console.log(object);
                } else if (y - 1 >= 0 && this.grid[y - 1][x].terrain == 'field') {
                    tile.terrain = 'water';
                    // object.unshift(new Water([x, y], 'neutral'));
                    // object.pop();
                    // console.log(object);
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

                // Add borders
                // for (let y = -1; y < 2; y++) {
                //     for (let x = -1; x < 2; x++) {
                //         // Add borders to capitals only -> change resource generation based on borders for villages,
                //         // resources should be generated around them too.
                //         // if (city.type == 'capital') {
                //         //     let tile = this.grid[newVillageCoordinate.y + y][newVillageCoordinate.x + x];
                //         //     tile.border = city;
                //         //     tile.biome = city.tribe.name;
                //         //     city.tiles.push(tile);
                //         // }
                //     }
                // }

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
        
        // Assign a village to each tribe
        let tempIndex = Math.floor(Math.random() * villagesArray.length)
        capitalsArray.push(villagesArray[tempIndex]);
        villagesArray.splice(tempIndex, 1)

        for (let i = 0; i < this.tribes.length - 1; i++) {
            tempIndex = this.findFurthestPoint(capitalsArray, villagesArray);
            capitalsArray.push(villagesArray[tempIndex]);
            villagesArray.splice(tempIndex, 1)
        }

        for (let [key, capital] of Object.entries(capitalsArray)) {
            this.grid[capital.y][capital.x].terrainResource = 'city';
            capital.type = 'capital';
            capital.tribe = this.tribes[key];

            // Add borders
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    // Add borders to capitals only -> change resource generation based on borders for villages,
                    // resources should be generated around them too.
                    let tile = this.grid[capital.y + y][capital.x + x];
                    tile.border = capital;
                    tile.biome = capital.tribe.name;
                    capital.tiles.push(tile);
                }
            }
        }
        console.log(villagesArray, capitalsArray);
        // for (let [key, village] of Object.entries(villagesArray)) {

        // }
    }

    findFurthestPoint(capitalsArray, villagesArray) {
        let furthestPointIndex = null;
        let maxAverageDistance = -1;
        let minAverageDistance = Infinity;
        for (let [key, village] of Object.entries(villagesArray)) {
            let averageDistance = -1;
            // Add distance between village and capitals to the average distance
            for (let capital of capitalsArray) {
                averageDistance += Math.hypot(village.x - capital.x, village.y - capital.y);
            }
            // Divide by num of capitals to find average
            averageDistance /= capitalsArray.length;
            // Check if this village's average is greater than the previous maxAverage
            if (capitalsArray.length <= 4) {
                if (averageDistance > maxAverageDistance) {
                    maxAverageDistance = averageDistance;
                    furthestPointIndex = key;
                }
            } else {
                // Slightly better on average but can produce funkier terrain, find a better way to implement these
                if (averageDistance < minAverageDistance) {
                    minAverageDistance = averageDistance;
                    furthestPointIndex = key;
                }
            }
        }
        console.log(maxAverageDistance, furthestPointIndex);
        return furthestPointIndex;
    }

    generateBiomes() {
        this.getTiles(this.grid).forEach(tile => {
            if (tile.border) {
                console.log(tile.border);
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
                // tile.biome = tile.border.tribe.name;
            } else if (tile.city == null) {
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
            } else if(tile.city.type == 'capital') {
                // tile.biome = tile.city.tribe.name;
            }
        }
    }

    // Grid container
    displayGrid() {
        const gridContainer = document.createElement('div');
        gridContainer.id = 'gridContainer';
        // let numberOfColumns = '';
        // for (let i = 0; i < this.gridSize; i++) {
        //     numberOfColumns += 'auto ';
        // }
        gridContainer.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        // gridContainer.style.gridTemplateColumns = numberOfColumns;
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

    // Grid items
    generateGridItems() {
        const gridContainer = document.getElementById('gridContainer');
        for (let tile of this.getTiles(this.grid)) {
            // console.log(tile.terrainAsset);
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-items';
            gridContainer.appendChild(gridItem);

            // Terrain Tile (Land / Water)
            const terrain = document.createElement('div');
            terrain.className = `terrain${tile.terrainAsset.includes('Water') ? ' water' : ''}${tile.terrainAsset.includes('Ground') ? ' land' : ''}`;
            terrain.style.backgroundImage = `url(${tile.terrainAsset})`;
            gridItem.appendChild(terrain);

            // Terrain Resource (Mountain / Trees / City / Village)
            const terrainResource = document.createElement('div');
            terrainResource.className = `terrain${tile.terrainResourceAsset.includes('Mountains') ? ' mountain' : ''}${tile.terrainResourceAsset.includes('Forests') ? ' forest' : ''}${tile.terrainResourceAsset.includes('Houses') ? ' city' : ''}${tile.terrainResourceAsset.includes('Village') ? ' village' : ''}`;
            terrainResource.style.backgroundImage = `url(${tile.terrainResourceAsset})`;
            gridItem.appendChild(terrainResource);

            // Resource Tile (Fruit / Crop / Animal / Metal / Fish / Whale)
            const resource = document.createElement('div');
            // resource.className = 'animal';
            resource.className = `terrain${tile.resourceAsset.includes('Fruit') ? ' fruit' : ''}${tile.resourceAsset.includes('Crop') ? ' crop' : ''}${tile.resourceAsset.includes('Animal') ? ' animal' : ''}${tile.resourceAsset.includes('Metal') ? ' metal' : ''}${tile.resourceAsset.includes('Fish') ? ' fish' : ''}${tile.resourceAsset.includes('Whale') ? ' whale' : ''}`;
            let img = document.createElement('img');
            img.src = tile.resourceAsset;
            // img.src = './assets/Resources/Animals/Animal_1.png';
            img.onload = function () {
                if (tile.resource != 'metal') {
                    resource.style.backgroundSize = `${(img.naturalHeight < img.naturalWidth ? (img.naturalHeight/img.naturalWidth) : (img.naturalWidth/img.naturalHeight))*100}% 100%`;
                }
                resource.style.backgroundImage = `url(${tile.resourceAsset})`;
                // resource.style.backgroundImage = `url('./assets/Resources/Animals/Animal_1.png')`;
                // console.log(img.naturalWidth, img.naturalHeight);
                img.remove();
            }
            gridItem.appendChild(resource);

            // Experiment
            // const exp = document.createElement('img');
            // exp.className = `exp`;
            // exp.style.backgroundImage = `url(./assets/Resources/Animals/Animal_AiMo.png)`;
            // gridItem.appendChild(exp);

            // Display Resources
            // const gridItemResource = document.createElement('div');
            // // gridItemResource.classList.add('circle');
            // gridItemResource.className = 'circle';
            // gridItemResource.backgroundColor = tile.resourceColor;
            // gridItemResource.style.width = `${this.tileSize - 20}px`;
            // gridItemResource.style.height = `${this.tileSize - 20}px`;
            // gridItem.appendChild(gridItemResource);
            
            // Inner Text Div
            // const gridItemText = document.createElement('div');
            // gridItemText.innerText = `(${tile.x}, ${tile.y})`;
            // gridItemText.style.width = `${this.tileSize - 2}px`;
            // gridItemText.style.height = `${this.tileSize - 2}px`;
            // gridItem.appendChild(gridItemText);
        }
        // for (let i = 0; i < this.grid.length; i++) {
        //     // Main Grid Item Div
        //     let object = this.grid[i].at(-1);
        //     const gridItem = document.createElement('div');
        //     gridItem.className = 'grid-items';
        //     if (object.getClassName() == 'VillageBorder') {
        //         gridItem.style.outline = `3px solid ${object.getColor()}`;
        //         gridItem.style.zIndex = 2;
        //         gridItem.style.backgroundColor = this.grid[i].at(-2).getColor();
        //     } else {
        //         gridItem.style.backgroundColor = object.getColor();
        //     }
        //     // gridItem.style.backgroundImage = `url(./assets/terrain/fuji0006.png)`;
        //     gridContainer.appendChild(gridItem);

        //     // const gridImage = document.createElement('img');
        //     // gridImage.src = './assets/terrain/fuji0006.png';
        //     // gridImage.width = gridItem.width;
        //     // gridImage.height = gridItem.height;
        //     // gridItem.appendChild(gridImage);
            
        //     // Inner Text Div
        //     const gridItemText = document.createElement('div');
        //     gridItemText.innerText = `(${object.getPosX()}, ${object.getPosY()})`;
        //     gridItemText.style.width = `${this.tileSize - 2}px`;
        //     gridItemText.style.height = `${this.tileSize - 2}px`;
        //     gridItem.appendChild(gridItemText);
        // }

        // for (let x = this.gridSize; x > 0; x--) {
        //     for (let y = this.gridSize; y > 0; y--) {
        //         const gridItem = document.createElement('div');
        //         gridItem.className = 'grid-items';
        //         document.getElementById('gridContainer').appendChild(gridItem);
        
        //         // const gridImage = document.createElement('img');
        //         // gridImage.src = './assests/terrain/fuji0006.png';
        //         // // gridImage.width = `${this.tileSize - 2}px`;
        //         // // gridImage.height = `${this.tileSize - 2}px`;
        //         // gridImage.width = '50px';
        //         // gridImage.height = '50px';
        //         // gridItem.appendChild(gridImage);
        //     }
        // }
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

        // console.log(document.getElementsByClassName('grid-items')[0]);

        // Change the HTMLCollection into an iterable array on which 'foreach' can be used
        [...document.getElementsByClassName('grid-items')].forEach((gridItem, i) => {
            // Detect when tile is clicked
            let startX;
            let startY;
            gridItem.addEventListener('mousedown', function (event) {
                startX = event.clientX;
                startY = event.clientY;
            });
            
            gridItem.addEventListener('mouseup', (event) => {
                const diffX = Math.abs(event.clientX - startX);
                const diffY = Math.abs(event.clientY - startY);
                if (diffX < 6 && diffY < 6) {
                    this.display(2, this.getTiles(this.grid)[i]);
                }
            });
        });
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

    play() {
        console.log(this.turn % this.tribes.length);
        console.log(this.tribes[this.turn % this.tribes.length]);
    }

    nextTurn() {
        this.turn++;
        document.getElementById('turn').innerText = `${Math.floor(this.turn / this.tribes.length)}/30`;
        document.getElementById('tribeTurn').innerText = this.tribes[this.turn % this.tribes.length].name;
        console.log(`Turn: ${this.turn}`);
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
        const actionsBar = document.querySelectorAll('#actionsBar span');
        const menuBar = document.getElementById('menuBar');
        const closeBtn = document.getElementById('closeBtn');
        const techTree = document.getElementById('techTree');
        const zoomBar = document.getElementById('zoomBar');
        const terrainDetail = document.getElementById('terrainDetail');

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
                break;
            case 2: // Tile Info
                menuBar.style.display = 'none';
                gridContainer.style.display = 'grid';
                bottomBar.style.display = 'block';
                terrainDetail.innerText = this.capitalise(tile.terrain);
                console.log(tile);
                // console.log(tile.border.tribe);
                if (tile.border != null && tile.border.type == 'capital' && tile.border.tribe == this.tribes[this.turn % this.tribes.length]) {
                    actionsBar.forEach((action) => {
                        action.style.display = 'block';
                    });
                } else {
                    actionsBar.forEach((action) => {
                        action.style.display = 'none';
                    });
                }
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

    mainPage() {
        const bottomBar = document.getElementById('bottomBar');
        const menuBar = document.getElementById('menuBar');
        menuBar.style.display = 'block';
        bottomBar.style.display = 'none';
    }

    // Make the tribe count fits the map type by adding "default" tribes
    // fillInTribes(num) {
    //     if (this.tribes.length < num) {
    //         for (let i = this.tribes.length; i < num; i++) {
    //             this.tribes.push('default');
    //         }
    //     }
    //     this.tribes = this.shuffleArray(this.tribes);
    //     console.log(this.tribes);
    // }

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

// const game = new Game('continents', 'normal', 100, ['oumaji', 'polaris', 'bardur', 'imperius']);
// const game = new Game('continents', 'normal', 100, [new XinXi(), new Imperius(), new Bardur(), new Oumaji()]);
const game = new Game('continents', 'large', 100, [new Tribe('AiMo'), new Tribe('Vengir'), new Tribe('Bardur'), new Tribe('Oumaji'), new Tribe('Polaris'), new Tribe('Quetzali')]);