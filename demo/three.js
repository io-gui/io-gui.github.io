import {IoElement} from "../../io/build/io.js";
import {
	PerspectiveCamera,
	Scene,
	GridHelper,
	Vector3,
	HemisphereLight
} from "../../../three.js/build/three.module.js";
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
		:host > three-viewport {
			align-self: flex-stretch;
			flex: 1 0;
		}
		:host > three-inspector {
			flex: 0 1 30em;
			max-width: 50%;
			overflow-y: auto;
		}
		`;
	}
	static get Properties() {
		return {
			scene: Scene,
			camera: PerspectiveCamera,
		};
	}
	onChange() {
		this.$.viewport.render();
	}
	constructor(props) {
		super(props);
		this.template([
			['three-viewport', {scene: this.scene, camera: this.camera, id: 'viewport'}],
			['three-inspector', {id: 'inspector', value: this}],
		]);

		const scene = this.scene;
		scene.add( new GridHelper( 10, 10 ) );

		const camera = this.camera;
		camera.position.set(2, 2, 2);
		camera._target = new Vector3(0, 1, 0);
		camera.lookAt( camera._target );
		scene.add( camera );

		// const orbit = new OrbitControls( camera, this.$.renderer );
		// orbit.update();
		// orbit.addEventListener( 'change', () => {
		// 	this.dispatchEvent('object-mutated', {object: camera}, false, window);
		// 	this.dispatchEvent('object-mutated', {object: camera.position}, false, window);
		// 	this.dispatchEvent('object-mutated', {object: camera.rotation}, false, window);
		// 	this.dispatchEvent('object-mutated', {object: camera.quaternion}, false, window);
		// 	this.onChange();
		// } );

		const loader = new GLTFLoader();

		loader.load('/demo/scene/cubes.gltf', gltf => {
			gltf.scene.children.forEach(child => { scene.add( child ); });
			scene.add(new HemisphereLight(0x333333, 0xffffff, 3));
			window.dispatchEvent(new CustomEvent('object-mutated', {detail: {object: scene.children}}));
		}, undefined, function ( e ) {
			console.error( e );
		} );
		loader.manager.onLoad = this.onChange;

		this.$.inspector.addEventListener( 'change', () => {
			this.onChange();
		} );

		this.$.inspector.value = scene.children;
	}
}

IoDemoThree.Register();
