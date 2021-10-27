import { createStore } from "vuex";

export default class Store {
    #initialized;
    #vuex;

    // static
    static new () {
        const store = new ( class Store extends this {} )();

        store.$init();

        return store;
    }

    // public
    $init () {
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
                    const module = descriptor.value.new();

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

    $watch ( ...args ) {
        return this.#vuex.watch( ...args );
    }

    $subscribe ( ...args ) {
        return this.#vuex.subscribe( ...args );
    }
}
