import {IoElement} from "../../io/build/io.js";
import {
	PerspectiveCamera,
	WebGLRenderer,
	Scene,
	GridHelper,
	DirectionalLight,
	TextureLoader,
	BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	Vector3,
	HemisphereLight
} from "../../../three.js/build/three.module.js";
import {OrbitControls} from "../../../three.js/examples/jsm/controls/OrbitControls.js";
import {TransformControls} from "../../../three.js/examples/jsm/controls/TransformControls.js";
import {GLTFLoader} from "../../../three.js/examples/jsm/loaders/GLTFLoader.js";

export class IoDemoThree extends IoElement {
	static get Style() {
		return /* css */`
		:host {
			display: flex;
			flex: 1 1;
			flex-direction: row;
			height: 100%;
		}
		:host > io-three-inspector {
			flex: 0 1 30em;
			overflow-y: auto;
		}
		:host > div {
			align-self: flex-stretch;
			flex: 1 0;
		}
		:host > div > canvas:focus {
			outline-offset: -4px;
		}
		:host > div > canvas {
			display: flex;
		}
		`;
	}
	static get Properties() {
		return {
			renderer: WebGLRenderer,
			scene: Scene,
			camera: PerspectiveCamera,
		};
	}
	get size() {
		const rect = this.$.content.getBoundingClientRect();
		return [Math.floor(rect.width), Math.floor(rect.height)];
	}
	render() {
		this.renderer.render( this.scene, this.camera );
	}
	onResized() {
		this.camera.aspect = this.size[0] / this.size[1];
		this.camera.near = 0.01;
		this.camera.far = 10000;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.size[0], this.size[1]);
		this.render();
	}
	constructor(props) {
		super(props);
		this.template([
			['div', {id: 'content'}],
			['io-three-inspector', {id: 'inspector', value: this}],
		]);

		this.renderer.gammaFactor = 2.2;
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		this.render = this.render.bind(this);

		const loader = new GLTFLoader();

		const scene = this.scene;
		loader.load('/three-ui/demo/scene/cubes.gltf', gltf => {
			gltf.scene.children.forEach(child => { scene.add( child ); });
			scene.add(new HemisphereLight(0x333333, 0xffffff, 3));
			window.dispatchEvent(new CustomEvent('object-mutated', {detail: {object: scene.children}}));
		}, undefined, function ( e ) {
			console.error( e );
		} );
		loader.manager.onLoad = this.render;

		this.init();
		this.render();
	}
	init() {
		const renderer = this.renderer;
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( this.size[0], this.size[1] );
		this.$.content.appendChild( renderer.domElement );
		renderer.domElement.setAttribute('tabindex', 0);

		const scene = this.scene;
		scene.add( new GridHelper( 10, 10 ) );

		const camera = this.camera;
		camera.position.set(2, 2, 2);
		camera._target = new Vector3(0, 1, 0);
		camera.lookAt( camera._target );
		scene.add( camera );

		const orbit = new OrbitControls( camera, renderer.domElement );
		orbit.update();
		orbit.addEventListener( 'change', () => {
			this.dispatchEvent('object-mutated', {object: camera}, false, window);
			this.dispatchEvent('object-mutated', {object: camera.position}, false, window);
			this.dispatchEvent('object-mutated', {object: camera.rotation}, false, window);
			this.dispatchEvent('object-mutated', {object: camera.quaternion}, false, window);
			this.render();
		} );

		// const control = new TransformControls( camera, renderer.domElement );
		// control.addEventListener( 'change', () => {
		// 	const selected = this.$.inspector.selected;
		// 	this.dispatchEvent('object-mutated', {object: selected}, false, window);
		// 	this.render();
		// } );

		// control.addEventListener( 'dragging-changed', ( event ) => {
		// 	orbit.enabled = ! event.value;
		// } );

		this.$.inspector.addEventListener( 'change', () => {
			this.render();
		} );

		this.$.inspector.value = scene.children;
	}
}

IoDemoThree.Register();
