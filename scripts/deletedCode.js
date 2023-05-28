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

// generateVillages() {
//     let capitals = 0;
//     let suitablePlaces = [];
//     for (let tile of this.getTiles(this.grid)) {
//         if (tile.terrain == 'field' && tile.x > 0 && tile.x < this.gridSize - 1 && tile.y > 0 && tile.y < this.gridSize - 1) {
//             suitablePlaces.push(tile);
//         }
//     }
//     for (let villages = 0; villages < this.numOfVilages; villages++) {
//         if (suitablePlaces.length != 0) {
//             let newVillageCoordinate = suitablePlaces[this.randInt(suitablePlaces.length)];

//             // Add capitals and villages
//             const city = new City(newVillageCoordinate.x, newVillageCoordinate.y, null, this.tribes[capitals]);
//             if (capitals < this.tribes.length) {
//                 city.type = 'capital';
//                 this.grid[newVillageCoordinate.y][newVillageCoordinate.x].terrainResource = 'city';
//                 this.grid[newVillageCoordinate.y][newVillageCoordinate.x].city = city;
//                 capitals += 1;
//             } else {
//                 city.type = 'village';
//                 this.grid[newVillageCoordinate.y][newVillageCoordinate.x].terrainResource = 'village';
//                 this.grid[newVillageCoordinate.y][newVillageCoordinate.x].city = city;
//             }

//             // Add borders
//             for (let y = -1; y < 2; y++) {
//                 for (let x = -1; x < 2; x++) {
//                     // Add borders to capitals only -> change resource generation based on borders for villages,
//                     // resources should be generated around them too.
//                     if (city.type == 'capital') {
//                         let tile = this.grid[newVillageCoordinate.y + y][newVillageCoordinate.x + x];
//                         tile.border = city;
//                         tile.biome = city.tribe.name;
//                         city.tiles.push(tile);
//                     }
//                 }
//             }

//             for (let y = -2; y < 3; y++) {
//                 for (let x = -2; x < 3; x++) {
//                     if (newVillageCoordinate.y + y >= 0 && newVillageCoordinate.x + x >= 0 && newVillageCoordinate.y + y <= this.gridSize - 1 && newVillageCoordinate.x + x <= this.gridSize - 1) {
//                         let tile = this.grid[newVillageCoordinate.y + y][newVillageCoordinate.x + x];

//                         // Remove tile from suitablePlaces array
//                         suitablePlaces.forEach((suitableTile, index) => {
//                             if (suitableTile == tile) {
//                                 suitablePlaces.splice(index, 1);
//                             }
//                         });
//                     }
//                 }
//             }

//             // for (let tile of this.getTiles(this.grid)) {
//             //     if (tile.x >= newVillageCoordinate.x - 1 && tile.x <= newVillageCoordinate.x + 1 && tile.y >= newVillageCoordinate.y - 1 && tile.y <= newVillageCoordinate.y + 1) {
//             //         tile.border = true;
//             //         city.tiles.push(tile);

//             //         // Remove tile from suitablePlaces array
//             //         suitablePlaces.forEach((suitableTile, index) => {
//             //             if (suitableTile == tile) {
//             //                 suitablePlaces.splice(index, 1);
//             //             }
//             //         });
//             //         // suitablePlaces[17 + (16 * (tile.y - 1)) + tile.x]
//             //     }
//             // }
//         } else {
//             console.log('No suitable places found.')
//         }
//     }
// }