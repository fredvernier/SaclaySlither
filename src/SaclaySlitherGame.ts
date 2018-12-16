import {Point, Food, Snake, SnakeStrategy} from './Snake';

export class SaclaySlitherGame {
  static BORDER_SIZE:number            = 200;
  static NBINITIALSNAKES:number        = 14 ;
  static NBINITIALFOODS:number         = 10000;
  static IMG_SIZE:number               = 128;

   // combien de poids perd un serpend qui courre
  static LOOSEWEIGHT:number     = 2;

  // un serpend qui courre ne perds pas du poids a chaque affichage mais 1 fois sur LOOSEWEIGHTPACE
  static LOOSEWEIGHTPACE:number = 4;

  // La taille du monde qui a une forme de disque
  static WORLDRADIUS:number     = 1500;

  // Vitesse minimum
  static MIN_SPEED:number       = 4; // set to 0 to allow snakes to stop !

  // vitesse preferre quand tout va bien
  static PREF_SPEED:number      = 4;

  // vitesse maximum d'un serpent qui courre
  static MAX_SPEED:number       = 8;

  // length beetween 2 segments of a snake
  static SPACEBETWEENSEGMENTS:number = 10.0;

  // l'angle maximal enter la tete et le cou => c'est cet angle qui donne le "rayon de braquage" du serpent.
  // mais ca depend aussi de la taille du serpent et du zoom
  static MAX_TURN:number        = Math.PI/48;


  static imgRadar: HTMLCanvasElement;

  // game data
  foods:Food[]                         = [];
  snakes:(Snake|null)[]                = [];
  gaussR:number                        = 8;
  gauss: number[][]                    = [];

  // le niveau de zoom en fonction de la taille du serpent principal
  globZoom                             = 1.5;

  // ...si le zoom automatique est actif
  automaticZoom:boolean                = true;

  state:number                         = 1;
  frameCount:number                    = 0;
  lastTime:number                      = 0;
  panX:number                          = 0;
  panY:number                          = 0;

  targetX:number                       = 0;
  targetY:number                       = 0;

  names:string[]              = ["Fred", "Nicolas", "Yacine", "Olivia", "Medhi", "Christian", "Laura", "Guillaume",
                                 "Sandrine", "Lila", "Sarah", "Cecile", "Philippe", "Emmy", "Florian"];
  static colors: number[][][] = [[[0, 0, 255], [0, 0, 255], [255, 255, 255], [255, 255, 255], [255, 0, 0], [255, 0, 0]], // french
                                  [[96, 96, 255], [96, 96, 192], [96, 96, 128], [96, 96, 96], [96, 96, 128], [96, 96, 192]], // shades of blue
                                  [[255, 96, 0], [192, 96, 0], [128, 96, 0], [96, 96, 0], [128, 96, 0], [192, 96, 0]], // shades of red
                                  [[0, 0, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0], [255, 0, 255]], // rainbow
                                  [[0, 255, 0], [0, 255, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0]], // portugese
                                  [[0, 0, 0], [0, 0, 0], [255, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 0]], // german
                                  [[255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 0], [255, 255, 0]], // spannish
                                  [[255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0]], // castillan
                                  [[255, 0, 0], [255, 0, 0], [255, 255, 255], [255, 255, 255], [0, 0, 255], [0, 0, 255]], // dutch
                                  [[255, 0, 0], [255, 0, 0], [255, 255, 255], [255, 255, 255], [255, 0, 255], [255, 0, 0]], // austrian/dannish/swiss
                                  [[0, 192, 0], [0, 192, 0], [255, 255, 255], [255, 255, 255], [255, 128, 0], [255, 128, 0]], // irish
                                  [[0, 0, 0], [0, 0, 0], [255, 255, 0], [255, 255, 0], [255, 0, 0], [255, 0, 0]], // belgian
                                  [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255]], // all white
                                  [[0, 255, 0], [0, 255, 0], [255, 255, 255], [255, 255, 255], [255, 0, 0], [255, 0, 0]]      // italian
                                ];

  static teamNames = ["France", "Blues", "Reds", "Rainbow", "Portugal", "Germany", "Spain", "Castilla", "Nederland", "Austria", "Ireland", "Belgium", "White knights", "Italie"]


  constructor() {

    this.init();

        // intitial creation of the snakes


      //app.stage.addChild(this.snakes[0]!.container);

    // initial creation of the food
    for (let k:number=0; k<10000; k++) {
      //let f:Food = Food.newFood(this);
      //this.foodLayer.addChild(f.sprite);
      //this.foods.push(f);
    }

  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////// INIT //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  init(){

  }

}