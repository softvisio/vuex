# ES6 classes support for vuex.

# INSTALL

## NPM

```
npm i @softvisio/vuex
```

# How to use

```
import Vue from "vue";
import Store from "@softvisio/vuex";

class Module1 extends Store {

    // ... your module store configuration, see MainStore class below for example ...
}

class MainStore extends Store {
    prop1 = 1;
    _prop2 = 2;

    module1 = Module1;

    get prop2 () {
        return this.prop1 + this._prop2;
    }

    set prop2 ( value ) {
        this._prop2 = value;
    }

    async action1 () {}
}

Vue.prototype.$store = Store.buildStore( MainStore );
```

-   All enumerated properties become reactive `vuex` state properties.
-   All `get` accessors become `vuex` getters, return values are cached by vuex (refer to vuex getters documentation).
-   All methods become `vuex` actions.

How to use from `vue`:

```
this.$store.prop1;                 // accees reactive state property
this.$store.prop1 = 1;             // commit state property
this.$store.prop2;                 // accees reactive getter
await this.$store.action1();       // dispatch action

this.$store.module1.prop1;         // accees reactive state property from module1

this.$store.module1.$root.prop1;   // accees root store from module
this.$store.module1.$parent.prop1; // accees parent store from module
```
