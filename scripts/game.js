class Game {
    constructor(mapType, mapSize, tileSize, players) {
        this.mapType = mapType;
        this.tileSize = tileSize;
        this.players = players;
        this.grid = [];
        this.zoomLevel = 1;
        
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
        this.generateGridLayout();
        this.generateGridContainer();
        this.generateGridItems();
        this.setupBody();
        this.eventListeners();
    }

    // Generate Terrain
    generateGridLayout() {
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
            case 'perlin':
                for (let x = 0; x < this.gridSize; x++) {
                    for (let y = 0; y < this.gridSize; y++) {
                        let i = x * this.gridSize + y;
                        const terrainLevel = this.normalise(perlin.noise((x)/10, (y)/10, 0)) * 10;
                        if (terrainLevel < 1) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#ffffff')]);
                        } else if (terrainLevel < 2) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#cccccc')]);
                        } else if (terrainLevel < 3) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#a8a8a8')]);
                        } else if (terrainLevel < 4) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#8c8c8c')]);
                        } else if (terrainLevel < 5) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#6e6e6e')]);
                        } else if (terrainLevel < 6) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#6e6e6e')]);
                        } else if (terrainLevel < 7) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#525252')]);
                        } else if (terrainLevel < 8) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#383838')]);
                        } else if (terrainLevel < 9) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#212121')]);
                        } else if (terrainLevel < 10) {
                            this.grid.push([new PerlinMapObject([x, y], 'neutral', '#000000')]);
                        }
                    }
                }
                break;
        }
        this.generateVillages();
        this.generateBiomes();
        this.generateResources();
        console.log(this.grid);
    }

    /**
     * @param {Integer} divider The number dividing x and y in the perlin function
     * @param {Integer} multiplier The number multiplied with the perlin function
     * @param {Integer} waterTerrainLevel The height of water
     */
    generateTerrain(divider, multiplier, waterTerrainLevel) {
        const perlin = new SimplexNoise();
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let i = y * this.gridSize + x;
                const terrainLevel = this.normalise(perlin.noise((x + 100)/divider, (y + 100)/divider, 0)) * multiplier;
                if (terrainLevel < waterTerrainLevel) {
                    this.grid.push([new Ocean([x, y], 'neutral')]);
                } else if (terrainLevel < 10) {
                    if (x > 0 && x < this.gridSize - 1 && y > 0 && y < this.gridSize - 1) {
                        this.grid.push([new Field([x, y], 'neutral', true, true)]);
                    } else {
                        this.grid.push([new Field([x, y], 'neutral', false, true)]);
                    }
                }
            }
        }

        // Change ocean tiles near land to water tiles
        for (let object of this.grid) {
            if (object[0].getClassName() == 'Ocean') {
                let x = object[0].getPosX();
                let y = object[0].getPosY();
                // console.log(object[0].position);
                if (x + 1 <= this.gridSize - 1 && this.grid[y * this.gridSize + x + 1][0].getClassName() == 'Field') {
                    object.unshift(new Water([x, y], 'neutral'));
                    object.pop();
                } else if (x - 1 >= 0 && this.grid[y * this.gridSize + x - 1][0].getClassName() == 'Field') {
                    object.unshift(new Water([x, y], 'neutral'));
                    object.pop();
                } else if (y + 1 <= this.gridSize - 1 && this.grid[(y + 1) * this.gridSize + x][0].getClassName() == 'Field') {
                    object.unshift(new Water([x, y], 'neutral'));
                    object.pop();
                    // console.log(object);
                } else if (y - 1 >= 0 && this.grid[(y - 1) * this.gridSize + x][0].getClassName() == 'Field') {
                    object.unshift(new Water([x, y], 'neutral'));
                    object.pop();
                    // console.log(object);
                }
            }
        }
    }
    
    // Generate the villages and capitals
    generateVillages() {
        let capitals = 0;
        for (let villages = 0; villages < this.numOfVilages; villages++) {
            let suitablePlaces = [];
            for (let object of this.grid) {
                if (object[0].suitability) {
                    suitablePlaces.push(object[0]);
                }
            }
            if (suitablePlaces.length != 0) {
                let newVillageCoordinates = suitablePlaces[this.randInt(suitablePlaces.length)];
                for (let object of this.grid) {
                    if (object[0].getPosX() >= newVillageCoordinates.getPosX() - 2 && object[0].getPosX() <= newVillageCoordinates.getPosX() + 2 && object[0].getPosY() >= newVillageCoordinates.getPosY() - 2 && object[0].getPosY() <= newVillageCoordinates.getPosY() + 2) {
                        object[0].suitability = false;
                        object[0].outerCity = false;
                        if (object[0].getPosX() == newVillageCoordinates.getPosX() && object[0].getPosY() == newVillageCoordinates.getPosY()) {
                            if (capitals < this.players.length) {
                                object.push(new Capital([newVillageCoordinates.getPosX(), newVillageCoordinates.getPosY()], this.players[capitals], newVillageCoordinates.suitability));
                                capitals += 1;
                            } else {
                                object.push(new Village([newVillageCoordinates.getPosX(), newVillageCoordinates.getPosY()], newVillageCoordinates.tribe, newVillageCoordinates.suitability));
                            }
                        } else if (object[0].getPosX() >= newVillageCoordinates.getPosX() - 1 && object[0].getPosX() <= newVillageCoordinates.getPosX() + 1 && object[0].getPosY() >= newVillageCoordinates.getPosY() - 1 && object[0].getPosY() <= newVillageCoordinates.getPosY() + 1) {
                            object.push(new VillageBorder([object[0].getPosX(), object[0].getPosY()], object[0].tribe, object[0].suitability));
                        }
                    }
                }
            } else {
                console.log('No suitable places found.')
            }
        }
    }

    generateBiomes() {

    }

    generateResources() {
        for (let object of this.grid) {
            let randNum = Math.random();
            if (object[0].outerCity) {
                
            } else {

            }
        }
    }

    // Grid container
    generateGridContainer() {
        const gridContainer = document.createElement('div');
        gridContainer.id = 'grid-container';
        let numberOfColumns = '';
        for (let i = 0; i < this.gridSize; i++) {
            numberOfColumns += 'auto ';
        }
        gridContainer.style.gridTemplateColumns = numberOfColumns;
        gridContainer.style.height = `${this.tileSize * this.gridSize}px`;
        gridContainer.style.width = `${this.tileSize * this.gridSize}px`;
        document.body.appendChild(gridContainer);

        this.setupBody(gridContainer);
    }

    // Grid items
    generateGridItems() {
        for (let i = 0; i < this.grid.length; i++) {
            let object = this.grid[i].at(-1);
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-items';
            gridItem.style.backgroundColor = object.getColor();
            document.getElementById('grid-container').appendChild(gridItem);
            const gridItemText = document.createElement('div');
            gridItemText.innerText = `(${object.getPosX()}, ${object.getPosY()})`;
            // gridItemText.innerText = `(${object.getPosX()}, ${object.getPosY()}), ${this.grid[i][2]}`;
            gridItemText.style.width = `${this.tileSize - 2}px`;
            gridItemText.style.height = `${this.tileSize - 2}px`;
            gridItem.appendChild(gridItemText);
        }

        // for (let x = this.gridSize; x > 0; x--) {
        //     for (let y = this.gridSize; y > 0; y--) {
        //         const gridItem = document.createElement('div');
        //         gridItem.className = 'grid-items';
        //         document.getElementById('grid-container').appendChild(gridItem);
        
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

    // Body setup
    setupBody() {
        const body = document.body;
        const containerSize = document.getElementById('grid-container').getBoundingClientRect();
        body.style.height = `${Math.abs(containerSize.top) + Math.abs(containerSize.bottom)}px`;
        body.style.width = `${Math.abs(containerSize.left) + Math.abs(containerSize.right)}px`;
        body.style.margin = '150px';
    }

    // Event listeneners
    eventListeners() {
        const body = document.body;
        body.addEventListener("mousedown", ()=>{
            body.addEventListener("mousemove", this.onDrag);
        });

        body.addEventListener("mouseup", ()=>{
            body.removeEventListener("mousemove", this.onDrag);
        });

        document.addEventListener('keypress', this.keyboardInputs);
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

    // Dragging the grid around
    onDrag({movementX, movementY}){
        scrollBy(-movementX, -movementY);
    }

    // Zoom in and out
    zoom(result) {
        const gridContainer = document.getElementById('grid-container');
        if (result == 'plus' && this.zoomLevel < 2) {
            this.zoomLevel += 0.2;
        } else if (result == 'minus' & this.zoomLevel > 0.5) {
            this.zoomLevel -= 0.2;
        } else if (result == 'equal') {
            this.zoomLevel = 1;
        }
        
        if (!this.zoomLevel < 2 || !this.zoomLevel > 0.5) {
            gridContainer.style.transform = `rotate(45deg) skew(-20deg, -20deg) scale(${this.zoomLevel})`;
            this.setupBody();
        }
    }

    // Make the player count fit the map type by adding "default" players
    // fillInPlayers(num) {
    //     if (this.players.length < num) {
    //         for (let i = this.players.length; i < num; i++) {
    //             this.players.push('default');
    //         }
    //     }
    //     this.players = this.shuffleArray(this.players);
    //     console.log(this.players);
    // }

    // Use to map out a range of keys from -1 and 1 to 0 and 1
    normalise(num) {
        let difference = num / 2;
        return 0.5 + difference;
    }

    // Returns random number between 0 and specified number
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
}
// const game = new Game('continents', 'normal', 100, ['oumaji', 'polaris', 'bardur', 'imperius']);
const game = new Game('continents', 'normal', 100, [new Xinxi(), new Imperius(), new Bardur(), new Oumaji()]);
//*** Code I removed ***
// generateGridCoordinates() {
//     for (let x = 0; x < this.gridSize; x++) {
//         for (let y = 0; y < this.gridSize; y++) {
//             this.grid.push([x, y]);
//         }
//     }
// }

// ** I thought of a better idea **
// Generate Biome Map
// generateBiomeLayout() {
//     const numOfPlayers = this.players.length;
//     switch (this.gridSize) {
//         case 11:
//             if (numOfPlayers <= 2) {
//                 this.fillInPlayers(2);
//                 for (let i = 0; i < this.grid.length; i++) {
//                     const x = this.grid[i][0];
//                     if (x <= 5) {
//                         this.grid[i].push(this.players[0]);
//                     } else if (x >= 7) {
//                         this.grid[i].push(this.players[1]);
//                     } else {
//                         this.grid[i].push('tbd');
//                         // this.grid[i].push(this.players[this.randInt(2) - 1]);
//                     }
//                 }
//                 this.generateRandomBiome();
//             } else if (numOfPlayers <= 4) {
//                 this.fillInPlayers(4);
//                 for (let i = 0; i < this.grid.length; i++) {
//                     const x = this.grid[i][0];
//                     const y = this.grid[i][1];
//                     if (x <= 5 && y <= 5) {
//                         this.grid[i].push(this.players[0]);
//                     } else if (x <= 5 && y >= 7) {
//                         this.grid[i].push(this.players[1]);
//                     } else if (x >= 7 && y <= 5) {
//                         this.grid[i].push(this.players[2]);
//                     } else if (x >= 7 && y >= 7) {
//                         this.grid[i].push(this.players[3]);
//                     } else {
//                         this.grid[i].push('tbd');
//                     }
//                 }
//                 this.generateRandomBiome();
//             } else if (numOfPlayers <= 9) {
//                 this.fillInPlayers(9);
//                 for (let x = this.gridSize; x > 0; x--) {
//                     for (let y = this.gridSize; y > 0; y--) {

//                     }
//                 }
//                 this.generateRandomBiome();
//             }
//             break;
//         case 14:
//             break;
//         case 16:
//             break;
//         case 18:
//             break;
//         case 20:
//             break;
//         case 30:
//             break;
//         default:
//             console.log('NOT A VALID MAP SIZE');
//     }
// }

// Fill in the unassigned biomes
// generateRandomBiome() {
//     for (let x = 0; x < this.gridSize; x++) {
//         for (let y = 0; y < this.gridSize; y++) {
//             let surroundingBiomes = [];
//             if (this.grid[(x * this.gridSize) + y][2] == 'tbd') {
//                 console.log(`${this.grid[(x * this.gridSize) + y][0]} : ${this.grid[(x * this.gridSize) + y][1]}`)
//                 let biomeList = [];
//                 try {
//                     biomeList.push(this.grid[((x - 1) * this.gridSize) + y][2]);
//                     console.log(this.grid[((x - 1) * this.gridSize) + y])
//                 } catch (error) {}
//                 try {
//                     biomeList.push(this.grid[((x + 1) * this.gridSize) + y][2]);
//                     console.log(this.grid[((x + 1) * this.gridSize) + y])
//                 } catch (error) {}
//                 try {
//                     biomeList.push(this.grid[(x * this.gridSize) + y - 1][2]);
//                     console.log(this.grid[(x * this.gridSize) + (y - 1)])
//                 } catch (error) {}
//                 try {
//                     biomeList.push(this.grid[(x * this.gridSize) + y + 1][2]);
//                     console.log(this.grid[(x * this.gridSize) + (y + 1)])
//                 } catch (error) {}

//                 let tempBiomeList = [];
//                 for (let biome of biomeList) {
//                     if (biome !== 'tbd') {
//                         tempBiomeList.push(biome);
//                     }
//                 }
//                 tempBiomeList.unshift(x, y);

//                 console.log(tempBiomeList);
//                 surroundingBiomes.push(tempBiomeList);
//             }
//         }
//     }
//     // this.grid[(x * this.gridSize) + y][2] =
// }