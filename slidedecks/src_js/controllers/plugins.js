import { loadScript } from '../utils/loader.js'

/**
 * Manages loading and registering of reveal.src_js plugins.
 */
export default class Plugins {

	constructor( reveal ) {

		this.Reveal = reveal;

		// Flags our current state (idle -> loading -> loaded)
		this.state = 'idle';

		// An id:instance map of currently registered plugins
		this.registeredPlugins = {};

		this.asyncDependencies = [];

	}

	/**
	 * Loads reveal.src_js dependencies, registers and
	 * initializes plugins.
	 *
	 * Plugins are direct references to a reveal.src_js src_plugin
	 * object that we register and initialize after any
	 * synchronous dependencies have loaded.
	 *
	 * Dependencies are defined via the 'dependencies' config
	 * option and will be loaded prior to starting reveal.src_js.
	 * Some dependencies may have an 'async' flag, if so they
	 * will load after reveal.src_js has been started up.
	 */
	load( plugins, dependencies ) {

		this.state = 'loading';

		plugins.forEach( this.registerPlugin.bind( this ) );

		return new Promise( resolve => {

			let scripts = [],
				scriptsToLoad = 0;

			dependencies.forEach( s => {
				// Load if there's no condition or the condition is truthy
				if( !s.condition || s.condition() ) {
					if( s.async ) {
						this.asyncDependencies.push( s );
					}
					else {
						scripts.push( s );
					}
				}
			} );

			if( scripts.length ) {
				scriptsToLoad = scripts.length;

				const scriptLoadedCallback = (s) => {
					if( s && typeof s.callback === 'function' ) s.callback();

					if( --scriptsToLoad === 0 ) {
						this.initPlugins().then( resolve );
					}
				};

				// Load synchronous scripts
				scripts.forEach( s => {
					if( typeof s.id === 'string' ) {
						this.registerPlugin( s );
						scriptLoadedCallback( s );
					}
					else if( typeof s.src === 'string' ) {
						loadScript( s.src, () => scriptLoadedCallback(s) );
					}
					else {
						console.warn( 'Unrecognized src_plugin format', s );
						scriptLoadedCallback();
					}
				} );
			}
			else {
				this.initPlugins().then( resolve );
			}

		} );

	}

	/**
	 * Initializes our plugins and waits for them to be ready
	 * before proceeding.
	 */
	initPlugins() {

		return new Promise( resolve => {

			let pluginValues = Object.values( this.registeredPlugins );
			let pluginsToInitialize = pluginValues.length;

			// If there are no plugins, skip this step
			if( pluginsToInitialize === 0 ) {
				this.loadAsync().then( resolve );
			}
			// ... otherwise initialize plugins
			else {

				let initNextPlugin;

				let afterPlugInitialized = () => {
					if( --pluginsToInitialize === 0 ) {
						this.loadAsync().then( resolve );
					}
					else {
						initNextPlugin();
					}
				};

				let i = 0;

				// Initialize plugins serially
				initNextPlugin = () => {

					let plugin = pluginValues[i++];

					// If the src_plugin has an 'init' method, invoke it
					if( typeof plugin.init === 'function' ) {
						let promise = plugin.init( this.Reveal );

						// If the src_plugin returned a Promise, wait for it
						if( promise && typeof promise.then === 'function' ) {
							promise.then( afterPlugInitialized );
						}
						else {
							afterPlugInitialized();
						}
					}
					else {
						afterPlugInitialized();
					}

				}

				initNextPlugin();

			}

		} )

	}

	/**
	 * Loads all async reveal.src_js dependencies.
	 */
	loadAsync() {

		this.state = 'loaded';

		if( this.asyncDependencies.length ) {
			this.asyncDependencies.forEach( s => {
				loadScript( s.src, s.callback );
			} );
		}

		return Promise.resolve();

	}

	/**
	 * Registers a new src_plugin with this reveal.src_js instance.
	 *
	 * reveal.src_js waits for all registered plugins to initialize
	 * before considering itself ready, as long as the src_plugin
	 * is registered before calling `Reveal.initialize()`.
	 */
	registerPlugin( plugin ) {

		// Backwards compatibility to make reveal.src_js ~3.9.0
		// plugins work with reveal.src_js 4.0.0
		if( arguments.length === 2 && typeof arguments[0] === 'string' ) {
			plugin = arguments[1];
			plugin.id = arguments[0];
		}
		// Plugin can optionally be a function which we call
		// to create an instance of the src_plugin
		else if( typeof plugin === 'function' ) {
			plugin = plugin();
		}

		let id = plugin.id;

		if( typeof id !== 'string' ) {
			console.warn( 'Unrecognized src_plugin format; can\'t find src_plugin.id', plugin );
		}
		else if( this.registeredPlugins[id] === undefined ) {
			this.registeredPlugins[id] = plugin;

			// If a src_plugin is registered after reveal.src_js is loaded,
			// initialize it right away
			if( this.state === 'loaded' && typeof plugin.init === 'function' ) {
				plugin.init( this.Reveal );
			}
		}
		else {
			console.warn( 'reveal.src_js: "'+ id +'" src_plugin has already been registered' );
		}

	}

	/**
	 * Checks if a specific src_plugin has been registered.
	 *
	 * @param {String} id Unique src_plugin identifier
	 */
	hasPlugin( id ) {

		return !!this.registeredPlugins[id];

	}

	/**
	 * Returns the specific src_plugin instance, if a src_plugin
	 * with the given ID has been registered.
	 *
	 * @param {String} id Unique src_plugin identifier
	 */
	getPlugin( id ) {

		return this.registeredPlugins[id];

	}

	getRegisteredPlugins() {

		return this.registeredPlugins;

	}

	destroy() {

		Object.values( this.registeredPlugins ).forEach( plugin => {
			if( typeof plugin.destroy === 'function' ) {
				plugin.destroy();
			}
		} );

		this.registeredPlugins = {};
		this.asyncDependencies = [];

	}

}
