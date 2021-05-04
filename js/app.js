import * as THREE from 'three';
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertexParticles.glsl";
//import * as dat from "dat.gui";
import gsap from 'gsap';

export default class Sketch{
    constructor(options){
		this.scene = new THREE.Scene();
		
		this.container = options.dom;
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: "high-performance",
			alpha: true
		});
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor(0x111111, 1); 
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera( 70, 
            window.innerWidth / window.innerHeight, 
            100,
            10000 
        );

        this.camera.position.set(0, 0, 600);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);    

        this.time = 0;

        this.isPlaying = true;

        this.getdata();
        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();        
    }

    getdata(){
        this.svg = [...document.querySelectorAll('.cls-1')]

        this.lines = [];

        this.svg.forEach((path,j)=>{
            let len = path.getTotalLength();
            let numberOfPoints = Math.floor(len/5);

            let points = []

            for (let i = 0; i < numberOfPoints; i++) {
                let pointAt = len * i/numberOfPoints;
                let p = path.getPointAtLength(pointAt);
                points.push(new THREE.Vector3(p.x - 1024,p.y - 512,0));

            }

            this.lines.push({
                id: j,
                path: path,
                length: len,
                number: numberOfPoints,
                points: points
            })
        })
    }

    setting() {
        let that = this;
        this.settings = {
            progress: 0,
        };
        this.gui = new dat.gui();
        this.gui.add(this.settings, "progress", 0,1, 0.01);        
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }
    
    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        // image cover
        this.imageAspect = 853/1200;
        let a1; let a2;
        if(this.height/this.width>this.imageAspect) {
            a1 = (this.width/this.height) * this.imageAspect;
            a2 = 1;
        } else {

        }

        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;
        this.material.uniforms.resolution.value.z = a1;
        this.material.uniforms.resolution.value.w = a2;

        this.camera.updateProjectionMatrix();        

    }

    addObjects(){
        let that = this;
		this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_Standard_derivatives : enable"

            },
            side: THREE.DoubleSide,

			uniforms:{
                time: {value: 0},
                resolution: { value: new THREE.Vector4() }
			},
            transparent: true,
            depthTest: true,
            depthWrite: true,
            blending: THREE.AdditiveBlending,            
            vertexShader:vertex,
			fragmentShader:fragment
		})

        this.geometry = new THREE.PlaneGeometry( 1,1, 10, 10);
        this.geometry = new THREE.BufferGeometry();

        this.positions = [];
        this.opacity = [];

        this.lines.forEach(line=>{
            line.points.forEach(p=>{
                this.positions.push(p.x,p.y,p.z);
                this.opacity.push(Math.random()/5);
            })
        })

        this.geometry.setAttribute('position',new THREE.BufferAttribute(
            new Float32Array(this.positions), 3));
        this.geometry.setAttribute('opacity',new THREE.BufferAttribute(
            new Float32Array(this.opacity), 1));

        this.plane = new THREE.Points( this.geometry, this.material );
        this.scene.add( this.plane );      
    }

    stop() {
        this.isPlaying = false;
    }

    render() {
        this.time++;
        this.renderer.render( this.scene, this.camera );
        requestAnimationFrame(this.render.bind(this));

    }    
}

new Sketch({
  dom: document.getElementById("container")	
});
