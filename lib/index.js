import { createStore } from "vuex";

var INSTALLED;

export default class Store {
    static install ( app, options, store ) {
        if ( INSTALLED ) throw `Store is already installed`;

        INSTALLED = true;

        Store.prototype.$app = app.config.globalProperties.$app;
        Store.prototype.$api = app.config.globalProperties.$api;
        Store.prototype.$utils = app.config.globalProperties.$utils;

        store = Store.new( store || this );

        app.config.globalProperties.$store = store;
    }

    static new ( store, root, parent ) {

        // class
        if ( typeof store === "function" ) {
            const Class = class extends store {};

            store = new Class();
        }

        // instance, called from "install" method
        else {
            root = store;
        }

        store.$root = root;
        store.$parent = parent;

        store.$_init( root );

        return store;
    }

    #initialized;
    #vuex;

    $_init ( root ) {
        if ( this.#initialized ) throw `Store instance already initialized`;

        this.#initialized = true;

        var store = this;

        const ctx = {
            "state": {},
            "mutations": {},
            "getters": {},
        };

        const idx = {};

        do {
            for ( const name of Object.getOwnPropertyNames( store ) ) {
                if ( name === "constructor" ) continue; // ignore contructor
                if ( name.charAt( 0 ) === "$" ) continue; // ignore internal members

                // skip already processed name
                if ( idx[name] ) continue;

                // register name
                idx[name] = true;

                const descriptor = Object.getOwnPropertyDescriptor( store, name );

                // accessor
                if ( !( "value" in descriptor ) ) {

                    // getter
                    if ( descriptor.get ) {
                        ctx.getters[name] = descriptor.get.bind( this );

                        descriptor.get = state => this.#vuex.getters[name];
                        descriptor.configurable = false;

                        Object.defineProperty( this, name, descriptor );
                    }
                }

                // function
                else if ( typeof descriptor.value === "function" ) {

                    // skip non-module values
                    if ( !( descriptor.value.prototype instanceof Store ) ) continue;

                    // module class
                    const module = this.constructor.new( descriptor.value, root, this );

                    Object.defineProperty( this, name, { "value": module, "writable": false, "enumerable": true, "configurable": false } );
                }

                // property
                else {
                    ctx.state[name] = descriptor.value;

                    ctx.mutations[name] = function ( state, value ) {
                        state[name] = value;
                    };

                    Object.defineProperty( this, name, {
                        "get": () => {
                            return this.#vuex.state[name];
                        },
                        "set": value => {
                            this.#vuex.commit( name, value );
                        },
                        "enumerable": true,
                        "configurable": false,
                    } );
                }
            }
        } while ( ( store = Object.getPrototypeOf( store ) ) && Object.getPrototypeOf( store ) );

        this.#vuex = createStore( ctx );
    }
}
