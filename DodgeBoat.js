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

class ship {
    constructor(model_transform, direction) {
        this.model_transform = model_transform;
        this.direction = direction;
    }

    getDirection() {
        return this.direction; // 1 = right, -1 = left
    }

    getPosition() {
        return this.model_transform; 
    }

    setPosition(pos) {
        this.model_transform = pos;
        this.xPos = pos[0][3];
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
            lane: new defs.Grid_Patch(20, 200, row_operation, column_operation, [[0, 10], [0, 1]]),
            cube: new Cube(),
            ship: new Shape_From_File("assets/battleship.obj"),
            sphere: new defs.Subdivision_Sphere(2),
            rock: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            boat: new Shape_From_File("assets/boat.obj"),
            bush: new Shape_From_File("assets/bush_files/eb_house_plant_01.obj"),
            lotus: new Shape_From_File("assets/lotus.obj"),
            text: new Text_Line(35),
            bridge: new Shape_From_File("assets/towerbridge.obj")
        };

        // *** Materials
        this.materials = {
            texturedGrass: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/riverlane.jpg")
            }),
            texturedRiver: new Material(new  Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/river.jpeg")
            }),
            texturedRoad: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/roadlane.png")
            }),
            boat: new Material(new defs.Phong_Shader(), 
                { ambient: 1, diffusivity: .6, color: hex_color("#555555") }),
            battleship: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/battleship.jpg") }),   
            bridge: new Material(new Textured_Phong(),
                { ambient: 1, texture: new Texture("assets/towerbridge.jpg") }),                   
            rock: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#333333") }),
            lotus: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#eab5f5") }),
            bush: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: .6, color: hex_color("#002800") }),
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

        this.setup_game(); 
    }

    setup_game() {
        // detect movements 
        this.moveUp = false;
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

        this.rock_positions = {}; // dictionary for rocks positions: key = lane number, value = placement in lane 
        this.lotus_positions = {}; // dictionary for lotus positions: key = lane number, value = placement in lane
        this.bush_positions = {}; // dictionary for bush positions: key = lane number, value = placement in lane
        this.bridge_position = {}; // dictionary for bridge positions: key = lane number, value = placement in lane
        this.ship_positions = {}; // dictionary for ship positions: key = lane number, value = array/list of Mat4 (model transforms) for all ships in lane
        this.generate_rocks_and_lotus();
        this.generate_ships(); 

        this.ship_lane_min = 0; 
        this.ship_lane_max = 19; 

        this.ship_speed = 0.1;  
        this.score = 0;

        this.game_ended = false; // set this to true if player collided and game is over

        this.origin = null; 

        this.temp_t = null;
        
    }

    generate_lanes() {
        var lane = [];
        // first 4 lanes are safe water so that player doesn't immediately get hit by a ship
        for (let i = 0; i < 4; i++) {
            lane.push(0);
        }
        for (let i = 4; i < this.lane_num; i++) {
            var random_v = Math.random();
            if (random_v < 0.6) {
                lane.push(2);   // water lane without ships
            } else {
                lane.push(1);   // water lane with ships
            }
            
        }
        this.lane_type = lane;
    }

    generate_rocks_and_lotus() {
        var rock_pos = {};
        var lotus_pos = {};
        var bush_pos = {};
        var bridge_pos = {};
        // start indices from 4 because first 4 lanes should have no obstacles, so that player doesn't start on an obstacle
        for (let i = 4; i < this.lane_num; i++) {
            //generate rocks, lotus, bush, and bridge
            var random_v = Math.random();
            var pos = Math.floor(Math.random() * 13); // gets random position
            var new_pos = pos < 6 ? (-1*pos) : (pos-7);
            if (random_v < 0.15) { // 15% chance of rock
                rock_pos[i] = new_pos;
            }
            else if (random_v < 0.3) { // 15% chance of lotus
                lotus_pos[i] = new_pos;
            }
            else if (random_v < 0.45) { // 15% chance of bush
                bush_pos[i] = new_pos;
            } 
            else if (random_v < 0.65) { // 20% chance of bridge
                bridge_pos[i] = new_pos;
            }                          // 30% change of ship
        }
        this.rock_positions = rock_pos;
        this.lotus_positions = lotus_pos;
        this.bush_positions = bush_pos;
        this.bridge_position = bridge_pos;
    }

    

    generate_ships_for_lane() {
        var pos = []; 
        let direction = Math.floor(Math.random() * 2) == 0? -1 : 1; 
        var x_pos = Math.floor(Math.random() * 5) - 15;
        let ship_num = Math.floor(Math.random() * 2) == 0 ? 3 : 2; // vary ship num per lane so it doesn't look too uniform
        if(this.score > 30) {
            ship_num = Math.floor(Math.random() * 3) + 2; 
        } 
        for(let i = 0; i < ship_num; i++) {
            var dist_between = Math.floor(Math.random() * 30); // get random distance between ships
            let ship_transform = Mat4.identity().times(Mat4.translation(dist_between + x_pos, -1, 1));
            pos.push(new ship(ship_transform, direction, x_pos)); 
            x_pos += (ship_num == 3 ? 13 : (ship_num == 2 ? 17 : 9)) + dist_between;
        }
        return pos; 
    }

    generate_ships() {
        // start off game by only generating 20 lanes of ship positions to save memory/be more efficient - use dynamic instantiation as game goes on
        var ship_pos = {};
        for(let i = 0; i < 20; i++) {
            ship_pos[i] = this.generate_ships_for_lane();
        }
        this.ship_positions = ship_pos;
    }

    make_control_panel() {
        this.live_string(box => {
            box.textContent = "Score: " + (this.score < 0 ? 0 : this.score)
        });
        this.new_line();
        this.new_line();
        this.key_triggered_button("Start the boat", ["u"], () => {
            this.temp_t = 0;
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

        //check that player did not go out of bounds
        if(playerX < -14 || playerX > 24 || this.score === -4 || this.score > this.lane_num) {
            this.game_ended = true; 
        }

        //check collision detection for rocks and lotus
        if (this.lane_type[lane] === 2) {
            if (this.rock_positions[lane] !== undefined) {
                var rock_transform = Mat4.identity().times(Mat4.translation(3 + this.rock_positions[lane] * 3, laneYCoords, 1));
                var rockX = rock_transform[0][3];
                var rockY = rock_transform[1][3];
                
                if(Math.sqrt(Math.pow(rockX - playerX, 2) + Math.pow(rockY - playerY, 2)) < 1) {
                    return false; 
                }
            }
            else if(this.lotus_positions[lane] !== undefined) {
                var lotus_transform = Mat4.identity().times(Mat4.translation(3 + this.lotus_positions[lane] * 3, laneYCoords, 2))
                                                    .times(Mat4.rotation(90, 1, 0, 0));
                var lotusX = lotus_transform[0][3];
                var lotusY = lotus_transform[1][3];
                if(Math.sqrt(Math.pow(lotusX - playerX, 2) + Math.pow(lotusY - playerY, 2)) < 1) {
                    return false; 
                }
            }
            else if(this.bush_positions[lane] !== undefined) {
                var bush_transform = Mat4.identity().times(Mat4.translation(3 + this.bush_positions[lane] * 3, laneYCoords, 2))
                                                    .times(Mat4.rotation(90, 1, 0, 0));
                var bushX = bush_transform[0][3];
                var bushY = bush_transform[1][3];
                if(Math.sqrt(Math.pow(bushX - playerX, 2) + Math.pow(bushY - playerY, 2)) < 1) {
                    return false;
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
                this.ship_speed += .001; // as the score gets higher, ship speed gets faster too

                this.ship_dynamic_instantiation(1);
            }
            else {
                this.origin = this.player_transform; 
                this.player_transform = this.player_transform.times(Mat4.translation(0, 1, 0));
            }
            this.moveUp = false;
            this.playerDirection = "north";
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

            //check that player did not go out of bounds
            if(playerX < -14 || playerX > 24 || this.score === -4 || this.score > this.lane_num) {
                this.game_ended = true; 
            }

            // checking that the player didn't collide with a ship
            if(this.lane_type[lane]===1){
                if(this.check_collision_ships()){
                    this.game_ended = true;
                }
            }
            // checking that the player didn't collide with a bridge
            if(this.lane_type[lane]===2){
                if(this.check_collision_bridge()){
                    this.game_ended = true;
                }
            }
        }
    }

    // collision detection with the bridge
    check_collision_bridge() {
        let playerX = this.player_transform[0][3];
        let playerY = this.player_transform[1][3];
        let playerLane = 0.25 * playerY + 3.25;
        let pillarLeftPos = 0;
        let pillarRightPos = 9;
        if (playerLane in this.bridge_position && (playerX === pillarLeftPos || playerX === pillarRightPos)) {
            this.game_ended = true;
        }
    }

    // collision detection with the ships
    check_collision_ships(){
        let lane = this.score+3;
        let playerX = this.player_transform[0][3];

        if(this.ship_positions[lane]=== undefined){
            return false;
        }
        for(let k=0; k< this.ship_positions[lane].length; k++){
             var ship_transform = this.ship_positions[lane][k].getPosition();
             var dir = this.ship_positions[lane][k].getDirection();

             var ship_moved = Mat4.identity().times(ship_transform).times(Mat4.translation(0, -12, 1));
             var shipX = ship_moved[0][3];

             // checking if ship is placed between the boat (playerX) or if boat is between the ship
             // When the ships are moving towards the right
             if(((playerX <= shipX && shipX <= playerX +4) || (shipX <= playerX && playerX<= shipX+4)) && dir === 1){
                 return true;
             }
             // checking if ship is placed between the boat (playerX) or if boat is between the ship
             // When the ships are moving towards the left
             else if(((playerX-4 <= shipX && shipX <= playerX) || (shipX-4 <= playerX && playerX<=shipX))&& dir === -1){
                 return true;                 
             }

        }
        return false;
    }

    // only keeping track of the lanes that we can see / are coming up saves memory 
    ship_dynamic_instantiation(dir) {
        if(dir === 1) { // 1 = up 
            delete this.ship_positions[this.ship_lane_min];
            this.ship_lane_min += 1; 
            this.ship_positions[this.ship_lane_max] = this.generate_ships_for_lane();
            this.ship_lane_max += 1; 
        }
        else { // -1 = down
            delete this.ship_positions[this.ship_lane_max];
            this.ship_lane_min -= 1; 
            this.ship_positions[this.ship_lane_min] = this.generate_ships_for_lane();
            this.ship_lane_max -= 1; 
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

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        
        // Consistantly move the boat forward, speed up if the score goes up, reach a maximum speed at score 60    
        if (this.temp_t !== null && (this.score < 80 ? (t - this.temp_t) > (1 - 0.005 * this.score) : (t - this.temp_t) > 0.6)) {
            this.moveUp = true;
            this.playerMoved = true;
            this.temp_t = t;
        }

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
            if (this.lane_type[i] === 0) { // safe water lane

                this.shapes.lane.draw(context, program_state, model_transform, this.materials.texturedGrass);

            } 
            else if (this.lane_type[i] === 2) { // water lane without ships

                this.shapes.lane.draw(context, program_state, model_transform, this.materials.texturedRiver);

                //rocks
                if (this.rock_positions[i] !== undefined) {
                    var rock_transform = model_transform.times(Mat4.translation(3 + this.rock_positions[i] * 3, -13, 1));

                    this.shapes.rock.draw(context, program_state, rock_transform, this.materials.rock);
                }

                //lotus
                else if(this.lotus_positions[i] !== undefined) {
                    var lotus_transform = model_transform.times(Mat4.translation(3 + this.lotus_positions[i]* 3, -14, 1))
                                                         .times(Mat4.scale(0.3, 0.3, 0.3));

                    this.shapes.lotus.draw(context, program_state, lotus_transform, this.materials.lotus);
                }

                //bush
                else if(this.bush_positions[i] !== undefined) {
                    var bush_transform = model_transform.times(Mat4.translation(3 + this.bush_positions[i] * 3, -13, 2))
                                                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                                        .times(Mat4.scale(0.5,0.5,0.5))
                                                        .times(Mat4.translation(0,-4,0));
                    this.shapes.bush.draw(context, program_state, bush_transform, this.materials.bush);
                } 

                //bridge
                else if (this.bridge_position[i] !== undefined) {
                    var bridge_transform = model_transform.times(Mat4.translation(4.5, -13, 3))
                                                          .times(Mat4.scale(8.5, 5, 5));
                    this.shapes.bridge.draw(context, program_state, bridge_transform, this.materials.bridge);
                }

            } 
            else { // water lane with ships

                this.shapes.lane.draw(context, program_state, model_transform, this.materials.texturedRiver);

                // ships
                if (this.ship_positions[i] !== undefined) {
                    for(let k = 0; k < this.ship_positions[i].length; k++) {
                        let ship_transform = this.ship_positions[i][k].getPosition(); 
                        let dir = this.ship_positions[i][k].getDirection(); 
                        let transform = model_transform.times(ship_transform)
                                                        .times(Mat4.translation(0, -12, 0))
                                                        .times(Mat4.rotation(Math.PI, 1 * dir, 0, 0))
                                                        .times(Mat4.rotation(Math.PI, 0, 1 * dir, 0))
                                                        .times(Mat4.rotation(Math.PI, 0, 0, 1 * dir))
                                                        .times(Mat4.scale(1.2, 1.2, 1.2));

                        this.shapes.ship.draw(context, program_state, transform, this.materials.battleship);
                        this.ship_positions[i][k].setPosition(ship_transform.times(Mat4.translation(this.ship_speed * dir, 0, 0)));
                        
                        // dynamic instantiation for ship - if ship reaches end of board -> reset it's position to very begining of board
                        if ((ship_transform[0][3] > 24 && dir === 1) || (ship_transform[0][3] < -14 && dir === -1)) { 
                            // replace out of bounds ship with new one
                            let start_loc = dir === 1 ? -14 : 24; 
                            this.ship_positions[i].splice(k, 1, new ship(Mat4.identity().times(Mat4.translation(start_loc, -1, 1)), dir)); 
                        }   
                    }                
                }
            }
            model_transform = model_transform.times(Mat4.translation(0, 4, 0));
        }

        // Checking if the ships collided with the boat when it's at rest
        // when player hasn't moved and when we are on the road (lane = 1)
        if(!this.playerMoved && this.lane_type[this.score+3]===1){
            if(this.check_collision_ships()){
                this.game_ended = true;
            }
        }
        
        //player
        this.move_player();

        var player_rotated_transform = this.player_transform;
        let lane = this.score+3; 
        if(this.lane_type[lane] === 2) {
            player_rotated_transform = player_rotated_transform.times(Mat4.translation(0, -1, 1));
        }
        
        // orient the boat/player correctly before displaying it
        // player_rotated_transform = player_rotated_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)); // rotate boat so that it is standing upright, facing south
        player_rotated_transform =  player_rotated_transform.times(Mat4.rotation(Math.PI, 1, 0, 0))
                                                            .times(Mat4.rotation(Math.PI/2, 0, 0, 1))
                                                            .times(Mat4.rotation(Math.PI, 0, 1, 0))
                                                            .times(Mat4.translation(0, 0, -0.6))
                                                            .times(Mat4.scale(0.8, 0.8, 0.8)); // rotate boat so that it is standing upright, facing south
        if(this.playerDirection == "west") {
            player_rotated_transform = player_rotated_transform.times(Mat4.rotation(-Math.PI/8, 1, 0, 0));
        }
        else if(this.playerDirection == "east") {
            player_rotated_transform = player_rotated_transform.times(Mat4.rotation(Math.PI/8, 1, 0, 0));
        }
        this.shapes.boat.draw(context, program_state, player_rotated_transform, this.materials.boat);

        this.attached = this.player_transform;

        if(this.origin !== null) {
            this.player_transform = this.origin; 
            this.origin = null; 
        }

        this.set_camera_view(program_state);
    }
}