import { defs, tiny } from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js'
import {Text_Line} from './examples/text-demo.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Texture, Scene,
} = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong } = defs;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Car {
    constructor(model_transform, color, direction) {
        this.model_transform = model_transform;
        //let colors = [hex_color("#FF0000"), hex_color("#00FF00"), hex_color("#673AB7"), hex_color("#03A9F4"), hex_color("#FFFF33")]; // red, green, purple, blue, yellow
        //this.color = colors[Math.floor(Math.random() * 5)];
        this.color = Math.floor(Math.random() * 3); // 0 = red, 1 = blue, 2 = black
        this.direction = direction
        //may also need a car type if we have multiple types of cars
    }

    getDirection() {
        return this.direction; // 1 = right, -1 = left
    }

    getPosition() {
        return this.model_transform; 
    }

    getColor() {
        return this.color;
    }

    setPosition(pos) {
        this.model_transform = pos; 
    }
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}


export class DodgeBoat extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        const initial_corner_point = vec3(-15, -15, 0);
        const row_operation = (s, p) => p ? Mat4.translation(0, .2, 0).times(p.to4(1)).to3()
            : initial_corner_point;
        const column_operation = (t, p) => Mat4.translation(.2, 0, 0).times(p.to4(1)).to3();

        this.shapes = {
            sheet: new defs.Grid_Patch(150, 150, row_operation, column_operation),
            lane: new defs.Grid_Patch(20, 200, row_operation, column_operation, [[0, 10], [0, 1]]),
            cube: new Cube(),
            car: new Shape_From_File("assets/car_test1.obj"),
            sphere: new defs.Subdivision_Sphere(2),
            rock: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            bear: new Shape_From_File("assets/boat.obj"),
            tree: new Shape_From_File("assets/tree.obj"),
            bush: new Shape_From_File("assets/bush_files/eb_house_plant_01.obj"),
            leaf: new Shape_From_File("assets/lilypad1.obj"),
            frog: new Shape_From_File("assets/20436_Frog_v1.obj"),
            text: new Text_Line(35),
            coin: new Shape_From_File("assets/coin.obj")
        };

        // *** Materials
        this.materials = {
            floor: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#C1F376") }),
            road: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#555555") }),
            texturedGrass: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/grasslane.jpg")
            }),
            texturedRiver: new Material(new  Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/riverlane.jpg")
            }),
            texturedRoad: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/roadlane.png") // roadlane.png or road2.jpg
            }),
            river: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#59bfff") }),
            bruin: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/nolegbear_texture.png") }),   
            red_car: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/new_redcar_texture.png") }),   
            blue_car: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/new_bluecar_texture.png") }),   
            black_car: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/new_blackcar_texture.png") }),                   
            rock: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#999999") }),
            leaf: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#13ae4b") }),
            tree: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/tree_texture.png") }),
            bush: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#002800") }),
            frog: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#25D900") }),
            coin: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, specularity: 0.8, color: hex_color("#FFD700") }),
            endScreen: new Material(new defs.Phong_Shader(), {
                    color: hex_color("#1E3F66"), ambient: 1,
                    diffusivity: 0.6, specularity:0.1
            }),
            text_image: new Material(new defs.Textured_Phong(1), {
                    ambient: 1, diffusivity: 0, specularity: 0,
                    texture: new Texture("assets/text.png")
            })     
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 20, 10), vec3(0, 0, 0), vec3(0, -1, 0));

        this.coin_sound = new sound("assets/coin-sound.mp3");

        this.setup_game(); 
    }

    setup_game() {
        // detect movements 
        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.playerMoved = false; 
        this.playerDirection = "north";
        // player's model transform 
        this.player_transform = Mat4.identity().times(Mat4.translation(0, -1, 1));
        this.attached = this.player_transform

        this.camera_location = this.initial_camera_location;

        this.lane_type = []; // holds randomly generated type of lane for all lanes  (0 = grass, 1 = road, 2 == river)
        this.lane_num = 1000; // constant for max number of generated lanes
        this.generate_lanes();

        this.frog_position=vec3(0,0,0);

        this.rock_positions = {}; // dictionary for rocks positions: key = lane number, value = placement in lane 
        this.tree_positions = {}; // dictionary for trees positions: key = lane number, value = placement in lane
        this.bush_positions = {}; // dictionary for trees positions: key = lane number, value = placement in lane
        this.coin_positions = {}; // dictionary for coin positions: key = lane number, value = placement in lane
        this.leaf_positions = {};  // dictionary for leaf positions: key = lane number, value = array/list for all placements of leafs in lane ({0: [2, 3, 12]})
        this.frog_positions = {};
        this.car_positions = {}; // dictionary for car positions: key = lane number, value = array/list of Mat4 (model transforms) for all cars in lane
        this.generate_rocks_and_leafs();
        this.generate_cars(); 

        this.car_lane_min = 0; 
        this.car_lane_max = 19; 

        this.car_speed = 0.1;  
        this.score = 0;
        this.coin_count = 0; 

        this.game_ended = false; // set this to true if player collided and game is over

        this.origin = null; 

        this.isJumping = false; 
        
    }

    generate_lanes() {
        var lane = [];
        // first 4 lanes are grass so that player doesn't immediately get hit by a car
        for (let i = 0; i < 4; i++) {
            lane.push(0);
        }
        for (let i = 4; i < this.lane_num; i++) {
            let val = Math.floor(Math.random() * 11);
            if (val < 5) {
                lane.push(0); // grass: 5/11 probability
            }
            else if (val < 10) {
                lane.push(1); //road: 5/11 probability
            }
            else {
                lane.push(2); // river has 1/11 probability
            }
        }
        this.lane_type = lane;
    }

    generate_rocks_and_leafs() {
        var rock_pos = {};
        var leaf_pos = {};
        var tree_pos = {};
        var bush_pos = {};
        var coin_pos = {};
        var frog_pos = {};
        // start indices from 4 because first 4 lanes should have no obstacles, so that player doesn't start on an obstacle
        for (let i = 4; i < this.lane_num; i++) {
            //generate rocks on grass areas
            //should_generate_rocks tells us whether or not we should add a rock to the lane (0 = no, 1 = yes)
            // var should_generate_rock = Math.floor(Math.random() * 2);
            var random_v = Math.random();
            if (this.lane_type[i] === 0) { // only add rock or tree if lane type is 0 (grass)
                var pos = Math.floor(Math.random() * 13); // gets random position for rock in lane
                var coin_p = Math.floor(Math.random() * 13); 
                var new_pos = pos < 6 ? (-1*pos) : (pos-7);
                if (random_v < 0.35) { // 35% chance of rock
                    rock_pos[i] = new_pos;
                }
                else if (random_v < 0.70) { // 35% chance of tree
                    tree_pos[i] = new_pos;
                }
                else { // 30% chance of bush
                    bush_pos[i] = new_pos;
                }

                if(Math.floor(Math.random() * 2) && coin_p !== pos) { // coins!
                    coin_pos[i] = coin_p < 6 ? (-1*coin_p) : (coin_p-7);
                }
            }
            //generate leafs for river
            //only add leaf if lane type is 2 (river)
            else if (this.lane_type[i] === 2) {
                // all river lanes needed at least 2 leaf so player can cross
                // generate a random number between 2 and 6 for the number of leafs in a lane
                let num_leafs = Math.floor(Math.random() *5);
                leaf_pos[i] = [];
                for (let j = 0; j < num_leafs + 2; j++) { // find a random position for all n leafs
                    let pos = Math.floor(Math.random() * 13);

                    if(num_leafs > 1 && j === 0) {
                        frog_pos[i] = pos < 6 ? (-1 * pos) : (pos - 7);
                    }
                    
                    if (pos < 6) {
                        leaf_pos[i].push(-1 * pos);
                        
                    } else {
                        leaf_pos[i].push(pos - 7);
                    }
                }

                if(i !== 0 && this.lane_type[i-1] === 2) {
                    leaf_pos[i-1].push(leaf_pos[i][0]); // at least one leaf needs to be in the same column if there are two rivers in a row
             
                }
            }
        }
        this.rock_positions = rock_pos;
        this.leaf_positions = leaf_pos;
        this.tree_positions = tree_pos;
        this.bush_positions = bush_pos;
        this.coin_positions = coin_pos; 
        this.frog_positions = frog_pos; 
        //console.log(this.rock_positions)
    }

    

    generate_cars_for_lane() {
        var pos = []; 
        let direction = Math.floor(Math.random() * 2) == 0? -1 : 1; 
        var x_pos = Math.floor(Math.random() * 5) - 15;
        let car_num = Math.floor(Math.random() * 2) == 0 ? 3 : 2; // vary car num per lane so it doesn't look too uniform
        if(this.score > 30) {
            car_num = Math.floor(Math.random() * 3) + 2; 
        } 
        for(let i = 0; i < car_num; i++) {
            var dist_between = Math.floor(Math.random() * 4); // get random distance between cars
            let car_transform = Mat4.identity().times(Mat4.translation(dist_between + x_pos, -1, 1));
            pos.push(new Car(car_transform, 0, direction)); 
            //pos.push(Mat4.identity().times(Mat4.translation(dist_between + x_pos, -1, 1)));
            x_pos += (car_num == 3 ? 13 : (car_num == 2 ? 17 : 9)) + dist_between;
        }
        return pos; 
    }

    generate_cars() {
        // start off game by only generating 20 lanes of car positions to save memory/be more efficient - use dynamic instantiation as game goes on
        var car_pos = {};
        for(let i = 0; i < 20; i++) {
            car_pos[i] = this.generate_cars_for_lane();
        }
        this.car_positions = car_pos;
        //console.log(this.car_positions);
    }

    make_control_panel() {
        this.live_string(box => {
            box.textContent = "Score: " + (this.score < 0 ? 0 : this.score)
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = "Coins: " + this.coin_count
        });
        this.new_line();
        this.new_line();
        this.key_triggered_button("Up", ["u"], () => {
            this.moveUp = true;
            this.playerMoved = true;
        });
        this.key_triggered_button("Down", ["j"], () => {
            this.moveDown = true;
            this.playerMoved = true;
        });
        this.key_triggered_button("Left", ["h"], () => {
            this.moveLeft = true;
            this.playerMoved = true;
        });
        this.key_triggered_button("Right", ["k"], () => {
            this.moveRight = true;
            this.playerMoved = true;
        });
        this.new_line(); 
        this.new_line(); 
        this.key_triggered_button("Restart", ["r"], () => {
            this.setup_game(); 
        });

    }

    // NOTE: still need to figure out how to get camera to be angled
    // sets camera to be in player's pov (follows player)
    set_camera_view(program_state) {
        if (this.attached != undefined) {
            var blending_factor = 0.1, desired;
            desired = Mat4.inverse(this.attached.times(Mat4.translation(4, -35, 25))
                                                .times(Mat4.rotation(Math.PI/3, 1, 0, 0))
                                                .times(Mat4.scale(0.4, 0.4, 1)));
            desired = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, blending_factor));
            program_state.set_camera(desired);
        }
    }

    // returns false if there is an obstacle, otherwise true
    player_can_move(pos, lane) {
        let playerX = pos[0][3];
        let playerY = pos[1][3];
        let laneYCoords = -13 + (lane*4);

        //console.log(playerY, laneYCoords);

        //check that player did not go out of bounds
        if(playerX < -14 || playerX > 24 || this.score === -4 || this.score > this.lane_num) {
            //this.game_ended = true; 
        }

        //check collision detection for rocks and trees
        if (this.lane_type[lane] === 0) {
            if (this.rock_positions[lane] !== undefined) {
                var rock_transform = Mat4.identity().times(Mat4.translation(3 + this.rock_positions[lane] * 3, laneYCoords, 1));
                var rockX = rock_transform[0][3];
                var rockY = rock_transform[1][3];
                
                if(Math.sqrt(Math.pow(rockX - playerX, 2) + Math.pow(rockY - playerY, 2)) < 1) {
                    //return false; 
                }
            }
            else if(this.tree_positions[lane] !== undefined) {
                var tree_transform = Mat4.identity().times(Mat4.translation(3 + this.tree_positions[lane] * 3, laneYCoords, 2))
                                                    .times(Mat4.rotation(90, 1, 0, 0));
                var treeX = tree_transform[0][3];
                var treeY = tree_transform[1][3];
                if(Math.sqrt(Math.pow(treeX - playerX, 2) + Math.pow(treeY - playerY, 2)) < 1) {
                    //return false; 
                }
            }
            else if(this.bush_positions[lane] !== undefined) {
                var bush_transform = Mat4.identity().times(Mat4.translation(3 + this.bush_positions[lane] * 3, laneYCoords, 2))
                                                    .times(Mat4.rotation(90, 1, 0, 0));
                var bushX = bush_transform[0][3];
                var bushY = bush_transform[1][3];
                if(Math.sqrt(Math.pow(bushX - playerX, 2) + Math.pow(bushY - playerY, 2)) < 1) {
                    //return false;
                }
            }

            if(this.coin_positions[lane] !== undefined) {
                var coin_transform = Mat4.identity().times(Mat4.translation(3 + this.coin_positions[lane] * 3, laneYCoords , 1)); 
                var coinX = coin_transform[0][3];
                var coinY = coin_transform[1][3];

                if(Math.sqrt(Math.pow(coinX - playerX, 2) + Math.pow(coinY - playerY, 2)) < 1) {
                    //this.coin_count += 1; 
                    //this.coin_sound.play(); 
                    //delete this.coin_positions[lane]; 
                }
            }
        }
        return true; 
    }

    // if player hits one of the movement keys, translate player's coordinates in that direction 
    move_player() {
        if (this.moveUp) {
            if(this.player_can_move(this.player_transform.times(Mat4.translation(0, 4, 0)), this.score + 4)) {
                this.player_transform = this.player_transform.times(Mat4.translation(0, 4, 0));
                this.score += 1;
                this.car_speed += .001; // as the score gets higher, car speed gets faster too

                this.car_dynamic_instantiation(1);
            }
            else {
                this.origin = this.player_transform; 
                this.player_transform = this.player_transform.times(Mat4.translation(0, 1, 0));
            }
            this.moveUp = false;
            this.playerDirection = "north";
        }
        if (this.moveDown) {
            if(this.player_can_move(this.player_transform.times(Mat4.translation(0, -4, 0)), this.score + 2)) {
                this.player_transform = this.player_transform.times(Mat4.translation(0, -4, 0));
                this.score -= 1;
                this.car_speed -= .001; 
    
                this.car_dynamic_instantiation(-1); 
            } else {
                this.origin = this.player_transform; 
                this.player_transform = this.player_transform.times(Mat4.translation(0, -1, 0));
            }
            this.moveDown = false;
            this.playerDirection = "south";
        }
        if (this.moveRight) {
            if(this.player_can_move(this.player_transform.times(Mat4.translation(3, 0, 0)), this.score + 3)) {
                this.player_transform = this.player_transform.times(Mat4.translation(3, 0, 0));
            } else {
                this.origin = this.player_transform; 
                this.player_transform = this.player_transform.times(Mat4.translation(1, 0, 0));
            }
            this.moveRight = false;
            this.playerDirection = "east";
        }
        if (this.moveLeft) {
            if(this.player_can_move(this.player_transform.times(Mat4.translation(-3, 0, 0)), this.score + 3)) {
                this.player_transform = this.player_transform.times(Mat4.translation(-3, 0, 0));
            } else {
                this.origin = this.player_transform; 
                this.player_transform = this.player_transform.times(Mat4.translation(-1, 0, 0));
            }
            this.moveLeft = false;
            this.playerDirection = "west";
        }

        // check collision detection for non-moving objects/river only if the player just moved
        if(this.playerMoved) {
            this.playerMoved = false;
            let lane = this.score+3; 
            let playerX = this.player_transform[0][3];
            let playerY = this.player_transform[1][3];
            let laneYCoords = -13 + (lane*4);

            //console.log(playerY, laneYCoords);

            //check that player did not go out of bounds
            if(playerX < -14 || playerX > 24 || this.score === -4 || this.score > this.lane_num) {
                //this.game_ended = true; 
            }

            // checking that the player didn't collide with a car on the road
            if(this.lane_type[lane]===1){
                if(this.check_collision_cars()){
                    //this.game_ended = true;
                }
            }

            //check that player did not land in river 
            if(this.check_collision_in_river()) {
                //this.game_ended = true; 
            }
        }
    }

    // collision detection with the river
    check_collision_in_river() {
        let lane = this.score+3; 
        let playerX = this.player_transform[0][3];
        let playerY = this.player_transform[1][3];
        let laneY = -13 + (lane*4);
        if (this.leaf_positions[lane] === undefined) {
            return false; 
        }
 
        for (let k = 0; k < this.leaf_positions[lane].length; k++) {
            var leaf_transform = Mat4.identity().times(Mat4.translation(3 + this.leaf_positions[lane][k] * 3, laneY, 1))
            var leafX = leaf_transform[0][3];
            var leafY = leaf_transform[1][3];
            if(Math.sqrt(Math.pow(leafX - playerX, 2) + Math.pow(leafY - playerY, 2)) < 1) {
               if(this.frog_positions[lane] !== undefined && this.frog_positions[lane] === this.leaf_positions[lane][k]){
                   return true;
               }else{
                   return false; 
               } 
            }

        }
        return true; 
    }
    // collision detection with the cars
    check_collision_cars(){
        let lane = this.score+3;
        let playerX = this.player_transform[0][3];
        let playerY = this.player_transform[1][3];
        let laneY = -13 + (lane*4);

        if(this.car_positions[lane]=== undefined){
            return false;
        }

        for(let k=0; k< this.car_positions[lane].length; k++){
             var car_transform = this.car_positions[lane][k].getPosition();
             var dir = this.car_positions[lane][k].getDirection();
             //console.log("dir: ", dir);

             var car_moved = Mat4.identity().times(car_transform).times(Mat4.translation(0, -12, 1));
             var carX = car_moved[0][3];
             var carY = car_moved[1][3];

             // checking if car is placed between the Bruin (playerX) or if Bruin is between the car
             // When the cars are moving towards the right
             if(((playerX <= carX && carX <= playerX +2.25) || (carX <= playerX && playerX<= carX+2.25)) && dir === 1){
                 return true;
             }
             // checking if car is placed between the Bruin (playerX) or if Bruin is between the car
             // When the cars are moving towards the left
             else if(((playerX-2.25 <= carX && carX <= playerX) || (carX-2.25 <= playerX && playerX<=carX))&& dir === -1){
                 return true;                 
             }

        }
        return false;
    }

    // only keeping track of the lanes that we can see / are coming up saves memory 
    car_dynamic_instantiation(dir) {
        if(dir === 1) { // 1 = up 
            delete this.car_positions[this.car_lane_min];
            this.car_lane_min += 1; 
            this.car_positions[this.car_lane_max] = this.generate_cars_for_lane();
            this.car_lane_max += 1; 
        }
        else { // -1 = down
            delete this.car_positions[this.car_lane_max];
            this.car_lane_min -= 1; 
            this.car_positions[this.car_lane_min] = this.generate_cars_for_lane();
            this.car_lane_max -= 1; 
        }
    }

    display_end_game(context, program_state) {
        program_state.set_camera(Mat4.look_at(...Vector.cast([0, 0, 4], [0, 0, 0], [0, 1, 0])));
        
        let start_transform = Mat4.identity();
        this.shapes.lane.draw(context, program_state, start_transform.times(Mat4.translation(0, 13, -1)), this.materials.texturedRoad);
        this.shapes.cube.draw(context, program_state, start_transform.times(Mat4.translation(0, 0, -1)), this.materials.endScreen);

        let string = "     You Lost! \n\n     Score: " + (this.score < 0 ? 0 : this.score) + "\n\nPress r to Restart";
        const multi_line_string = string.split("\n");
        let cube_side = Mat4.rotation(0, 1, 0, 0)
                            .times(Mat4.rotation(0, 0, 1, 0))
                            .times(Mat4.translation(-.64, .2, 0.9));
        for (let line of multi_line_string.slice(0, 30)) {
            this.shapes.text.set_string(line, context.context);
            this.shapes.text.draw(context, program_state, cube_side.times(Mat4.scale(.05, .05, .05)), this.materials.text_image);
            cube_side.post_multiply(Mat4.translation(0, -0.09, 0));
        }
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 100000);

        //const light_position = vec4(0, 5, 5, 1);
        //program_state.lights = [new Light(vec4(0, 1, 1, 0), color(1, 1, 1, 1), 999999)];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        var xpos=this.frog_position.x_pos;
        var ypos=this.frog_position.y_pos;
        var zpos=this.frog_position.z_pos;
        
        var velocity=0; //initially 0
        var gaccel=9.8;
        var gaccelvec=vec3(0,-gaccel,0);

        let model_transform = Mat4.identity();

        const angle = Math.sin(t);
        const light_position = Mat4.rotation(angle, 1, 0, 0).times(vec4(0, 0, 1, 0));
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000000)];

        if (this.game_ended) {
            this.display_end_game(context, program_state); 
            return; 
        }

        //generate game scene
        for (var i = 0; i < this.lane_num; i++) { // generate every lane till max lanes
            if (this.lane_type[i] === 0) { // grass - currently green lanes
                this.shapes.lane.draw(context, program_state, model_transform, this.materials.texturedGrass);

                //rocks
                if (this.rock_positions[i] !== undefined) {
                    var rock_transform = model_transform.times(Mat4.translation(3 + this.rock_positions[i] * 3, -13, 1));
                    //this.shapes.rock.draw(context, program_state, rock_transform, this.materials.rock);
                }
                else if(this.tree_positions[i] !== undefined) {
                    var tree_transform = model_transform.times(Mat4.translation(3 + this.tree_positions[i] * 3, -13, 2))
                                                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0));
                    //this.shapes.tree.draw(context, program_state, tree_transform, this.materials.tree);
                }
                else if(this.bush_positions[i] !== undefined) {
                    var bush_transform = model_transform.times(Mat4.translation(3 + this.bush_positions[i] * 3, -13, 2))
                                                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                                        .times(Mat4.scale(0.5,0.5,0.5))
                                                        .times(Mat4.translation(0,-4,0));
                    //this.shapes.bush.draw(context, program_state, bush_transform, this.materials.bush);
                }

                if(this.coin_positions[i] !== undefined) {
                    var coin_transform = model_transform.times(Mat4.translation(3 + this.coin_positions[i] * 3, -13 , Math.sin(t) + 2))
                                                        .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                                        .times(Mat4.rotation(Math.PI/2 * t, 1, 0, 0))
                                                        .times(Mat4.scale(0.5, 0.5, 1));
                    //this.shapes.coin.draw(context, program_state, coin_transform, this.materials.coin);
                }
            } else if (this.lane_type[i] === 1) { //road - currently gray lanes
                //this.shapes.lane.draw(context, program_state, model_transform, this.materials.texturedRoad);

                // cars
                if (this.car_positions[i] !== undefined) {
                    for(let k = 0; k < this.car_positions[i].length; k++) {
                        let car_transform = this.car_positions[i][k].getPosition(); 
                        let dir = this.car_positions[i][k].getDirection(); 
                        let col = this.car_positions[i][k].getColor(); 
                        
                        let transform = model_transform.times(car_transform)
                                                        .times(Mat4.translation(0, -12, 0))
                                                        .times(Mat4.rotation(Math.PI/2, 0, 1 * dir, 0))
                                                        .times(Mat4.rotation(Math.PI/2, 0, 0, 1 * dir))
                                                        .times(Mat4.scale(1.2, 1.2, 1.2));

                        if(col === 0) {
                            //this.shapes.car.draw(context, program_state, transform, this.materials.red_car);
                        } else if(col === 1) {
                            //this.shapes.car.draw(context, program_state, transform, this.materials.blue_car);
                        } else {
                            //this.shapes.car.draw(context, program_state, transform, this.materials.black_car);
                        }
                        this.car_positions[i][k].setPosition(car_transform.times(Mat4.translation(this.car_speed * dir, 0, 0)));
                        
                        // dynamic instantiation for car - if car reaches end of board -> reset it's position to very begining of board
                        if((car_transform[0][3] > 24 && dir === 1) || (car_transform[0][3] < -14 && dir === -1)) { 
                            // replace out of bounds car with new one
                            let start_loc = dir === 1 ? -14 : 24; 
                            this.car_positions[i].splice(k, 1, new Car(Mat4.identity().times(Mat4.translation(start_loc, -1, 1)), 0, dir)); 
                        }
                        
                    }                        
                    
                }
            } else { // river - currently blue lanes
                //this.shapes.lane.draw(context, program_state, model_transform, this.materials.texturedRiver);

                // leaf pads 
                for (let k = 0; k < this.leaf_positions[i].length; k++) {
                    var leaf_transform = model_transform.times(Mat4.translation(3 + this.leaf_positions[i][k] * 3, -14, 1))
                                                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0));

                    //this.shapes.leaf.draw(context, program_state, leaf_transform, this.materials.leaf);
   
                    if(this.frog_positions[i] !== undefined && this.frog_positions[i] === this.leaf_positions[i][k]) {
                        //console.log(this.leaf_positions[i][k]);
                        this.isJumping=true;
                        var jumps=0;
                        let frog_transform=leaf_transform;
                        if(this.isJumping==true){
                            //frog_transform=frog_transform.times(Mat4.translation(0, 3.54 * Math.abs(Math.sin(t)) , 0));
                            frog_transform=frog_transform.times(Mat4.scale(0.55, 0.55, 0.55))
                                                        .times(Mat4.translation(0, 3.54 * Math.abs(Math.sin(t)) , 0))
                                                        .times(Mat4.rotation(Math.PI, 0, 1, 0))
                                                        .times(Mat4.rotation(-Math.PI/2, 1, 0, 0))
                                                        .times(Mat4.translation(0, 0, 1));
                            //this.shapes.frog.draw(context, program_state,frog_transform, this.materials.frog);
                            jumps=jumps+1;
                            if(jumps>3){
                                this.isJumping=false;
                            }
                        }
                    }

                }
            }
            model_transform = model_transform.times(Mat4.translation(0, 4, 0));
        }

        // Checking if the cars collided with the Bruin when it's at rest
        // when player hasn't moved and when we are on the road (lane = 1)
        if(!this.playerMoved && this.lane_type[this.score+3]===1){
            if(this.check_collision_cars()){
                //this.game_ended = true;
            }
        }
        
        //player
        this.move_player();

        var player_rotated_transform = this.player_transform;
        let lane = this.score+3; 
        if(this.lane_type[lane] === 2) {
            player_rotated_transform = player_rotated_transform.times(Mat4.translation(0, -1, 1));
        }
        
        // orient the bear/player correctly before displaying it
        // player_rotated_transform = player_rotated_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)); // rotate bear so that it is standing upright, facing south
        player_rotated_transform = player_rotated_transform.times(Mat4.rotation(Math.PI, 1, 0, 0)).times(Mat4.rotation(Math.PI/2, 0, 0, 1)).times(Mat4.rotation(Math.PI, 0, 1, 0)); // rotate bear so that it is standing upright, facing south
        if(this.playerDirection == "north") {
            // player_rotated_transform = player_rotated_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
        }
        else if(this.playerDirection == "west") {
            // player_rotated_transform = player_rotated_transform.times(Mat4.rotation(-Math.PI/2, 0, 1, 0));
        }
        else if(this.playerDirection == "east") {
            // player_rotated_transform = player_rotated_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        }
        // player_rotated_transform = player_rotated_transform.times(Mat4.translation(0, 0.59, 0));
        this.shapes.bear.draw(context, program_state, player_rotated_transform, this.materials.bruin);

        this.attached = this.player_transform;

        if(this.origin !== null) {
            this.player_transform = this.origin; 
            this.origin = null; 
        }

        this.set_camera_view(program_state);
    }
}