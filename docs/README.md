# Vuex

-   [Introduction](#introduction)
-   [Install](#install)
-   [Using with Vue3](#using-with-vue3)

## Introduction

Makes vuex stores from ES6 classes.

```js
import Store from "@softvisio/vuex";

// module
class Module1 extends Store {};

// main store
class MyStore extends Store {
    stateProp1; // vuex reactive state property
    _protectedStateProp1 = "test"; // vuex protected reactive state property with initial value

    // props with predefined value instance of Store becomes vuex modules
    module = Module1;

    // vuex reactive getter
    get getter1() {
        return this.stateProp1 + _protectedStateProp1;
    }

    // setter is just setter, no special behaviour is defined
    set getter1 () {}

    // vuex action
    async action1 (value) {
        this.stateProp1 += value;
    }
};
```

-   All enumerable properties become `vuex` reactive state properties.
-   All properties, which predefined values are `Store` sub-classes become `vuex` modules. Instances are silently created during initialization.
-   All `get` accessors become `vuex` reactive getters, returned values are cached by `vuex` (refer to the `vuex` getters documentation).
-   All methods become `vuex` actions.

## Install

```sh
npm i @softvisio/vuex
```

## Using with Vue3

Store class behaves as `vue3` plugin. Install store to your `vue3` application:

```js
import MyStore from "@stores/my-store.js";

app.use(MyStore);
```

It registers as `vue3` `$store` global property. You can get access from `vue3` components:

<!-- prettier-ignore -->
```js
this.$store.prop1;                 // accees reactive state property
this.$store.prop1 = 1;             // commit state property
this.$store.prop2;                 // accees reactive getter
await this.$store.action1();       // dispatch action

this.$store.module1.prop1;         // accees reactive state property from module1

this.$store.module1.$root.prop1;   // accees root store from module
this.$store.module1.$parent.prop1; // accees parent store from module
```