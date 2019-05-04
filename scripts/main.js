"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("Random", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Random = /** @class */ (function () {
        function Random(seed) {
            if (typeof seed === "undefined")
                seed = new Date().getTime();
            this.seed = seed;
        }
        Random.prototype.next = function () {
            var x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        };
        return Random;
    }());
    exports.Random = Random;
});
define("globals", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEBUG = false;
    exports.MAX_TILE_SPEED = 10; // don't go over this when defining speed, otherwise the heuristic in A* falls apart
    exports.TILE_WIDTH = 16;
    exports.TILE_HEIGHT = 16;
    exports.CHEAP_COST_PATHING = false;
    exports.FOUR_WAY = false;
    exports.SHOW_RADII = false;
    exports.SHOW_SHORTEST_PATH_VISITED = false;
    exports.SHOW_WORKER_PATHS = true;
    exports.PAUSE = false;
    exports.SPEEDUP10 = false;
    function setTileset(tileset) {
        exports.img = tileset;
    }
    exports.setTileset = setTileset;
    function setRenderingContext(context) {
        exports.ctx = context;
    }
    exports.setRenderingContext = setRenderingContext;
    function setOverlayRenderingContext(context) {
        exports.ctxOverlay = context;
    }
    exports.setOverlayRenderingContext = setOverlayRenderingContext;
});
define("simulation/core/Position", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Position = /** @class */ (function () {
        function Position(x, y) {
            this.x = x;
            this.y = y;
        }
        Position.prototype.toString = function () {
            return this.x + "," + this.y;
        };
        return Position;
    }());
    exports.Position = Position;
});
define("simulation/core/Size", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Size = /** @class */ (function () {
        function Size(width, height) {
            this.width = width;
            this.height = height;
        }
        return Size;
    }());
    exports.Size = Size;
});
define("simulation/core/Area", ["require", "exports", "simulation/core/Position", "simulation/core/Size"], function (require, exports, Position_1, Size_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Area = /** @class */ (function () {
        function Area(position, size) {
            this.position = position;
            this.size = size;
        }
        Area.prototype.contains = function (x, y) {
            return x >= this.position.x && x < this.position.x + this.size.width &&
                y >= this.position.y && y < this.position.y + this.size.height;
        };
        Area.prototype.equals = function (area) {
            return this.position.x === area.position.x && this.position.y === area.position.y &&
                this.size.width === area.size.width && this.size.height === area.size.height;
        };
        Area.create = function (x, y, width, height) {
            return new Area(new Position_1.Position(Math.floor(x), Math.floor(y)), new Size_1.Size(width, height));
        };
        return Area;
    }());
    exports.Area = Area;
});
define("datastructs/Map", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Map = /** @class */ (function () {
        function Map() {
            this.obj = {};
        }
        Map.prototype.containsKey = function (key) {
            return this.obj.hasOwnProperty(key) && typeof this.obj[key] !== "undefined";
        };
        Map.prototype.getKeys = function () {
            var keys = [];
            for (var el in this.obj) {
                if (this.obj.hasOwnProperty(el))
                    keys.push(el);
            }
            return keys;
        };
        Map.prototype.get = function (key) {
            var o = this.obj[key];
            if (typeof o === "undefined")
                return null;
            else
                return o;
        };
        Map.prototype.put = function (key, value) {
            this.obj[key] = value;
        };
        Map.prototype.remove = function (key) {
            delete this.obj[key];
        };
        Map.prototype.clone = function () {
            var m = new Map();
            m.obj = {};
            for (var p in this.obj) {
                m.obj[p] = this.obj[p];
            }
            return m;
        };
        return Map;
    }());
    exports.Map = Map;
});
define("simulation/core/storage/StorageContainerDefinition", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorageContainerDefinition = /** @class */ (function () {
        function StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems) {
            this.nrOfStorageSlots = nrOfStorageSlots;
            this.maxNrOfItems = maxNrOfItems;
            // body...
        }
        return StorageContainerDefinition;
    }());
    exports.StorageContainerDefinition = StorageContainerDefinition;
});
define("simulation/core/storage/StorageModificationResult", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorageModificationResult = /** @class */ (function () {
        function StorageModificationResult(actualAmount) {
            this.actualAmount = actualAmount;
        }
        return StorageModificationResult;
    }());
    exports.StorageModificationResult = StorageModificationResult;
});
define("simulation/core/storage/Storage", ["require", "exports", "datastructs/Map", "simulation/core/storage/StorageModificationResult"], function (require, exports, Map_1, StorageModificationResult_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Storage = /** @class */ (function () {
        function Storage(storageContainerDefinition) {
            this.surpressStorageChanged = false;
            this._definition = storageContainerDefinition;
            this.itemKeys = new Array(storageContainerDefinition.nrOfStorageSlots);
            this.itemAmount = new Array(storageContainerDefinition.nrOfStorageSlots);
            this.surpressStorageChanged = true;
            this.clear();
            this.surpressStorageChanged = false;
        }
        Object.defineProperty(Storage.prototype, "definition", {
            get: function () { return this._definition; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Storage.prototype, "isEmpty", {
            get: function () {
                for (var i = 0; i < this.definition.nrOfStorageSlots; i++) {
                    if (this.getItem(i) !== null)
                        return false;
                }
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Storage.prototype.getItem = function (slot) {
            return this.itemKeys[slot];
        };
        Storage.prototype.getAmount = function (slot) {
            return this.itemAmount[slot];
        };
        Storage.prototype.getTotalAmountOf = function (key) {
            var total = 0;
            for (var i = 0; i < this._definition.nrOfStorageSlots; i++) {
                if (this.getItem(i) === key)
                    total += this.getAmount(i);
            }
            return total;
        };
        Storage.prototype.canAdd = function (key, amount) {
            return this.add(key, amount, true).actualAmount > 0;
        };
        Storage.prototype.add = function (key, amount, checkOnly) {
            if (checkOnly === void 0) { checkOnly = false; }
            var actualAmountStored = 0;
            // first fill all slots of that item to max
            for (var i = 0; i < this._definition.nrOfStorageSlots; i++) {
                if (this.itemKeys[i] === key) {
                    var amountToStore = amount - actualAmountStored;
                    if (this.itemAmount[i] + amountToStore <= this._definition.maxNrOfItems) {
                        if (!checkOnly)
                            this.itemAmount[i] += amountToStore;
                        actualAmountStored += amountToStore;
                        if (!checkOnly && actualAmountStored > 0)
                            this.onStorageChanged(true, key, actualAmountStored);
                        return new StorageModificationResult_1.StorageModificationResult(actualAmountStored);
                    }
                    else {
                        // doesn't fit completely
                        var remainder = this._definition.maxNrOfItems - this.itemAmount[i];
                        if (!checkOnly)
                            this.itemAmount[i] += remainder;
                        actualAmountStored += remainder;
                    }
                }
            }
            if (actualAmountStored < amount) {
                // look for empty slots and fill up
                for (var i = 0; i < this._definition.nrOfStorageSlots; i++) {
                    if (this.itemKeys[i] === null) {
                        if (!checkOnly)
                            this.itemKeys[i] = key;
                        var amountToStore = amount - actualAmountStored;
                        if (this.itemAmount[i] + amountToStore <= this._definition.maxNrOfItems) {
                            if (!checkOnly)
                                this.itemAmount[i] += amountToStore;
                            actualAmountStored += amountToStore;
                            if (!checkOnly && actualAmountStored > 0)
                                this.onStorageChanged(true, key, actualAmountStored);
                            return new StorageModificationResult_1.StorageModificationResult(actualAmountStored);
                        }
                        else {
                            // doesn't fit completely
                            var remainder = this._definition.maxNrOfItems - this.itemAmount[i];
                            if (!checkOnly)
                                this.itemAmount[i] += remainder;
                            actualAmountStored += remainder;
                        }
                    }
                }
            }
            if (!checkOnly && actualAmountStored > 0)
                this.onStorageChanged(true, key, actualAmountStored);
            // yeah whatever, not enough room, we stored it to the brim
            return new StorageModificationResult_1.StorageModificationResult(actualAmountStored);
        };
        Storage.prototype.clear = function () {
            for (var i = 0; i < this._definition.nrOfStorageSlots; i++) {
                this.itemKeys[i] = null;
                this.itemAmount[i] = 0;
            }
            this.onStorageChanged(false, null, 0);
        };
        Storage.prototype.canRemove = function (key, amount) {
            var actualAmount = this.remove(key, amount, true).actualAmount;
            return actualAmount >= amount;
        };
        Storage.prototype.remove = function (key, amount, checkOnly) {
            if (checkOnly === void 0) { checkOnly = false; }
            var actualAmountRetrieved = 0;
            for (var i = 0; i < this._definition.nrOfStorageSlots; i++) {
                if (this.itemKeys[i] === key) {
                    if (actualAmountRetrieved + this.itemAmount[i] <= amount) {
                        actualAmountRetrieved += this.itemAmount[i];
                        if (!checkOnly) {
                            this.itemAmount[i] = 0;
                            this.itemKeys[i] = null;
                        }
                    }
                    else {
                        // take the remainder out of slot i
                        var remainder = amount - actualAmountRetrieved;
                        if (!checkOnly)
                            this.itemAmount[i] -= remainder;
                        // no need to go any further, the amount is reached
                        actualAmountRetrieved += remainder;
                        if (!checkOnly && actualAmountRetrieved > 0)
                            this.onStorageChanged(false, key, actualAmountRetrieved);
                        return new StorageModificationResult_1.StorageModificationResult(actualAmountRetrieved);
                    }
                }
            }
            if (!checkOnly && actualAmountRetrieved > 0)
                this.onStorageChanged(false, key, actualAmountRetrieved);
            // not the full requested amount was able to be retrieved
            return new StorageModificationResult_1.StorageModificationResult(actualAmountRetrieved);
        };
        Storage.prototype.transferFrom = function (sourceStorage) {
            for (var i = 0; i < sourceStorage.definition.nrOfStorageSlots; i++) {
                this.transferItemFrom(sourceStorage, sourceStorage.getItem(i), sourceStorage.getAmount(i));
            }
            this.optimize();
        };
        Storage.prototype.transferItemFrom = function (sourceStorage, key, maxAmount) {
            if (maxAmount === void 0) { maxAmount = Number.MAX_VALUE; }
            var removeResult = sourceStorage.remove(key, maxAmount, true);
            // check for available items in source storage
            if (removeResult.actualAmount === 0)
                return 0;
            var addResult = this.add(key, removeResult.actualAmount, true);
            // check for no room in current storage
            if (addResult.actualAmount === 0)
                return 0;
            var amountAbleToTransfer = addResult.actualAmount;
            if (amountAbleToTransfer === 0)
                return 0;
            sourceStorage.remove(key, amountAbleToTransfer);
            this.add(key, amountAbleToTransfer);
            this.optimize();
            return amountAbleToTransfer;
        };
        Storage.prototype.onStorageChanged = function (incoming, item, amount) {
            if (this.surpressStorageChanged)
                return;
            if (typeof this.storageChanged !== "undefined" && this.storageChanged !== null) {
                this.storageChanged(incoming);
            }
        };
        Storage.prototype.optimize = function () {
            this.surpressStorageChanged = true;
            try {
                var allItems = new Map_1.Map();
                for (var i = 0; i < this.definition.nrOfStorageSlots; i++) {
                    if (!allItems.containsKey(this.getItem(i)))
                        allItems.put(this.getItem(i), this.getAmount(i));
                    else
                        allItems.put(this.getItem(i), allItems.get(this.getItem(i)) + this.getAmount(i));
                }
                this.clear();
                for (var _i = 0, _a = allItems.getKeys(); _i < _a.length; _i++) {
                    var key = _a[_i];
                    this.add(key, allItems.get(key));
                }
            }
            finally {
                this.surpressStorageChanged = false;
            }
        };
        return Storage;
    }());
    exports.Storage = Storage;
});
define("simulation/core/storage/IOutputStorageContainer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/metadata/IMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/entity/TileEntityDefinition", ["require", "exports", "globals", "simulation/core/Position"], function (require, exports, globals_1, Position_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileEntityDefinition = /** @class */ (function () {
        function TileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, blocked) {
            if (blocked === void 0) { blocked = false; }
            this.key = key;
            this.blocked = blocked;
            this._size = size;
            this.sourceTilesetPosition = new Position_2.Position(sourceTilesetX, sourceTilesetY);
        }
        Object.defineProperty(TileEntityDefinition.prototype, "size", {
            get: function () { return this._size; },
            enumerable: true,
            configurable: true
        });
        TileEntityDefinition.prototype.destroyEntity = function (world, entity) {
            // do nothing by default, this is called when the entity is removed
            // from the world. Derived definitions can use this to remove event handlers
            // and do other cleanup to prevent memory leaks
        };
        TileEntityDefinition.prototype.update = function (world, entity, timePassed) {
            // be default do nothing
        };
        TileEntityDefinition.prototype.draw = function (world, entity, x, y) {
            globals_1.ctx.drawImage(globals_1.img, this.sourceTilesetPosition.x * globals_1.TILE_WIDTH, this.sourceTilesetPosition.y * globals_1.TILE_HEIGHT, this.size.width * globals_1.TILE_WIDTH, this.size.height * globals_1.TILE_HEIGHT, x * globals_1.TILE_WIDTH, y * globals_1.TILE_HEIGHT, this.size.width * globals_1.TILE_WIDTH, this.size.height * globals_1.TILE_HEIGHT);
        };
        return TileEntityDefinition;
    }());
    exports.TileEntityDefinition = TileEntityDefinition;
});
define("simulation/core/entity/TileEntity", ["require", "exports", "simulation/core/Area", "simulation/core/Position"], function (require, exports, Area_1, Position_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileEntity = /** @class */ (function () {
        function TileEntity(definition, world, x, y) {
            this.metadata = null;
            this.position = new Position_3.Position(x, y);
            this._definition = definition;
            this.metadata = definition.createMetadata();
        }
        Object.defineProperty(TileEntity.prototype, "definition", {
            get: function () { return this._definition; },
            enumerable: true,
            configurable: true
        });
        TileEntity.prototype.getMetadata = function () { return this.metadata; };
        TileEntity.prototype.isBlocked = function (world) {
            return this._definition.blocked;
        };
        TileEntity.prototype.getArea = function () {
            return new Area_1.Area(this.position, this._definition.size);
        };
        TileEntity.prototype.update = function (world, timePassed) {
            // update worker behaviour according to the definition
            this._definition.update(world, this, timePassed);
        };
        TileEntity.prototype.draw = function (world) {
            this._definition.draw(world, this, this.position.x, this.position.y);
        };
        return TileEntity;
    }());
    exports.TileEntity = TileEntity;
});
define("simulation/core/ItemDefinition", ["require", "exports", "globals", "simulation/core/Position"], function (require, exports, globals_2, Position_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemDefinition = /** @class */ (function () {
        function ItemDefinition(key, sourceTilesetX, sourceTilesetY) {
            this.key = key;
            this.sourceTilesetPosition = new Position_4.Position(sourceTilesetX, sourceTilesetY);
        }
        ItemDefinition.prototype.draw = function (world, x, y) {
            globals_2.ctx.drawImage(globals_2.img, this.sourceTilesetPosition.x * globals_2.TILE_WIDTH, this.sourceTilesetPosition.y * globals_2.TILE_HEIGHT, globals_2.TILE_WIDTH, globals_2.TILE_HEIGHT, x * globals_2.TILE_WIDTH - globals_2.TILE_WIDTH / 2, y * globals_2.TILE_HEIGHT - globals_2.TILE_HEIGHT / 2, globals_2.TILE_WIDTH, globals_2.TILE_HEIGHT);
        };
        return ItemDefinition;
    }());
    exports.ItemDefinition = ItemDefinition;
});
define("simulation/core/TileModifierFlags", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileModifierFlags;
    (function (TileModifierFlags) {
        TileModifierFlags[TileModifierFlags["None"] = 0] = "None";
        TileModifierFlags[TileModifierFlags["Blocked"] = 1] = "Blocked";
        TileModifierFlags[TileModifierFlags["Woodcuttable"] = 2] = "Woodcuttable";
    })(TileModifierFlags = exports.TileModifierFlags || (exports.TileModifierFlags = {}));
});
define("simulation/core/Tile", ["require", "exports", "simulation/core/TileModifierFlags"], function (require, exports, TileModifierFlags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tile = /** @class */ (function () {
        function Tile(definitionIndex, entity) {
            if (entity === void 0) { entity = null; }
            this.definitionIndex = definitionIndex;
            this.entity = entity;
        }
        Tile.prototype.isBlocked = function (world) {
            var def = world.getTileDefinition(this.definitionIndex);
            if ((def.flags & TileModifierFlags_1.TileModifierFlags.Blocked) === TileModifierFlags_1.TileModifierFlags.Blocked)
                return true;
            if (this.entity !== null) {
                return this.entity.isBlocked(world);
            }
            return false;
        };
        Tile.prototype.draw = function (world, x, y) {
            var def = world.getTileDefinition(this.definitionIndex);
            def.draw(this.definitionIndex, x, y);
        };
        return Tile;
    }());
    exports.Tile = Tile;
});
define("simulation/core/TileDefinition", ["require", "exports", "globals", "simulation/core/TileModifierFlags"], function (require, exports, globals_3, TileModifierFlags_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileDefinition = /** @class */ (function () {
        function TileDefinition(key, flags, speed) {
            if (flags === void 0) { flags = TileModifierFlags_2.TileModifierFlags.None; }
            if (speed === void 0) { speed = 2; }
            this.key = key;
            this.flags = flags;
            this.speed = speed;
        }
        TileDefinition.prototype.draw = function (idx, x, y) {
            globals_3.ctx.beginPath();
            // ctx.fillStyle = this.color;
            // ctx.fillRect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            globals_3.ctx.drawImage(globals_3.img, idx * globals_3.TILE_WIDTH, 0, globals_3.TILE_WIDTH, globals_3.TILE_HEIGHT, x * globals_3.TILE_WIDTH, y * globals_3.TILE_HEIGHT, globals_3.TILE_WIDTH, globals_3.TILE_HEIGHT);
            globals_3.ctx.fill();
        };
        return TileDefinition;
    }());
    exports.TileDefinition = TileDefinition;
});
define("datastructs/IComparable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("datastructs/IHashable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("datastructs/IHeapItem", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("datastructs/Heap", ["require", "exports", "datastructs/Map"], function (require, exports, Map_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Heap = /** @class */ (function () {
        function Heap() {
            this.array = [];
            this.keyMap = new Map_2.Map();
        }
        Heap.prototype.add = function (obj) {
            if (this.keyMap.containsKey(obj.getKey())) {
                throw new Error("Item with key " + obj.getKey() + " already exists in the heap");
            }
            this.array.push(obj);
            this.keyMap.put(obj.getKey(), this.array.length - 1);
            this.checkParentRequirement(this.array.length - 1);
        };
        Heap.prototype.replaceAt = function (idx, newobj) {
            this.array[idx] = newobj;
            this.keyMap.put(newobj.getKey(), idx);
            this.checkParentRequirement(idx);
            this.checkChildrenRequirement(idx);
        };
        Heap.prototype.shift = function () {
            return this.removeAt(0);
        };
        Heap.prototype.remove = function (obj) {
            var idx = this.keyMap.get(obj.getKey());
            if (idx === -1)
                return;
            this.removeAt(idx);
        };
        Heap.prototype.removeWhere = function (predicate) {
            var itemsToRemove = [];
            for (var i = this.array.length - 1; i >= 0; i--) {
                if (predicate(this.array[i])) {
                    itemsToRemove.push(this.array[i]);
                }
            }
            for (var _i = 0, itemsToRemove_1 = itemsToRemove; _i < itemsToRemove_1.length; _i++) {
                var el = itemsToRemove_1[_i];
                this.remove(el);
            }
            for (var _a = 0, _b = this.array; _a < _b.length; _a++) {
                var el = _b[_a];
                if (predicate(el)) {
                    console.log("Idx of element not removed: " + this.keyMap.get(el.getKey()));
                    throw new Error("element not removed: " + el.getKey());
                }
            }
        };
        Heap.prototype.removeAt = function (idx) {
            var obj = this.array[idx];
            this.keyMap.remove(obj.getKey());
            var isLastElement = idx === this.array.length - 1;
            if (this.array.length > 0) {
                var newobj = this.array.pop();
                if (!isLastElement && this.array.length > 0)
                    this.replaceAt(idx, newobj);
            }
            return obj;
        };
        Heap.prototype.peek = function () {
            return this.array[0];
        };
        Heap.prototype.contains = function (key) {
            return this.keyMap.containsKey(key);
        };
        Heap.prototype.at = function (key) {
            var obj = this.keyMap.get(key);
            if (typeof obj === "undefined")
                return null;
            else
                return this.array[obj];
        };
        Heap.prototype.size = function () {
            return this.array.length;
        };
        Heap.prototype.checkHeapRequirement = function (item) {
            var idx = this.keyMap.get(item.getKey());
            if (idx != null) { // TODO find out why idx is sometimes null
                this.checkParentRequirement(idx);
                this.checkChildrenRequirement(idx);
            }
        };
        Heap.prototype.checkChildrenRequirement = function (idx) {
            var stop = false;
            while (!stop) {
                var left = this.getLeftChildIndex(idx);
                var right = left === -1 ? -1 : left + 1;
                if (left === -1)
                    return;
                if (right >= this.size())
                    right = -1;
                var minIdx = void 0;
                if (right === -1)
                    minIdx = left;
                else
                    minIdx = (this.array[left].compareTo(this.array[right]) < 0) ? left : right;
                if (this.array[idx].compareTo(this.array[minIdx]) > 0) {
                    this.swap(idx, minIdx);
                    idx = minIdx; // iteratively instead of recursion for this.checkChildrenRequirement(minIdx);
                }
                else
                    stop = true;
            }
        };
        Heap.prototype.checkParentRequirement = function (idx) {
            var curIdx = idx;
            var parentIdx = Heap.getParentIndex(curIdx);
            while (parentIdx >= 0 && this.array[parentIdx].compareTo(this.array[curIdx]) > 0) {
                this.swap(curIdx, parentIdx);
                curIdx = parentIdx;
                parentIdx = Heap.getParentIndex(curIdx);
            }
        };
        Heap.prototype.dump = function () {
            if (this.size() === 0)
                return;
            var idx = 0;
            var leftIdx = this.getLeftChildIndex(idx);
            var rightIdx = leftIdx + 1;
            console.log(this.array);
            console.log("--- keymap ---");
            console.log(this.keyMap);
        };
        Heap.prototype.swap = function (i, j) {
            this.keyMap.put(this.array[i].getKey(), j);
            this.keyMap.put(this.array[j].getKey(), i);
            var tmp = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = tmp;
        };
        Heap.prototype.getLeftChildIndex = function (curIdx) {
            var idx = ((curIdx + 1) * 2) - 1;
            if (idx >= this.array.length)
                return -1;
            else
                return idx;
        };
        Heap.getParentIndex = function (curIdx) {
            if (curIdx === 0)
                return -1;
            return Math.floor((curIdx + 1) / 2) - 1;
        };
        Heap.prototype.clone = function () {
            var h = new Heap();
            h.array = this.array.slice(0);
            h.keyMap = this.keyMap.clone();
            return h;
        };
        return Heap;
    }());
    exports.Heap = Heap;
});
define("datastructs/PriorityQueue", ["require", "exports", "datastructs/Heap"], function (require, exports, Heap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PriorityQueue = /** @class */ (function () {
        function PriorityQueue() {
            this.heap = new Heap_1.Heap();
        }
        PriorityQueue.prototype.enqueue = function (obj) {
            this.heap.add(obj);
        };
        PriorityQueue.prototype.peek = function () {
            return this.heap.peek();
        };
        PriorityQueue.prototype.updatePriority = function (key) {
            this.heap.checkHeapRequirement(key);
        };
        PriorityQueue.prototype.get = function (key) {
            return this.heap.at(key);
        };
        Object.defineProperty(PriorityQueue.prototype, "size", {
            get: function () {
                return this.heap.size();
            },
            enumerable: true,
            configurable: true
        });
        PriorityQueue.prototype.dequeue = function () {
            return this.heap.shift();
        };
        PriorityQueue.prototype.dump = function () {
            this.heap.dump();
        };
        PriorityQueue.prototype.contains = function (key) {
            return this.heap.contains(key);
        };
        PriorityQueue.prototype.removeWhere = function (predicate) {
            this.heap.removeWhere(predicate);
        };
        PriorityQueue.prototype.clone = function () {
            var p = new PriorityQueue();
            p.heap = this.heap.clone();
            return p;
        };
        return PriorityQueue;
    }());
    exports.PriorityQueue = PriorityQueue;
});
define("simulation/core/AStarNode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AStarNode = /** @class */ (function () {
        function AStarNode(parent, position, cost) {
            this.parent = parent;
            this.position = position;
            this.cost = cost;
        }
        AStarNode.prototype.compareTo = function (other) {
            var otherNode = other;
            return this.cost - otherNode.cost;
        };
        AStarNode.prototype.getKey = function () {
            return this.position.toString();
        };
        return AStarNode;
    }());
    exports.AStarNode = AStarNode;
});
define("simulation/core/WorldModule", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorldModule = /** @class */ (function () {
        function WorldModule(world) {
            this.world = world;
        }
        return WorldModule;
    }());
    exports.WorldModule = WorldModule;
});
define("simulation/core/WorldPathFinder", ["require", "exports", "datastructs/Map", "datastructs/PriorityQueue", "globals", "simulation/core/AStarNode", "simulation/core/Position", "simulation/core/WorldModule"], function (require, exports, Map_3, PriorityQueue_1, globals_4, AStarNode_1, Position_5, WorldModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorldPathFinder = /** @class */ (function (_super) {
        __extends(WorldPathFinder, _super);
        function WorldPathFinder(world) {
            return _super.call(this, world) || this;
        }
        WorldPathFinder.prototype.getShortestPath = function (fromX, fromY, to, neighbourPredicate) {
            if (isNaN(fromX) || isNaN(fromY) || to == null)
                throw new Error("Invalid from - to");
            fromX = Math.floor(fromX);
            fromY = Math.floor(fromY);
            var queue = new PriorityQueue_1.PriorityQueue();
            var visited = new Map_3.Map();
            var heuristic = WorldPathFinder.getDistance(fromX, fromY, to) / globals_4.MAX_TILE_SPEED; // dividing by max tile speed ensures that the heuristic is always the smallest increment possible
            var startNode = new AStarNode_1.AStarNode(null, new Position_5.Position(fromX, fromY), 0 + heuristic);
            queue.enqueue(startNode);
            var nrIterations = 0;
            while (queue.size > 0) {
                if (nrIterations > 100)
                    return null;
                var node = queue.dequeue();
                if (!visited.containsKey(node.getKey())) {
                    visited.put(node.getKey(), 0);
                    if (globals_4.SHOW_SHORTEST_PATH_VISITED) {
                        globals_4.ctxOverlay.beginPath();
                        globals_4.ctxOverlay.fillStyle = "rgba(0, 0,255, 0.2)";
                        globals_4.ctxOverlay.strokeStyle = "rgba(0, 0,255, 1)";
                        globals_4.ctxOverlay.rect(Math.floor(node.position.x) * globals_4.TILE_WIDTH, Math.floor(node.position.y) * globals_4.TILE_HEIGHT, globals_4.TILE_WIDTH, globals_4.TILE_HEIGHT);
                        globals_4.ctxOverlay.stroke();
                        globals_4.ctxOverlay.fillRect(Math.floor(node.position.x) * globals_4.TILE_WIDTH, Math.floor(node.position.y) * globals_4.TILE_HEIGHT, globals_4.TILE_WIDTH, globals_4.TILE_HEIGHT);
                    }
                    if (to.contains(node.position.x, node.position.y)) {
                        // found path
                        return WorldPathFinder.getPathFromNode(node);
                    }
                    var nodeTileSpeed = this.world.getTileDefinition(this.world.tiles[node.position.x][node.position.y].definitionIndex).speed;
                    for (var j = node.position.y - 1; j <= node.position.y + 1; j++) {
                        for (var i = node.position.x - 1; i <= node.position.x + 1; i++) {
                            if (i >= 0 && j >= 0 && i < this.world.nrOfCols && j < this.world.nrOfRows &&
                                (i !== node.position.x || j !== node.position.y)) {
                                var pos = new Position_5.Position(i, j);
                                var isDiagonal = (i !== node.position.x && j !== node.position.y);
                                if (globals_4.FOUR_WAY && isDiagonal)
                                    continue; // TODO
                                var baseCostToMoveToNeighbour = isDiagonal ? Math.SQRT2 : 1;
                                var defIdx = this.world.tiles[i][j].definitionIndex;
                                var neighBourTileSpeed = this.world.getTileDefinition(defIdx).speed;
                                var costToMoveToNeighbour = (baseCostToMoveToNeighbour / 2) / nodeTileSpeed +
                                    (baseCostToMoveToNeighbour / 2) / neighBourTileSpeed;
                                if (to.contains(i, j)) {
                                    // the target may be blocked, all other tiles may not
                                    // found path
                                    var heuristic_1 = WorldPathFinder.getDistance(pos.x, pos.y, to) / globals_4.MAX_TILE_SPEED; // dividing by max tile speed ensures that the heuristic is always the smallest increment possible
                                    var cost = node.cost + costToMoveToNeighbour + heuristic_1;
                                    return WorldPathFinder.getPathFromNode(new AStarNode_1.AStarNode(node, pos, cost));
                                }
                                if (neighbourPredicate(i, j) && !visited.containsKey(pos.toString())) {
                                    var pos_1 = new Position_5.Position(i, j);
                                    var heuristic_2 = WorldPathFinder.getDistance(pos_1.x, pos_1.y, to) / globals_4.MAX_TILE_SPEED; // dividing by max tile speed ensures that the heuristic is always the smallest increment possible
                                    var cost = void 0;
                                    if (globals_4.CHEAP_COST_PATHING)
                                        cost = heuristic_2;
                                    else
                                        cost = node.cost + costToMoveToNeighbour + heuristic_2;
                                    var existingNode = queue.get(pos_1.toString());
                                    if (typeof existingNode === "undefined")
                                        queue.enqueue(new AStarNode_1.AStarNode(node, pos_1, cost));
                                    else if (existingNode.cost > cost) {
                                        existingNode.cost = cost;
                                        queue.updatePriority(existingNode);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return null;
        };
        /**
         * Uses A* to find the shortest path from a coordinate to an area
         * @param ignoreBlockedArea indicates the area that if true will still be passed through. This is necessary when a worker is inside its building entity (that is usually blocked)
         */
        WorldPathFinder.prototype.getShortestPathForWorker = function (fromX, fromY, ignoreBlockedArea, to) {
            var _this = this;
            var neighbourPredicate = function (i, j) { return !_this.world.tiles[i][j].isBlocked(_this.world) || ignoreBlockedArea.contains(i, j); };
            return this.getShortestPath(fromX, fromY, to, neighbourPredicate);
        };
        WorldPathFinder.getPathFromNode = function (node) {
            var route = [];
            var n = node;
            while (n !== null) {
                route.push(n.position);
                n = n.parent;
            }
            route.reverse();
            return route;
        };
        WorldPathFinder.getDistance = function (fromX, fromY, to) {
            var toX = to.position.x + to.size.width / 2;
            var toY = to.position.y + to.size.height / 2;
            var dx = Math.abs(toX - fromX);
            var dy = Math.abs(toY - fromY);
            // return Math.SQRT2 * Math.min(dx,dy) + Math.abs(dx - dy);
            if (globals_4.FOUR_WAY)
                return (dx + dy);
            else
                return Math.sqrt(dx * dx + dy * dy);
        };
        return WorldPathFinder;
    }(WorldModule_1.WorldModule));
    exports.WorldPathFinder = WorldPathFinder;
});
define("simulation/core/FutureAction", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FutureAction = /** @class */ (function () {
        function FutureAction(creationTime, key, description, action, remainingTimeToFire, entityContext) {
            this.creationTime = creationTime;
            this.key = key;
            this.description = description;
            this.action = action;
            this.remainingTimeToFire = remainingTimeToFire;
            this.entityContext = entityContext;
        }
        FutureAction.prototype.getTimeToFire = function () {
            return this.creationTime + this.remainingTimeToFire;
        };
        FutureAction.prototype.compareTo = function (other) {
            // this is the correct order, lower first
            return this.getTimeToFire() - other.getTimeToFire();
        };
        FutureAction.prototype.getKey = function () {
            return this.key;
        };
        FutureAction.actionCounter = 0;
        return FutureAction;
    }());
    exports.FutureAction = FutureAction;
});
define("simulation/core/WorldScheduler", ["require", "exports", "datastructs/PriorityQueue", "simulation/core/FutureAction", "simulation/core/WorldModule"], function (require, exports, PriorityQueue_2, FutureAction_1, WorldModule_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorldScheduler = /** @class */ (function (_super) {
        __extends(WorldScheduler, _super);
        function WorldScheduler(world) {
            var _this = _super.call(this, world) || this;
            _this._nrOfActionsProcessed = 0;
            _this.currentTime = 0;
            // queue actions based on the their fire time
            _this.futureActions = new PriorityQueue_2.PriorityQueue();
            return _this;
        }
        Object.defineProperty(WorldScheduler.prototype, "processedActionCount", {
            get: function () { return this._nrOfActionsProcessed; },
            enumerable: true,
            configurable: true
        });
        WorldScheduler.prototype.getFutureActions = function () {
            var arr = [];
            var actions = this.futureActions.clone();
            while (actions.size > 0) {
                var action = actions.dequeue();
                arr.push(action);
            }
            return arr;
        };
        WorldScheduler.prototype.scheduleWorldAction = function (key, description, act, remainingTimeToFire) {
            this.scheduleEntityAction(key, null, description, act, remainingTimeToFire);
        };
        WorldScheduler.prototype.scheduleEntityAction = function (key, entityContext, description, act, remainingTimeToFire) {
            if (entityContext !== null) {
                var containsEntity = false;
                for (var _i = 0, _a = this.world.entities; _i < _a.length; _i++) {
                    var e = _a[_i];
                    if (entityContext.id === e.id) {
                        containsEntity = true;
                        break;
                    }
                }
                if (!containsEntity) {
                    var msg = "key=" + key + ", entity:" + entityContext.definition.key + ", id:" + entityContext.id;
                    throw new Error("scheduling action for entity that does not exist: " + msg);
                }
            }
            var action = new FutureAction_1.FutureAction(this.currentTime, WorldScheduler.getFutureActionKey(key, entityContext), description, act, remainingTimeToFire, entityContext);
            // console.log(action.getKey() + " scheduled");
            this.futureActions.enqueue(action);
        };
        WorldScheduler.getFutureActionKey = function (key, entity) {
            if (entity === null)
                return key;
            else
                return entity.id + "_" + key;
        };
        WorldScheduler.prototype.isEntityActionScheduled = function (key, entity) {
            return this.futureActions.contains(WorldScheduler.getFutureActionKey(key, entity));
        };
        WorldScheduler.prototype.removeScheduledEntityActions = function (entity) {
            this.futureActions.removeWhere(function (a) { return a.entityContext !== null && a.entityContext.id === entity.id; });
        };
        WorldScheduler.prototype.update = function (curTime, timePassed) {
            for (var _i = 0, _a = this.world.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                entity.update(this.world, timePassed);
            }
            var stop = false;
            while (this.futureActions.size > 0 && !stop) {
                var action = this.futureActions.peek();
                if (curTime >= action.getTimeToFire()) {
                    this.futureActions.dequeue();
                    // time to fire
                    this.currentTime = action.getTimeToFire(); // the time of the world is now the moment the action is fired
                    // TODO remove this debug block
                    if (action.entityContext !== null && action.entityContext.definition.key === "mediumhouse") {
                        var containsEntity = false;
                        for (var _b = 0, _c = this.world.entities; _b < _c.length; _b++) {
                            var e = _c[_b];
                            if (action.entityContext.id === e.id) {
                                containsEntity = true;
                                break;
                            }
                        }
                        if (!containsEntity) {
                            var msg = "key=" + action.getKey() + ", entity:" + action.entityContext.definition.key + ", id:" + action.entityContext.id;
                            console.log(msg);
                            throw new Error("executing action for entity that does not exist: " + msg);
                        }
                    }
                    // ------
                    action.action();
                    this._nrOfActionsProcessed++;
                }
                else
                    stop = true;
            }
            this.currentTime = curTime;
        };
        return WorldScheduler;
    }(WorldModule_2.WorldModule));
    exports.WorldScheduler = WorldScheduler;
});
define("simulation/core/IUpkeepCost", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/entity/BuildingTileEntityDefinition", ["require", "exports", "simulation/core/entity/BuildingTileEntity", "simulation/core/entity/TileEntityDefinition"], function (require, exports, BuildingTileEntity_1, TileEntityDefinition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BuildingTileEntityDefinition = /** @class */ (function (_super) {
        __extends(BuildingTileEntityDefinition, _super);
        function BuildingTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, blocked, availableNrOfWorkers) {
            if (blocked === void 0) { blocked = true; }
            if (availableNrOfWorkers === void 0) { availableNrOfWorkers = 0; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, blocked) || this;
            _this.blocked = blocked;
            _this.upkeepCost = 0;
            _this._availableNrOfWorkers = 0;
            _this._availableNrOfWorkers = availableNrOfWorkers;
            return _this;
        }
        Object.defineProperty(BuildingTileEntityDefinition.prototype, "availableNrOfWorkers", {
            get: function () { return this._availableNrOfWorkers; },
            enumerable: true,
            configurable: true
        });
        BuildingTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            return new BuildingTileEntity_1.BuildingTileEntity(this, world, x, y);
        };
        return BuildingTileEntityDefinition;
    }(TileEntityDefinition_1.TileEntityDefinition));
    exports.BuildingTileEntityDefinition = BuildingTileEntityDefinition;
});
define("simulation/core/storage/IInputStorageContainer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/metadata/ICachedTargetsMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/metadata/CachedTargetsMetadata", ["require", "exports", "datastructs/Map"], function (require, exports, Map_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CachedTargetsMetadata = /** @class */ (function () {
        function CachedTargetsMetadata() {
            this.targetsInRadius = new Map_4.Map();
        }
        return CachedTargetsMetadata;
    }());
    exports.CachedTargetsMetadata = CachedTargetsMetadata;
});
define("simulation/core/metadata/ProcessMetadata", ["require", "exports", "simulation/core/storage/Storage", "simulation/core/metadata/CachedTargetsMetadata"], function (require, exports, Storage_1, CachedTargetsMetadata_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProcessMetadata = /** @class */ (function (_super) {
        __extends(ProcessMetadata, _super);
        function ProcessMetadata(inputStorageDefinition, outputStorageDefinition) {
            var _this = _super.call(this) || this;
            _this._inputStorage = new Storage_1.Storage(inputStorageDefinition);
            _this._outputStorage = new Storage_1.Storage(outputStorageDefinition);
            return _this;
        }
        Object.defineProperty(ProcessMetadata.prototype, "outputStorage", {
            get: function () {
                return this._outputStorage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProcessMetadata.prototype, "inputStorage", {
            get: function () {
                return this._inputStorage;
            },
            enumerable: true,
            configurable: true
        });
        return ProcessMetadata;
    }(CachedTargetsMetadata_1.CachedTargetsMetadata));
    exports.ProcessMetadata = ProcessMetadata;
});
define("simulation/core/worker/WorkerState", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkerState = /** @class */ (function () {
        function WorkerState(key, worker) {
            this.runningFor = 0;
            this.worker = worker;
            this._key = key;
        }
        Object.defineProperty(WorkerState.prototype, "key", {
            get: function () {
                return this._key;
            },
            enumerable: true,
            configurable: true
        });
        WorkerState.prototype.update = function (timePassed) {
            this.runningFor += timePassed;
        };
        // finishes the state immediately
        WorkerState.prototype.finish = function () {
            this.runningFor = 0;
            this.update(this.getDuration());
        };
        WorkerState.prototype.getDuration = function () {
            return Number.POSITIVE_INFINITY;
        };
        WorkerState.prototype.isFinished = function () {
            return this.runningFor >= this.getDuration();
        };
        WorkerState.prototype.isSuccesful = function () {
            return true;
        };
        WorkerState.prototype.draw = function () {
        };
        return WorkerState;
    }());
    exports.WorkerState = WorkerState;
});
define("simulation/core/worker/Behaviour", ["require", "exports", "simulation/core/worker/WorkerState"], function (require, exports, WorkerState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Behaviour = /** @class */ (function () {
        function Behaviour(key, worker) {
            this.key = key;
            this.worker = worker;
            this.curState = new WorkerState_1.WorkerState("idle", this.worker);
        }
        Behaviour.prototype.update = function (timePassed) {
            // old code, don't use update anymore to change states,
            // instead use future actions to schedule the state change
            // based on its duration
            /* if (this.curState.isFinished())
                 this.curState = this.getNextState(this.curState);
    */
            this.curState.update(timePassed);
        };
        Behaviour.prototype.onStateFinished = function () {
            this.curState.finish();
            var nextState = this.getNextState(this.curState);
            this.changeStateTo(nextState);
        };
        Behaviour.prototype.changeStateTo = function (state) {
            var _this = this;
            this.curState = state;
            if (state.getDuration() !== Number.POSITIVE_INFINITY) {
                var ownerKey = this.worker.owner.definition.key + " " + this.worker.owner.id;
                var workerKey = this.worker.id;
                var name_1 = ownerKey + ", worker " + workerKey + " " + state.key;
                this.worker.world.scheduler.scheduleEntityAction("WORKER_STATE_CHANGE_" + this.worker.id, this.worker.owner, name_1, function () { return _this.onStateFinished(); }, state.getDuration());
            }
        };
        Object.defineProperty(Behaviour.prototype, "executingState", {
            get: function () {
                return this.curState.key;
            },
            enumerable: true,
            configurable: true
        });
        Behaviour.prototype.getNextState = function (curState) {
            return curState;
        };
        Behaviour.prototype.isWorking = function () {
            return false;
        };
        Behaviour.prototype.draw = function () {
            this.curState.draw();
        };
        return Behaviour;
    }());
    exports.Behaviour = Behaviour;
});
define("simulation/core/worker/IFetchItemBehaviourEvents", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/worker/MovingWorkerState", ["require", "exports", "globals", "simulation/core/Position", "simulation/core/worker/WorkerState"], function (require, exports, globals_5, Position_6, WorkerState_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MovingWorkerState = /** @class */ (function (_super) {
        __extends(MovingWorkerState, _super);
        function MovingWorkerState(key, worker, source, destination, roadSegments) {
            if (roadSegments === void 0) { roadSegments = null; }
            var _this = _super.call(this, key, worker) || this;
            _this.destination = destination;
            _this.source = source;
            var x = _this.worker.position.x;
            var y = _this.worker.position.y;
            if (roadSegments === null) {
                var road = _this.worker.findPath(source, destination);
                if (road !== null) {
                    _this.roadSegments = [];
                    _this.roadSegments.push(new Segment(x, y, 0));
                    _this.addSegmentsBetween(_this.roadSegments, x, y, road[0].x + 0.5, road[0].y + 0.5);
                    for (var i = 0; i < road.length - 1; i++) {
                        _this.addSegmentsBetween(_this.roadSegments, road[i].x + 0.5, road[i].y + 0.5, road[i + 1].x + 0.5, road[i + 1].y + 0.5);
                    }
                }
                else {
                    _this.success = false;
                    _this.finished = true;
                }
            }
            else
                _this.roadSegments = roadSegments;
            return _this;
        }
        MovingWorkerState.FromExistingMovingWorkerState = function (key, worker, source, destination, existingState) {
            if (existingState.destination.equals(source) && existingState.source.equals(destination)) {
                var segments = existingState.roadSegments.slice(0);
                segments.reverse();
                return new MovingWorkerState(key, worker, source, destination, segments);
            }
            else
                return new MovingWorkerState(key, worker, source, destination);
        };
        MovingWorkerState.prototype.addSegmentsBetween = function (roadSegments, fromX, fromY, toX, toY) {
            // from -> to will only be to neighbour or to diagonals
            // and always from the middle of the cells so each segment will be
            // 0.5 long for hor/ver  and SQRT2 / 2 long for diagonal
            if (fromX === toX && fromY !== toY) {
                // vertical
                var midY = void 0;
                if (fromY < toY) // to the bottom
                    midY = Math.ceil(fromY);
                else // to the top
                    midY = Math.floor(fromY);
                this.addRoadSegments(roadSegments, 0.5, fromX, midY, toX, toY);
            }
            else if (fromX !== toX && fromY === toY) {
                // horizontal
                var midX = void 0;
                if (fromX < toX) // to the right
                    midX = Math.ceil(fromX);
                else // to the left
                    midX = Math.floor(fromX);
                this.addRoadSegments(roadSegments, 0.5, midX, fromY, toX, toY);
            }
            else if (fromX !== toX && fromY !== toY) {
                // diagonal
                var midX = void 0;
                if (fromX < toX) // to the right
                    midX = Math.ceil(fromX);
                else // to the left
                    midX = Math.floor(fromX);
                var midY = void 0;
                if (fromY < toY) // to the bottom
                    midY = Math.ceil(fromY);
                else // to the top
                    midY = Math.floor(fromY);
                this.addRoadSegments(roadSegments, Math.SQRT2 / 2, midX, midY, toX, toY);
            }
        };
        MovingWorkerState.prototype.addRoadSegments = function (roadSegments, length, fromX, fromY, toX, toY) {
            var defIdx = this.worker.world.getTile(fromX, fromY).definitionIndex;
            var tileSpeed1 = this.worker.world.getTileDefinition(defIdx).speed;
            defIdx = this.worker.world.getTile(toX, toY).definitionIndex;
            var tileSpeed2 = this.worker.world.getTileDefinition(defIdx).speed;
            var nrOfSeconds1 = length / tileSpeed1; // tiles / tiles/sec
            var nrOfSeconds2 = length / tileSpeed2; // tiles / tiles/sec
            roadSegments.push(new Segment(fromX, fromY, nrOfSeconds1 * 1000));
            roadSegments.push(new Segment(toX, toY, nrOfSeconds2 * 1000));
        };
        MovingWorkerState.prototype.update = function (timePassed) {
            this.runningFor += timePassed;
            if (this.roadSegments === null)
                return;
            var pos = this.getPositionAt(this.runningFor);
            if (pos.x === this.roadSegments[this.roadSegments.length - 1].x &&
                pos.y === this.roadSegments[this.roadSegments.length - 1].y) {
                this.success = true;
                this.finished = true;
            }
            this.worker.position.x = pos.x;
            this.worker.position.y = pos.y;
        };
        MovingWorkerState.prototype.getPositionAt = function (time) {
            var cumulDuration = 0; // assuming the first segment is the current state
            if (this.roadSegments === null)
                return new Position_6.Position(this.worker.position.x, this.worker.position.y);
            for (var i = 1; i < this.roadSegments.length; i++) {
                var lbound = cumulDuration;
                var ubound = cumulDuration + this.roadSegments[i].duration;
                if (time >= lbound && time < ubound) {
                    // determine the alpha that indicates how far we are
                    // between the last segment and the current,
                    // for linear interpolation
                    var alpha = (time - lbound) / (ubound - lbound);
                    // now apply that alpha on both vX and vY
                    var vX = this.roadSegments[i].x - this.roadSegments[i - 1].x;
                    var vY = this.roadSegments[i].y - this.roadSegments[i - 1].y;
                    return new Position_6.Position(this.roadSegments[i - 1].x + alpha * vX, this.roadSegments[i - 1].y + alpha * vY);
                }
                cumulDuration += this.roadSegments[i].duration;
            }
            return new Position_6.Position(this.roadSegments[this.roadSegments.length - 1].x, this.roadSegments[this.roadSegments.length - 1].y);
        };
        MovingWorkerState.prototype.getDuration = function () {
            var duration = 0;
            if (this.roadSegments === null)
                return Number.MAX_VALUE;
            for (var _i = 0, _a = this.roadSegments; _i < _a.length; _i++) {
                var seg = _a[_i];
                duration += seg.duration;
            }
            return duration;
        };
        MovingWorkerState.prototype.isFinished = function () {
            return this.finished;
        };
        MovingWorkerState.prototype.isSuccesful = function () {
            return this.success;
        };
        MovingWorkerState.prototype.draw = function () {
            if (globals_5.SHOW_WORKER_PATHS && this.roadSegments !== null) {
                globals_5.ctx.beginPath();
                globals_5.ctx.globalAlpha = 0.5;
                globals_5.ctx.strokeStyle = this.worker.color; // "rgba(64,64,64,0.8)";
                globals_5.ctx.lineWidth = 5;
                for (var i = 0; i < this.roadSegments.length - 1; i++) {
                    globals_5.ctx.moveTo(Math.floor(this.roadSegments[i].x * globals_5.TILE_WIDTH), Math.floor(this.roadSegments[i].y * globals_5.TILE_HEIGHT));
                    globals_5.ctx.lineTo(Math.floor(this.roadSegments[i + 1].x * globals_5.TILE_WIDTH) + 0.5, Math.floor(this.roadSegments[i + 1].y * globals_5.TILE_HEIGHT) + 0.5);
                }
                globals_5.ctx.stroke();
                globals_5.ctx.globalAlpha = 1;
            }
        };
        return MovingWorkerState;
    }(WorkerState_2.WorkerState));
    exports.MovingWorkerState = MovingWorkerState;
});
define("simulation/core/worker/WaitWorkerState", ["require", "exports", "simulation/core/worker/WorkerState"], function (require, exports, WorkerState_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WaitWorkerState = /** @class */ (function (_super) {
        __extends(WaitWorkerState, _super);
        function WaitWorkerState(key, worker, msToWait) {
            var _this = _super.call(this, key, worker) || this;
            _this.msToWait = msToWait;
            return _this;
        }
        WaitWorkerState.prototype.getDuration = function () {
            return this.msToWait;
        };
        WaitWorkerState.prototype.isFinished = function () {
            return this.runningFor >= this.msToWait;
        };
        return WaitWorkerState;
    }(WorkerState_3.WorkerState));
    exports.WaitWorkerState = WaitWorkerState;
});
define("simulation/core/worker/FetchItemBehaviour", ["require", "exports", "simulation/core/worker/Behaviour", "simulation/core/worker/MovingWorkerState", "simulation/core/worker/WaitWorkerState", "simulation/core/worker/WorkerState"], function (require, exports, Behaviour_1, MovingWorkerState_1, WaitWorkerState_1, WorkerState_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FetchItemBehaviour = /** @class */ (function (_super) {
        __extends(FetchItemBehaviour, _super);
        function FetchItemBehaviour(key, worker, waitDurationOnGet, waitDurationOnDropoff, events) {
            var _this = _super.call(this, key, worker) || this;
            _this.waitDurationOnGet = waitDurationOnGet;
            _this.waitDurationOnDropoff = waitDurationOnDropoff;
            _this.events = events;
            _this.lastToTargetMovingState = null;
            _this.events = events;
            _this.waitDurationOnGet = waitDurationOnGet;
            _this.waitDurationOnDropoff = waitDurationOnDropoff;
            _this.curState = new WorkerState_4.WorkerState("idle", _this.worker);
            return _this;
        }
        Object.defineProperty(FetchItemBehaviour.prototype, "itemToFetch", {
            get: function () { return this._itemToFetch; },
            enumerable: true,
            configurable: true
        });
        FetchItemBehaviour.prototype.fetch = function (source, destination, item) {
            this._itemToFetch = item;
            this.source = source;
            this.destination = destination;
            var state = new MovingWorkerState_1.MovingWorkerState("toTarget", this.worker, source, destination);
            if (state.isFinished() && !state.isSuccesful()) {
                state = new WorkerState_4.WorkerState("idle", this.worker);
            }
            this.changeStateTo(state);
        };
        FetchItemBehaviour.prototype.changeStateTo = function (state) {
            _super.prototype.changeStateTo.call(this, state);
            if (state.key === "idle")
                this.events.onWorkerIdle(this.worker);
            else if (state.key === "toTarget") {
                this.lastToTargetMovingState = state;
            }
        };
        FetchItemBehaviour.prototype.getNextState = function (curState) {
            switch (curState.key) {
                case "toTarget":
                    if (curState.isSuccesful()) {
                        var successful = this.events.onWorkerGetItem(this.worker, this.destination);
                        if (!successful)
                            return new WorkerState_4.WorkerState("idle", this.worker);
                        return new WaitWorkerState_1.WaitWorkerState("getItem", this.worker, this.waitDurationOnGet);
                    }
                    else
                        return new WorkerState_4.WorkerState("idle", this.worker);
                case "getItem":
                    /*  if(this.lastToTargetMovingState != null) {
                          // reuse the old route to go back
                          return MovingWorkerState.FromExistingMovingWorkerState("toHome", this.worker, this.destination, this.source, this.lastToTargetMovingState);
                      }*/
                    return new MovingWorkerState_1.MovingWorkerState("toHome", this.worker, this.destination, this.source);
                case "toHome":
                    if (curState.isSuccesful()) {
                        var successful = this.events.onWorkerDropOffItem(this.worker);
                        if (!successful)
                            return new WorkerState_4.WorkerState("waitingForDropoff", this.worker);
                        return new WaitWorkerState_1.WaitWorkerState("dropoffItem", this.worker, this.waitDurationOnDropoff);
                    }
                    else // well dammit, I'm stuck
                        return new WorkerState_4.WorkerState("idle", this.worker);
                case "waitingForDropoff":
                    // no auto change, it has to be signaled to get out of this
                    break;
                case "dropoffItem":
                    return new WorkerState_4.WorkerState("idle", this.worker);
            }
            return curState;
        };
        FetchItemBehaviour.prototype.becomeIdle = function () {
            this.changeStateTo(new WorkerState_4.WorkerState("idle", this.worker));
        };
        FetchItemBehaviour.prototype.isWorking = function () {
            return this.executingState !== "idle" && this.executingState !== "waitingForDropoff";
        };
        return FetchItemBehaviour;
    }(Behaviour_1.Behaviour));
    exports.FetchItemBehaviour = FetchItemBehaviour;
});
define("simulation/core/entity/CanFetchState", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CanFetchState;
    (function (CanFetchState) {
        CanFetchState[CanFetchState["TreshholdReached"] = 0] = "TreshholdReached";
        CanFetchState[CanFetchState["WorkerCantStoreItem"] = 1] = "WorkerCantStoreItem";
        CanFetchState[CanFetchState["NoTargetsInRange"] = 2] = "NoTargetsInRange";
        CanFetchState[CanFetchState["GeneralCantFetch"] = 3] = "GeneralCantFetch";
        CanFetchState[CanFetchState["CanFetch"] = 4] = "CanFetch";
    })(CanFetchState = exports.CanFetchState || (exports.CanFetchState = {}));
});
define("simulation/core/entity/FetchItemBuildingTileEntityDefinition", ["require", "exports", "datastructs/Map", "globals", "simulation/core/Area", "simulation/core/metadata/CachedTargetsMetadata", "simulation/core/worker/FetchItemBehaviour", "simulation/core/entity/BuildingTileEntity", "simulation/core/entity/BuildingTileEntityDefinition", "simulation/core/entity/CanFetchState"], function (require, exports, Map_5, globals_6, Area_2, CachedTargetsMetadata_2, FetchItemBehaviour_1, BuildingTileEntity_2, BuildingTileEntityDefinition_1, CanFetchState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FetchItemBuildingTileEntityDefinition = /** @class */ (function (_super) {
        __extends(FetchItemBuildingTileEntityDefinition, _super);
        function FetchItemBuildingTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, itemsToFetch, blocked, availableNrOfWorkers, nrOfStorageSlots, maxNrOfItems) {
            if (blocked === void 0) { blocked = true; }
            if (availableNrOfWorkers === void 0) { availableNrOfWorkers = 0; }
            if (nrOfStorageSlots === void 0) { nrOfStorageSlots = 1; }
            if (maxNrOfItems === void 0) { maxNrOfItems = 1; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, blocked, availableNrOfWorkers) || this;
            _this.radius = 8;
            _this.scanTargetPeriodicity = 60000;
            _this.timeToRetrieveItem = 1000;
            _this.timeToDeliverItem = 1000;
            _this.scanOnUniqueEntities = true;
            /**
             * If true ensures that 2 workers will never fetch the same item at the same time,
             * even from different sources.
             */
            _this.limitItemsToFetchToSingleWorker = false;
            _this.itemsToFetch = itemsToFetch;
            _this.treshholdForItemsToFetch = new Map_5.Map();
            // by default don't have any treshold and fetch as much as possible
            for (var _i = 0, itemsToFetch_1 = itemsToFetch; _i < itemsToFetch_1.length; _i++) {
                var item = itemsToFetch_1[_i];
                _this.treshholdForItemsToFetch.put(item, Number.MAX_VALUE);
            }
            return _this;
        }
        FetchItemBuildingTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            return new BuildingTileEntity_2.BuildingTileEntity(this, world, x, y);
        };
        FetchItemBuildingTileEntityDefinition.prototype.createMetadata = function () {
            return new CachedTargetsMetadata_2.CachedTargetsMetadata();
        };
        FetchItemBuildingTileEntityDefinition.prototype.initializeEntity = function (world, entity) {
            var _this = this;
            var metadata = entity.getMetadata();
            var entityWorkers = entity.workers;
            for (var _i = 0, entityWorkers_1 = entityWorkers; _i < entityWorkers_1.length; _i++) {
                var entityWorker = entityWorkers_1[_i];
                // switch to fetch wood behaviour if idle worker
                if (typeof entityWorker.behaviour === "undefined") {
                    entityWorker.behaviour = new FetchItemBehaviour_1.FetchItemBehaviour("fetchProductionItem", entityWorker, this.timeToRetrieveItem, this.timeToDeliverItem, this);
                }
                this.onWorkerIdle(entityWorker);
            }
            this.getTargetStorageForDropOff(entity).storageChanged = function (incoming) {
                _this.onTargetForDropOffStorageChanged(incoming, world, entity);
            };
            var scanAction = function () {
                for (var _i = 0, _a = _this.itemsToFetch; _i < _a.length; _i++) {
                    var item = _a[_i];
                    var targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(metadata, item);
                    if (targetsOfItem.length === 0) {
                        // it's been a while, check for targets around entity
                        _this.scanForTargetAroundEntity(world, entity, item, metadata);
                    }
                }
                world.scheduler.scheduleEntityAction("SCAN_TARGETS", entity, "scan for targets for " + entity.definition.key + " " + entity.id, scanAction, _this.scanTargetPeriodicity);
            };
            scanAction();
        };
        FetchItemBuildingTileEntityDefinition.prototype.destroyEntity = function (world, entity) {
            // clean up the event handler of storage changed for this entity
            this.getTargetStorageForDropOff(entity).storageChanged = null;
        };
        FetchItemBuildingTileEntityDefinition.prototype.onTargetForDropOffStorageChanged = function (incoming, world, entity) {
            if (!incoming) {
                for (var _i = 0, _a = entity.workers; _i < _a.length; _i++) {
                    var worker = _a[_i];
                    if (worker.behaviour.executingState === "waitingForDropoff") {
                        var result = this.onWorkerDropOffItem(worker);
                        if (result) {
                            if (globals_6.DEBUG)
                                console.log(entity.definition.key + " - " + entity.id + ", worker " + worker.id + " was able to drop off after storage change");
                            worker.behaviour.becomeIdle();
                        }
                    }
                }
            }
        };
        FetchItemBuildingTileEntityDefinition.getTargetsOfItem = function (metadata, item) {
            var targetsOfItem;
            if (!metadata.targetsInRadius.containsKey(item)) {
                targetsOfItem = [];
                metadata.targetsInRadius.put(item, targetsOfItem);
            }
            else
                targetsOfItem = metadata.targetsInRadius.get(item);
            return targetsOfItem;
        };
        FetchItemBuildingTileEntityDefinition.prototype.scanForTargetAroundEntity = function (world, entity, item, metadata) {
            var _this = this;
            // console.log("scanning");
            // maybe add the cuttable trees in a priority queue instead, so the closest ones are always chosen, if you remove the length == 0 constraint that is
            var entitiesVisitedPerItem = new Map_5.Map();
            for (var _i = 0, _a = this.itemsToFetch; _i < _a.length; _i++) {
                var item_1 = _a[_i];
                entitiesVisitedPerItem.put(item_1, new Map_5.Map());
            }
            world.getTilesAround(entity.getArea(), this.radius, function (x, y) {
                // for (let item of this.itemsToFetch) {
                if (_this.isTarget(world, x, y, item)) {
                    var targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(metadata, item);
                    if (!_this.scanOnUniqueEntities)
                        targetsOfItem.push(Area_2.Area.create(x, y, 1, 1));
                    else {
                        // check if the entity wasn't listed before
                        var e = world.getTile(x, y).entity;
                        if (e === null)
                            targetsOfItem.push(Area_2.Area.create(x, y, 1, 1));
                        else {
                            if (!entitiesVisitedPerItem.get(item).containsKey(e.id + "")) {
                                targetsOfItem.push(e.getArea());
                                entitiesVisitedPerItem.get(item).put(e.id + "", true);
                            }
                        }
                    }
                }
                //  }
                return true; // continue
            });
            // console.log("scanned for targets, " + metadata.targetsInRadius.length + " targets found");
        };
        FetchItemBuildingTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var entity = world.getTile(x, y).entity;
            if (entity !== null) {
                var oContainer = entity.getMetadata();
                if (typeof oContainer.outputStorage !== "undefined" && oContainer.outputStorage.getTotalAmountOf(item) > 0) {
                    return true;
                }
            }
            return false;
        };
        FetchItemBuildingTileEntityDefinition.prototype.onWorkerGetItem = function (worker, dest) {
            var entity = worker.world.getTile(dest.position.x, dest.position.y).entity;
            if (entity !== null) {
                var oContainer = entity.getMetadata();
                if (oContainer.outputStorage) {
                    var itemToFetch = worker.behaviour.itemToFetch;
                    // check the remaining amount to bring back based on the treshold
                    // obviously it's still limited to the amount the worker can carry
                    // but that's handled in the transferItemFrom
                    var curAmount = this.getTargetStorageForDropOff(worker.owner).getTotalAmountOf(itemToFetch);
                    var treshold = this.treshholdForItemsToFetch.get(itemToFetch);
                    var amount = treshold - curAmount;
                    if (amount <= 0) {
                        // ring ring, yes hello worker? Yeah i'm full now, don't bring me anything
                        return true;
                    }
                    worker.outputStorage.transferItemFrom(oContainer.outputStorage, itemToFetch, amount);
                    return true;
                }
            }
            return false;
        };
        FetchItemBuildingTileEntityDefinition.prototype.canFetch = function (worker) {
            for (var _i = 0, _a = this.itemsToFetch; _i < _a.length; _i++) {
                var item = _a[_i];
                if (this.canFetchItem(worker, item) === CanFetchState_1.CanFetchState.CanFetch)
                    return true;
            }
            return false;
        };
        FetchItemBuildingTileEntityDefinition.prototype.canFetchItem = function (worker, item) {
            var storageForDropOff = this.getTargetStorageForDropOff(worker.owner);
            if (storageForDropOff.getTotalAmountOf(item) >= this.treshholdForItemsToFetch.get(item)) {
                if (globals_6.DEBUG)
                    console.log("item " + item + " can't be fetched because storage exceeds treshold " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
                return CanFetchState_1.CanFetchState.TreshholdReached;
            }
            if (!worker.outputStorage.canAdd(item, 1)) {
                if (globals_6.DEBUG)
                    console.log("item " + item + " can't be fetched because the worker can't store it " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
                return CanFetchState_1.CanFetchState.WorkerCantStoreItem;
            }
            var targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(worker.owner.getMetadata(), item);
            if (targetsOfItem.length === 0) {
                if (globals_6.DEBUG)
                    console.log("item " + item + " can't be fetched because there are no targets where it can be fetched from " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
                return CanFetchState_1.CanFetchState.NoTargetsInRange;
            }
            if (globals_6.DEBUG)
                console.log("item " + item + " can be fetched " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
            return CanFetchState_1.CanFetchState.CanFetch;
        };
        FetchItemBuildingTileEntityDefinition.prototype.canDropOffItem = function (worker) {
            // if holding item To Fetch
            for (var _i = 0, _a = this.itemsToFetch; _i < _a.length; _i++) {
                var item = _a[_i];
                if (worker.outputStorage.getItem(0) === item)
                    return true;
            }
            return false;
        };
        FetchItemBuildingTileEntityDefinition.prototype.onWorkerDropOffItem = function (worker) {
            var item = worker.outputStorage.getItem(0);
            var amount = worker.outputStorage.getAmount(0);
            if (amount === 0) // came back empty handed
                return true;
            if (!this.canDropOffItem(worker)) {
                console.log("item " + worker.outputStorage.getItem(0) + " could not be dropped off for " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
                return false;
            }
            var targetStorage = this.getTargetStorageForDropOff(worker.owner);
            var amountTransferred = targetStorage.transferItemFrom(worker.outputStorage, item, amount);
            if (amountTransferred > 0)
                this.onItemDroppedOff(worker, item, amountTransferred);
            // check if not able to drop it off completely
            if (amountTransferred < amount || amountTransferred === 0)
                return false;
            return true;
        };
        FetchItemBuildingTileEntityDefinition.prototype.onItemDroppedOff = function (worker, item, amount) {
            // do nothing by default
        };
        FetchItemBuildingTileEntityDefinition.prototype.onWorkerIdle = function (worker) {
            var _this = this;
            // oi mate, work wot
            if (this.canFetch(worker)) {
                var metadata = worker.owner.getMetadata();
                var itemMostNeeded = this.getItemMostNeeded(worker);
                var targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(metadata, itemMostNeeded);
                if (globals_6.DEBUG)
                    console.log("item most needed is " + itemMostNeeded + " for " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
                if (targetsOfItem.length > 0) {
                    var target = targetsOfItem.shift();
                    // check if still a valid target
                    if (this.isTarget(worker.world, target.position.x, target.position.y, itemMostNeeded)) {
                        var source = worker.owner.getArea();
                        worker.behaviour.fetch(source, target, itemMostNeeded);
                    }
                }
            }
            if (worker.behaviour.executingState === "idle" && !worker.world.scheduler.isEntityActionScheduled("CHECK_IDLE_" + worker.id, worker.owner))
                worker.world.scheduler.scheduleEntityAction("CHECK_IDLE_" + worker.id, worker.owner, "recheck idle status for " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id, function () { return _this.onWorkerIdle(worker); }, 1000);
        };
        FetchItemBuildingTileEntityDefinition.prototype.getItemMostNeeded = function (worker) {
            var storage = this.getTargetStorageForDropOff(worker.owner);
            var minItem = "";
            var minAmount = Number.MAX_VALUE;
            for (var _i = 0, _a = this.itemsToFetch; _i < _a.length; _i++) {
                var item = _a[_i];
                var isAlreadyFetching = false;
                if (this.limitItemsToFetchToSingleWorker) {
                    for (var _b = 0, _c = worker.owner.workers; _b < _c.length; _b++) {
                        var w = _c[_b];
                        if (w !== worker && w.behaviour instanceof FetchItemBehaviour_1.FetchItemBehaviour && (w.behaviour).itemToFetch === item) {
                            isAlreadyFetching = true;
                            break;
                        }
                    }
                }
                if (!isAlreadyFetching && this.canFetchItem(worker, item) == CanFetchState_1.CanFetchState.CanFetch) {
                    var amountOfItem = storage.getTotalAmountOf(item);
                    var tresholdOfItem = this.treshholdForItemsToFetch.get(item);
                    var percentage = amountOfItem / tresholdOfItem;
                    if (minAmount > percentage) {
                        minItem = item;
                        minAmount = percentage;
                    }
                }
            }
            return minItem;
        };
        return FetchItemBuildingTileEntityDefinition;
    }(BuildingTileEntityDefinition_1.BuildingTileEntityDefinition));
    exports.FetchItemBuildingTileEntityDefinition = FetchItemBuildingTileEntityDefinition;
});
define("simulation/core/entity/ProcessResult", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProcessResult = /** @class */ (function () {
        function ProcessResult(success, item, amountUsed, resultItems, resultAmounts) {
            this.success = success;
            this.item = item;
            this.amountUsed = amountUsed;
            this.resultItems = resultItems;
            this.resultAmounts = resultAmounts;
            // body...
        }
        return ProcessResult;
    }());
    exports.ProcessResult = ProcessResult;
});
define("simulation/core/entity/ProcessBuildingTileEntityDefinition", ["require", "exports", "simulation/core/metadata/ProcessMetadata", "simulation/core/storage/StorageContainerDefinition", "simulation/core/entity/BuildingTileEntity", "simulation/core/entity/FetchItemBuildingTileEntityDefinition"], function (require, exports, ProcessMetadata_1, StorageContainerDefinition_1, BuildingTileEntity_3, FetchItemBuildingTileEntityDefinition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProcessBuildingTileEntityDefinition = /** @class */ (function (_super) {
        __extends(ProcessBuildingTileEntityDefinition, _super);
        function ProcessBuildingTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, itemToFetch, blocked, availableNrOfWorkers, nrOfInputStorageSlots, maxNrOfInputItems, nrOfOutputStorageSlots, maxNrOfOutputItems) {
            if (blocked === void 0) { blocked = true; }
            if (availableNrOfWorkers === void 0) { availableNrOfWorkers = 0; }
            if (nrOfInputStorageSlots === void 0) { nrOfInputStorageSlots = 1; }
            if (maxNrOfInputItems === void 0) { maxNrOfInputItems = 1; }
            if (nrOfOutputStorageSlots === void 0) { nrOfOutputStorageSlots = 1; }
            if (maxNrOfOutputItems === void 0) { maxNrOfOutputItems = 1; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, [itemToFetch], blocked, availableNrOfWorkers) || this;
            _this.processPeriodicity = 1000;
            _this.inputStorageDefinition = new StorageContainerDefinition_1.StorageContainerDefinition(nrOfInputStorageSlots, maxNrOfInputItems);
            _this.outputStorageDefinition = new StorageContainerDefinition_1.StorageContainerDefinition(nrOfOutputStorageSlots, maxNrOfOutputItems);
            return _this;
        }
        ProcessBuildingTileEntityDefinition.prototype.createMetadata = function () {
            return new ProcessMetadata_1.ProcessMetadata(this.inputStorageDefinition, this.outputStorageDefinition);
        };
        ProcessBuildingTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            var b = new BuildingTileEntity_3.BuildingTileEntity(this, world, x, y);
            for (var _i = 0, _a = b.workers; _i < _a.length; _i++) {
                var w = _a[_i];
                w.color = "#FF0000";
            }
            return b;
        };
        ProcessBuildingTileEntityDefinition.prototype.getTargetStorageForDropOff = function (entity) {
            return entity.getMetadata().inputStorage;
        };
        ProcessBuildingTileEntityDefinition.prototype.initializeEntity = function (world, entity) {
            var _this = this;
            _super.prototype.initializeEntity.call(this, world, entity);
            var metadata = entity.getMetadata();
            metadata.outputStorage.onStorageChanged = function (incoming) { return _this.onOutputStorageChanged(incoming, world, entity); };
        };
        ProcessBuildingTileEntityDefinition.prototype.scheduleProcess = function (world, entity) {
            var _this = this;
            if (!world.scheduler.isEntityActionScheduled("PROCESS", entity)) {
                // if not scheduled, schedule a process action
                var processAction = function () {
                    var reschedule = _this.onProcessAction(world, entity);
                    if (reschedule) {
                        _this.scheduleProcess(world, entity);
                    }
                };
                world.scheduler.scheduleEntityAction("PROCESS", entity, "processing for " + entity.definition.key + " " + entity.id, processAction, this.processPeriodicity);
            }
        };
        ProcessBuildingTileEntityDefinition.prototype.onTargetForDropOffStorageChanged = function (incoming, world, entity) {
            _super.prototype.onTargetForDropOffStorageChanged.call(this, incoming, world, entity);
            if (incoming) {
                this.scheduleProcess(world, entity);
            }
        };
        ProcessBuildingTileEntityDefinition.prototype.onOutputStorageChanged = function (incoming, world, entity) {
            if (!incoming) { // things were removed, if there wasn't room to store, now maybe there is
                this.scheduleProcess(world, entity);
            }
        };
        ProcessBuildingTileEntityDefinition.prototype.onProcessAction = function (world, entity) {
            var metadata = entity.getMetadata();
            var anySuccess = false;
            for (var i = 0; i < this.inputStorageDefinition.nrOfStorageSlots; i++) {
                var item = metadata.inputStorage.getItem(i);
                // todo only check once per item
                var result = this.getProcess(item, metadata.inputStorage.getTotalAmountOf(item));
                if (result.success) {
                    var canAdd = true;
                    for (var j = 0; j < result.resultItems.length && canAdd; j++) {
                        if (!metadata.outputStorage.canAdd(result.resultItems[j], result.resultAmounts[j]))
                            canAdd = false;
                    }
                    if (canAdd) {
                        metadata.inputStorage.remove(result.item, result.amountUsed);
                        for (var j = 0; j < result.resultItems.length; j++) {
                            metadata.outputStorage.add(result.resultItems[j], result.resultAmounts[j]);
                            world.scoring.onItemProcessed(result.resultItems[j], result.resultAmounts[j]);
                        }
                        anySuccess = true;
                    }
                }
            }
            if (metadata.inputStorage.isEmpty || !anySuccess)
                return false;
            else
                return true;
        };
        return ProcessBuildingTileEntityDefinition;
    }(FetchItemBuildingTileEntityDefinition_1.FetchItemBuildingTileEntityDefinition));
    exports.ProcessBuildingTileEntityDefinition = ProcessBuildingTileEntityDefinition;
});
define("simulation/core/metadata/ProductionMetadata", ["require", "exports", "simulation/core/storage/Storage", "simulation/core/metadata/CachedTargetsMetadata"], function (require, exports, Storage_2, CachedTargetsMetadata_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductionMetadata = /** @class */ (function (_super) {
        __extends(ProductionMetadata, _super);
        function ProductionMetadata(storageDefinition) {
            var _this = _super.call(this) || this;
            _this._outputStorage = new Storage_2.Storage(storageDefinition);
            return _this;
        }
        Object.defineProperty(ProductionMetadata.prototype, "outputStorage", {
            get: function () {
                return this._outputStorage;
            },
            enumerable: true,
            configurable: true
        });
        return ProductionMetadata;
    }(CachedTargetsMetadata_3.CachedTargetsMetadata));
    exports.ProductionMetadata = ProductionMetadata;
});
define("simulation/core/metadata/ProduceMetadata", ["require", "exports", "simulation/core/storage/Storage"], function (require, exports, Storage_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProduceMetadata = /** @class */ (function () {
        function ProduceMetadata(storageDefinition) {
            this._outputStorage = new Storage_3.Storage(storageDefinition);
        }
        Object.defineProperty(ProduceMetadata.prototype, "outputStorage", {
            get: function () {
                return this._outputStorage;
            },
            enumerable: true,
            configurable: true
        });
        return ProduceMetadata;
    }());
    exports.ProduceMetadata = ProduceMetadata;
});
define("simulation/core/entity/ProduceTileEntityDefinition", ["require", "exports", "simulation/core/metadata/ProduceMetadata", "simulation/core/storage/StorageContainerDefinition", "simulation/core/entity/TileEntity", "simulation/core/entity/TileEntityDefinition"], function (require, exports, ProduceMetadata_1, StorageContainerDefinition_2, TileEntity_1, TileEntityDefinition_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProduceTileEntityDefinition = /** @class */ (function (_super) {
        __extends(ProduceTileEntityDefinition, _super);
        function ProduceTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, blocked, nrOfStorageSlots, maxNrOfItems) {
            if (blocked === void 0) { blocked = true; }
            if (nrOfStorageSlots === void 0) { nrOfStorageSlots = 1; }
            if (maxNrOfItems === void 0) { maxNrOfItems = 1; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, blocked) || this;
            _this.blocked = blocked;
            _this.producePeriodicity = 1000;
            _this.outputStorageDefinition = new StorageContainerDefinition_2.StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
            return _this;
        }
        ProduceTileEntityDefinition.prototype.createMetadata = function () {
            return new ProduceMetadata_1.ProduceMetadata(this.outputStorageDefinition);
        };
        ProduceTileEntityDefinition.prototype.initializeEntity = function (world, entity) {
            var _this = this;
            var metadata = entity.getMetadata();
            metadata.outputStorage.onStorageChanged = function (incoming) { return _this.onOutputStorageChanged(incoming, world, entity); };
            this.scheduleProduce(world, entity);
        };
        ProduceTileEntityDefinition.prototype.onOutputStorageChanged = function (incoming, world, entity) {
            if (!incoming) // stuff taken away, maybe we can produce again
                this.scheduleProduce(world, entity);
        };
        ProduceTileEntityDefinition.prototype.scheduleProduce = function (world, entity) {
            var _this = this;
            if (!world.scheduler.isEntityActionScheduled("GENERATE_PRODUCE", entity)) {
                var produceAction = function () {
                    var reschedule = _this.onItemProduced(entity);
                    if (reschedule)
                        _this.scheduleProduce(world, entity);
                };
                world.scheduler.scheduleEntityAction("GENERATE_PRODUCE", entity, "generate produce for " + entity.definition.key + " " + entity.id, produceAction, this.producePeriodicity);
            }
        };
        ProduceTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            return new TileEntity_1.TileEntity(this, world, x, y);
        };
        return ProduceTileEntityDefinition;
    }(TileEntityDefinition_2.TileEntityDefinition));
    exports.ProduceTileEntityDefinition = ProduceTileEntityDefinition;
});
define("simulation/core/entity/ProductionBuildingTileEntityDefinition", ["require", "exports", "simulation/core/metadata/ProductionMetadata", "simulation/core/storage/StorageContainerDefinition", "simulation/core/entity/BuildingTileEntity", "simulation/core/entity/FetchItemBuildingTileEntityDefinition", "simulation/core/entity/ProduceTileEntityDefinition"], function (require, exports, ProductionMetadata_1, StorageContainerDefinition_3, BuildingTileEntity_4, FetchItemBuildingTileEntityDefinition_2, ProduceTileEntityDefinition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProductionBuildingTileEntityDefinition = /** @class */ (function (_super) {
        __extends(ProductionBuildingTileEntityDefinition, _super);
        function ProductionBuildingTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, producedItems, blocked, availableNrOfWorkers, nrOfStorageSlots, maxNrOfItems) {
            if (blocked === void 0) { blocked = true; }
            if (availableNrOfWorkers === void 0) { availableNrOfWorkers = 0; }
            if (nrOfStorageSlots === void 0) { nrOfStorageSlots = 1; }
            if (maxNrOfItems === void 0) { maxNrOfItems = 1; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, producedItems, blocked, availableNrOfWorkers) || this;
            _this.outputStorageDefinition = new StorageContainerDefinition_3.StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
            return _this;
        }
        ProductionBuildingTileEntityDefinition.prototype.createMetadata = function () {
            return new ProductionMetadata_1.ProductionMetadata(this.outputStorageDefinition);
        };
        ProductionBuildingTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            var b = new BuildingTileEntity_4.BuildingTileEntity(this, world, x, y);
            for (var _i = 0, _a = b.workers; _i < _a.length; _i++) {
                var w = _a[_i];
                w.color = "#00FF00";
            }
            return b;
        };
        ProductionBuildingTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var result = _super.prototype.isTarget.call(this, world, x, y, item);
            if (!result)
                return false;
            // super already checks if there are entities with output storage of the item to fetch
            // so if there are, narrow it down to only wheatfarms
            var entity = world.getTile(x, y).entity;
            if (entity !== null && entity.definition instanceof ProduceTileEntityDefinition_1.ProduceTileEntityDefinition)
                return true;
            return false;
        };
        ProductionBuildingTileEntityDefinition.prototype.getTargetStorageForDropOff = function (entity) {
            var metadata = entity.getMetadata();
            return metadata.outputStorage;
        };
        ProductionBuildingTileEntityDefinition.prototype.onItemDroppedOff = function (worker, item, amount) {
            worker.world.scoring.onItemProduced(item, amount);
        };
        return ProductionBuildingTileEntityDefinition;
    }(FetchItemBuildingTileEntityDefinition_2.FetchItemBuildingTileEntityDefinition));
    exports.ProductionBuildingTileEntityDefinition = ProductionBuildingTileEntityDefinition;
});
define("simulation/core/ITaxProfit", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("simulation/core/WorldScoring", ["require", "exports", "simulation/core/entity/BuildingTileEntityDefinition", "simulation/core/entity/ProcessBuildingTileEntityDefinition", "simulation/core/entity/ProductionBuildingTileEntityDefinition", "simulation/core/WorldModule"], function (require, exports, BuildingTileEntityDefinition_2, ProcessBuildingTileEntityDefinition_1, ProductionBuildingTileEntityDefinition_1, WorldModule_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorldScoring = /** @class */ (function (_super) {
        __extends(WorldScoring, _super);
        function WorldScoring(world) {
            var _this = _super.call(this, world) || this;
            _this.payDayEvery = 1000;
            _this.lastIncome = 0;
            _this.lastExpense = 0;
            _this.workerCount = 0;
            _this.idleWorkerCount = 0;
            _this.money = 0;
            _this.nrOfItemsProduced = 0;
            _this.nrOfItemsProcessed = 0;
            _this.world.scheduler.scheduleWorldAction("PAYDAY", "Pay day", function () { return _this.onPayDay(); }, _this.payDayEvery);
            _this.world.scheduler.scheduleWorldAction("COUNT_IDLE_WORKERS", "Count the nr of workers being idle", function () { return _this.countIdleWorkers(); }, 1000);
            return _this;
        }
        WorldScoring.prototype.onItemProduced = function (item, amount) {
            this.nrOfItemsProduced += amount;
        };
        WorldScoring.prototype.onItemProcessed = function (item, amount) {
            this.nrOfItemsProcessed += amount;
        };
        WorldScoring.prototype.onPayDay = function () {
            var _this = this;
            this.lastIncome = 0;
            this.lastExpense = 0;
            for (var _i = 0, _a = this.world.entities; _i < _a.length; _i++) {
                var e = _a[_i];
                if (e.definition instanceof BuildingTileEntityDefinition_2.BuildingTileEntityDefinition) {
                    this.money -= e.definition.upkeepCost / 60;
                    this.lastExpense += e.definition.upkeepCost / 60;
                }
                if (e.definition.taxAmount) {
                    this.money += e.definition.taxAmount / 60;
                    this.lastIncome += e.definition.taxAmount / 60;
                }
            }
            this.world.scheduler.scheduleWorldAction("PAYDAY", "Pay day", function () { return _this.onPayDay(); }, this.payDayEvery);
        };
        WorldScoring.prototype.countIdleWorkers = function () {
            var _this = this;
            this.workerCount = 0;
            for (var _i = 0, _a = this.world.entities; _i < _a.length; _i++) {
                var e = _a[_i];
                if (e.definition instanceof ProductionBuildingTileEntityDefinition_1.ProductionBuildingTileEntityDefinition
                    || e.definition instanceof ProcessBuildingTileEntityDefinition_1.ProcessBuildingTileEntityDefinition) {
                    for (var _b = 0, _c = e.workers; _b < _c.length; _b++) {
                        var w = _c[_b];
                        if (!w.behaviour.isWorking()) {
                            this.idleWorkerCount++;
                        }
                        this.workerCount++;
                    }
                }
            }
            this.world.scheduler.scheduleWorldAction("COUNT_IDLE_WORKERS", "Count the nr of workers being idle", function () { return _this.countIdleWorkers(); }, 1000);
        };
        return WorldScoring;
    }(WorldModule_3.WorldModule));
    exports.WorldScoring = WorldScoring;
});
define("simulation/core/World", ["require", "exports", "datastructs/Map", "globals", "simulation/core/entity/BuildingTileEntity", "simulation/core/WorldPathFinder", "simulation/core/WorldScheduler", "simulation/core/WorldScoring"], function (require, exports, Map_6, globals_7, BuildingTileEntity_5, WorldPathFinder_1, WorldScheduler_1, WorldScoring_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var World = /** @class */ (function () {
        function World(nrOfCols, nrOfRows, tileset, entitySet, tiles, entities, itemSet) {
            this.newEntityId = 1;
            this._nrOfCols = nrOfCols;
            this._nrOfRows = nrOfRows;
            this.tileset = tileset;
            this.tilesetIndices = new Map_6.Map();
            for (var i = 0; i < tileset.length; i++)
                this.tilesetIndices.put(tileset[i].key, i);
            this.entitySet = new Map_6.Map();
            for (var _i = 0, entitySet_1 = entitySet; _i < entitySet_1.length; _i++) {
                var eDef = entitySet_1[_i];
                this.entitySet.put(eDef.key, eDef);
            }
            this.itemSet = new Map_6.Map();
            for (var _a = 0, itemSet_1 = itemSet; _a < itemSet_1.length; _a++) {
                var itemDef = itemSet_1[_a];
                this.itemSet.put(itemDef.key, itemDef);
            }
            this._entities = entities;
            this._tiles = tiles;
            this._scheduler = new WorldScheduler_1.WorldScheduler(this);
            this._pathfinder = new WorldPathFinder_1.WorldPathFinder(this);
            this._scoring = new WorldScoring_1.WorldScoring(this);
        }
        Object.defineProperty(World.prototype, "nrOfCols", {
            get: function () { return this._nrOfCols; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(World.prototype, "nrOfRows", {
            get: function () { return this._nrOfRows; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(World.prototype, "tiles", {
            get: function () { return this._tiles; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(World.prototype, "entities", {
            get: function () { return this._entities; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(World.prototype, "scheduler", {
            get: function () { return this._scheduler; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(World.prototype, "pathfinder", {
            get: function () { return this._pathfinder; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(World.prototype, "scoring", {
            get: function () { return this._scoring; },
            enumerable: true,
            configurable: true
        });
        World.prototype.draw = function () {
            this.drawGrid();
            for (var j = 0; j < this._nrOfRows; j++) {
                for (var i = 0; i < this._nrOfCols; i++) {
                    this.tiles[i][j].draw(this, i, j);
                }
            }
            for (var _i = 0, _a = this._entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                entity.draw(this);
                if (entity instanceof BuildingTileEntity_5.BuildingTileEntity) {
                    entity.drawWorkers();
                }
            }
        };
        World.prototype.drawGrid = function () {
            globals_7.ctx.lineWidth = 1;
            globals_7.ctx.strokeStyle = "grey";
            globals_7.ctx.beginPath();
            for (var j = 0; j <= this._nrOfRows; j++) {
                globals_7.ctx.moveTo(0.5, Math.floor(j * globals_7.TILE_HEIGHT) + 0.5);
                globals_7.ctx.lineTo(Math.floor(this._nrOfCols * globals_7.TILE_WIDTH) + 0.5, Math.floor(j * globals_7.TILE_HEIGHT) + 0.5);
            }
            for (var i = 0; i <= this._nrOfCols; i++) {
                globals_7.ctx.moveTo(Math.floor(i * globals_7.TILE_WIDTH) + 0.5, 0.5);
                globals_7.ctx.lineTo(Math.floor(i * globals_7.TILE_WIDTH) + 0.5, Math.floor(this._nrOfRows * globals_7.TILE_HEIGHT) + 0.5);
            }
            globals_7.ctx.stroke();
        };
        // tiles
        World.prototype.getTile = function (x, y) {
            return this.tiles[Math.floor(x)][Math.floor(y)];
        };
        World.prototype.getTileDefinition = function (definitionIndex) {
            return this.tileset[definitionIndex];
        };
        World.prototype.getTilesAround = function (from, radius, action) {
            var l = from.position.x;
            var r = from.position.x + from.size.width - 1;
            var t = from.position.y;
            var b = from.position.y + from.size.height - 1;
            var curX = l;
            var curY = t - 1;
            var curRadius = 0;
            while (curRadius < radius) {
                var edgeWidth = 1 + 2 * curRadius;
                for (var i = l; i <= r + edgeWidth; i++) {
                    if (this.isValidTile(curX, curY)) {
                        if (globals_7.SHOW_RADII) {
                            globals_7.ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                            globals_7.ctxOverlay.fillRect(curX * globals_7.TILE_WIDTH, curY * globals_7.TILE_HEIGHT, globals_7.TILE_WIDTH, globals_7.TILE_HEIGHT);
                        }
                        var cont = action(curX, curY);
                        if (!cont)
                            return;
                    }
                    curX++;
                }
                curX--;
                curY++;
                for (var i = t; i <= b + edgeWidth; i++) {
                    if (this.isValidTile(curX, curY)) {
                        if (globals_7.SHOW_RADII) {
                            globals_7.ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                            globals_7.ctxOverlay.fillRect(curX * globals_7.TILE_WIDTH, curY * globals_7.TILE_HEIGHT, globals_7.TILE_WIDTH, globals_7.TILE_HEIGHT);
                        }
                        var cont = action(curX, curY);
                        if (!cont)
                            return;
                    }
                    curY++;
                }
                curY--;
                curX--;
                for (var i = r; i >= l - edgeWidth; i--) {
                    if (this.isValidTile(curX, curY)) {
                        if (globals_7.SHOW_RADII) {
                            globals_7.ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                            globals_7.ctxOverlay.fillRect(curX * globals_7.TILE_WIDTH, curY * globals_7.TILE_HEIGHT, globals_7.TILE_WIDTH, globals_7.TILE_HEIGHT);
                        }
                        var cont = action(curX, curY);
                        if (!cont)
                            return;
                    }
                    curX--;
                }
                curX++;
                curY--;
                for (var i = b; i >= t - edgeWidth; i--) {
                    if (this.isValidTile(curX, curY)) {
                        if (globals_7.SHOW_RADII) {
                            globals_7.ctxOverlay.fillStyle = "rgba(255,255,0,0.5)";
                            globals_7.ctxOverlay.fillRect(curX * globals_7.TILE_WIDTH, curY * globals_7.TILE_HEIGHT, globals_7.TILE_WIDTH, globals_7.TILE_HEIGHT);
                        }
                        var cont = action(curX, curY);
                        if (!cont)
                            return;
                    }
                    curY--;
                }
                curRadius++;
            }
        };
        World.prototype.isValidTile = function (x, y) {
            return x >= 0 && y >= 0 && x < this._nrOfCols && y < this._nrOfRows;
        };
        World.prototype.isTileOfDefiniton = function (x, y, key) {
            if (!this.tilesetIndices.containsKey(key))
                throw new Error("The tile definition with key " + key + " doesn't exist in the tileset");
            return this.tiles[x][y].definitionIndex === this.tilesetIndices.get(key);
        };
        // tile entities
        World.prototype.setTileDefinition = function (x, y, key) {
            if (!this.tilesetIndices.containsKey(key))
                throw new Error("The tile definition with key " + key + " doesn't exist in the tileset");
            this.tiles[x][y].definitionIndex = this.tilesetIndices.get(key);
        };
        World.prototype.canPlaceEntity = function (entity) {
            var area = entity.getArea();
            for (var j = area.position.y; j < area.position.y + area.size.height; j++) {
                for (var i = area.position.x; i < area.position.x + area.size.width; i++) {
                    if (!this.isValidTile(i, j) || this.tiles[i][j].isBlocked(this))
                        return false;
                }
            }
            return true;
        };
        World.prototype.placeEntity = function (entity) {
            this._entities.push(entity);
            entity.id = this.newEntityId++;
            entity.definition.initializeEntity(this, entity);
            var area = entity.getArea();
            for (var j = area.position.y; j < area.position.y + area.size.height; j++) {
                for (var i = area.position.x; i < area.position.x + area.size.width; i++) {
                    this.tiles[i][j].definitionIndex = 1; // dirt, todo make this a setting
                    this.tiles[i][j].entity = entity;
                }
            }
            if (globals_7.DEBUG)
                console.log("Placing entity " + entity.definition.key + " " + entity.id + " at " + entity.getArea().position.x + "," + entity.getArea().position.y);
        };
        World.prototype.removeEntity = function (entity) {
            if (globals_7.DEBUG)
                console.log("Removing entity " + entity.definition.key + " " + entity.id + " at " + entity.getArea().position.x + "," + entity.getArea().position.y);
            for (var i = 0; i < this._entities.length; i++) {
                if (this._entities[i].id === entity.id) {
                    // remove all scheduled of this entity
                    this._scheduler.removeScheduledEntityActions(entity);
                    // remove from tiles
                    var area = entity.getArea();
                    for (var y = area.position.y; y < area.position.y + area.size.height; y++) {
                        for (var x = area.position.x; x < area.position.x + area.size.width; x++) {
                            this.tiles[x][y].entity = null;
                        }
                    }
                    // remove from entities list
                    this._entities.splice(i, 1);
                    // destroy the entity so any event handlers are cleaned up
                    entity.definition.destroyEntity(this, entity);
                    return;
                }
            }
        };
        World.prototype.getTileEntityDefinition = function (key) {
            return this.entitySet.get(key);
        };
        World.prototype.getItem = function (key) {
            return this.itemSet.get(key);
        };
        return World;
    }());
    exports.World = World;
});
define("simulation/core/worker/WorkerStorageDefinition", ["require", "exports", "simulation/core/storage/StorageContainerDefinition"], function (require, exports, StorageContainerDefinition_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkerStorageDefinition = /** @class */ (function (_super) {
        __extends(WorkerStorageDefinition, _super);
        function WorkerStorageDefinition() {
            return _super.call(this, 1, 5) || this;
        }
        WorkerStorageDefinition.instance = new WorkerStorageDefinition();
        return WorkerStorageDefinition;
    }(StorageContainerDefinition_4.StorageContainerDefinition));
    exports.WorkerStorageDefinition = WorkerStorageDefinition;
});
define("simulation/core/worker/Worker", ["require", "exports", "globals", "simulation/core/Position", "simulation/core/storage/Storage", "simulation/core/worker/WorkerStorageDefinition"], function (require, exports, globals_8, Position_7, Storage_4, WorkerStorageDefinition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Worker = /** @class */ (function () {
        function Worker(world, owner, x, y) {
            this.color = "#000000";
            this._owner = owner;
            this.world = world;
            this.position = new Position_7.Position(x, y);
            // this.behaviour = new Behaviour("idle", this);
            this._storage = new Storage_4.Storage(WorkerStorageDefinition_1.WorkerStorageDefinition.instance);
        }
        Object.defineProperty(Worker.prototype, "owner", {
            get: function () { return this._owner; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Worker.prototype, "outputStorage", {
            get: function () { return this._storage; },
            enumerable: true,
            configurable: true
        });
        Worker.prototype.findPath = function (source, destination) {
            return this.world.pathfinder.getShortestPathForWorker(this.position.x, this.position.y, source, destination);
        };
        Worker.prototype.draw = function () {
            this.behaviour.draw();
            globals_8.ctx.beginPath();
            globals_8.ctx.fillStyle = this.color;
            globals_8.ctx.arc(this.position.x * globals_8.TILE_WIDTH, this.position.y * globals_8.TILE_HEIGHT, 4, 0, Math.PI * 2, false);
            globals_8.ctx.fill();
            if (this.outputStorage.getItem(0) !== null && this.outputStorage.getAmount(0) > 0) {
                var item = this.world.getItem(this.outputStorage.getItem(0));
                item.draw(this.world, this.position.x, this.position.y);
            }
        };
        return Worker;
    }());
    exports.Worker = Worker;
});
define("simulation/core/entity/BuildingTileEntity", ["require", "exports", "simulation/core/worker/Worker", "simulation/core/entity/TileEntity"], function (require, exports, Worker_1, TileEntity_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BuildingTileEntity = /** @class */ (function (_super) {
        __extends(BuildingTileEntity, _super);
        function BuildingTileEntity(definition, world, x, y) {
            var _this = _super.call(this, definition, world, x, y) || this;
            _this.createWorkers(definition, world);
            return _this;
        }
        Object.defineProperty(BuildingTileEntity.prototype, "workers", {
            get: function () {
                return this._workers;
            },
            enumerable: true,
            configurable: true
        });
        BuildingTileEntity.prototype.createWorkers = function (definition, world) {
            if (definition.availableNrOfWorkers > 0) {
                this._workers = [];
                for (var i = 0; i < definition.availableNrOfWorkers; i++) {
                    this._workers[i] = new Worker_1.Worker(world, this, this.position.x + definition.size.width / 2, this.position.y + definition.size.height / 2);
                    this._workers[i].id = i;
                }
            }
        };
        BuildingTileEntity.prototype.drawWorkers = function () {
            for (var _i = 0, _a = this._workers; _i < _a.length; _i++) {
                var worker = _a[_i];
                worker.draw();
            }
        };
        BuildingTileEntity.prototype.update = function (world, timePassed) {
            _super.prototype.update.call(this, world, timePassed);
            // update workers
            for (var _i = 0, _a = this._workers; _i < _a.length; _i++) {
                var worker = _a[_i];
                worker.behaviour.update(timePassed);
            }
        };
        return BuildingTileEntity;
    }(TileEntity_2.TileEntity));
    exports.BuildingTileEntity = BuildingTileEntity;
});
define("simulation/implementation/BakeryTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProcessBuildingTileEntityDefinition", "simulation/core/entity/ProcessResult", "simulation/core/Size"], function (require, exports, ProcessBuildingTileEntityDefinition_2, ProcessResult_1, Size_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BakeryTileEntityDefinition = /** @class */ (function (_super) {
        __extends(BakeryTileEntityDefinition, _super);
        function BakeryTileEntityDefinition() {
            var _this = _super.call(this, "bakery", new Size_2.Size(2, 2), 14, 2, "flour", true, 1, 1, 40, 1, 40) || this;
            _this.scanTargetPeriodicity = 5000;
            _this.upkeepCost = 50;
            return _this;
        }
        BakeryTileEntityDefinition.prototype.getProcess = function (item, amount) {
            var success = item === "flour" && amount >= 2;
            return new ProcessResult_1.ProcessResult(success, "flour", 2, ["bread"], [1]);
        };
        BakeryTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var result = _super.prototype.isTarget.call(this, world, x, y, item);
            if (!result)
                return false;
            // super already checks if there are entities with output storage of the item to fetch
            // so if there are, narrow it down to only windmills
            var entity = world.getTile(x, y).entity;
            if (entity !== null && entity.definition.key === "windmill")
                return true;
            return false;
        };
        return BakeryTileEntityDefinition;
    }(ProcessBuildingTileEntityDefinition_2.ProcessBuildingTileEntityDefinition));
    exports.BakeryTileEntityDefinition = BakeryTileEntityDefinition;
});
define("simulation/implementation/BoulderTileEntityDefinition", ["require", "exports", "simulation/core/Size", "simulation/core/entity/ProduceTileEntityDefinition"], function (require, exports, Size_3, ProduceTileEntityDefinition_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BoulderTileEntityDefinition = /** @class */ (function (_super) {
        __extends(BoulderTileEntityDefinition, _super);
        function BoulderTileEntityDefinition() {
            var _this = _super.call(this, "boulder", new Size_3.Size(2, 2), 24, 2, true, 1, 5) || this;
            _this.producePeriodicity = 10000;
            return _this;
        }
        BoulderTileEntityDefinition.prototype.onItemProduced = function (entity) {
            var metadata = entity.getMetadata();
            var result = metadata.outputStorage.add("stone", 1);
            return result.actualAmount > 0; // stop production as soon as we can't produce anymore
        };
        return BoulderTileEntityDefinition;
    }(ProduceTileEntityDefinition_2.ProduceTileEntityDefinition));
    exports.BoulderTileEntityDefinition = BoulderTileEntityDefinition;
});
define("simulation/implementation/ButcherTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProcessBuildingTileEntityDefinition", "simulation/core/entity/ProcessResult", "simulation/core/Size"], function (require, exports, ProcessBuildingTileEntityDefinition_3, ProcessResult_2, Size_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ButcherTileEntityDefinition = /** @class */ (function (_super) {
        __extends(ButcherTileEntityDefinition, _super);
        function ButcherTileEntityDefinition() {
            var _this = _super.call(this, "butcher", new Size_4.Size(2, 2), 30, 2, "cow", true, 1, 1, 40, 2, 40) || this;
            _this.scanTargetPeriodicity = 5000;
            _this.upkeepCost = 80;
            return _this;
        }
        ButcherTileEntityDefinition.prototype.getProcess = function (item, amount) {
            var success = item === "cow" && amount >= 1;
            return new ProcessResult_2.ProcessResult(success, "cow", 1, ["leather", "beef"], [1, 2]);
        };
        ButcherTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var result = _super.prototype.isTarget.call(this, world, x, y, item);
            if (!result)
                return false;
            var entity = world.getTile(x, y).entity;
            if (entity !== null && entity.definition.key === "pasture")
                return true;
            return false;
        };
        return ButcherTileEntityDefinition;
    }(ProcessBuildingTileEntityDefinition_3.ProcessBuildingTileEntityDefinition));
    exports.ButcherTileEntityDefinition = ButcherTileEntityDefinition;
});
define("simulation/core/metadata/ConsumeMetadata", ["require", "exports", "simulation/core/storage/Storage", "simulation/core/metadata/CachedTargetsMetadata"], function (require, exports, Storage_5, CachedTargetsMetadata_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConsumeMetadata = /** @class */ (function (_super) {
        __extends(ConsumeMetadata, _super);
        function ConsumeMetadata(storageDefinition) {
            var _this = _super.call(this) || this;
            _this._inputStorage = new Storage_5.Storage(storageDefinition);
            return _this;
        }
        Object.defineProperty(ConsumeMetadata.prototype, "inputStorage", {
            get: function () {
                return this._inputStorage;
            },
            enumerable: true,
            configurable: true
        });
        return ConsumeMetadata;
    }(CachedTargetsMetadata_4.CachedTargetsMetadata));
    exports.ConsumeMetadata = ConsumeMetadata;
});
define("simulation/core/entity/ConsumeBuildingTileEntityDefinition", ["require", "exports", "globals", "simulation/core/metadata/ConsumeMetadata", "simulation/core/storage/StorageContainerDefinition", "simulation/core/entity/BuildingTileEntity", "simulation/core/entity/FetchItemBuildingTileEntityDefinition"], function (require, exports, globals_9, ConsumeMetadata_1, StorageContainerDefinition_5, BuildingTileEntity_6, FetchItemBuildingTileEntityDefinition_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConsumeBuildingTileEntityDefinition = /** @class */ (function (_super) {
        __extends(ConsumeBuildingTileEntityDefinition, _super);
        function ConsumeBuildingTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, consumedItems, blocked, availableNrOfWorkers, nrOfStorageSlots, maxNrOfItems) {
            if (blocked === void 0) { blocked = true; }
            if (availableNrOfWorkers === void 0) { availableNrOfWorkers = 0; }
            if (nrOfStorageSlots === void 0) { nrOfStorageSlots = 1; }
            if (maxNrOfItems === void 0) { maxNrOfItems = 1; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, consumedItems, blocked, availableNrOfWorkers) || this;
            _this.consumePeriodicity = 1000;
            _this.inputStorageDefinition = new StorageContainerDefinition_5.StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
            return _this;
        }
        ConsumeBuildingTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            return new BuildingTileEntity_6.BuildingTileEntity(this, world, x, y);
        };
        ConsumeBuildingTileEntityDefinition.prototype.createMetadata = function () {
            return new ConsumeMetadata_1.ConsumeMetadata(this.inputStorageDefinition);
        };
        ConsumeBuildingTileEntityDefinition.prototype.getTargetStorageForDropOff = function (entity) {
            return entity.getMetadata().inputStorage;
        };
        ConsumeBuildingTileEntityDefinition.prototype.initializeEntity = function (world, entity) {
            _super.prototype.initializeEntity.call(this, world, entity);
            this.scheduleConsume(world, entity);
        };
        ConsumeBuildingTileEntityDefinition.prototype.scheduleConsume = function (world, entity) {
            var _this = this;
            var consumeAction = function () {
                var e = entity;
                var reschedule = _this.onConsume(entity);
                if (reschedule) {
                    _this.scheduleConsume(world, entity);
                }
                else {
                    if (globals_9.DEBUG)
                        console.log("CONSUMPTION FOR " + e.definition.key + " " + e.id + " IS NOT RESCHEDULED");
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME", entity, "consumption for " + entity.definition.key + " " + entity.id, consumeAction, this.consumePeriodicity);
        };
        return ConsumeBuildingTileEntityDefinition;
    }(FetchItemBuildingTileEntityDefinition_3.FetchItemBuildingTileEntityDefinition));
    exports.ConsumeBuildingTileEntityDefinition = ConsumeBuildingTileEntityDefinition;
});
define("simulation/implementation/HousePlotTileEntityDefinition", ["require", "exports", "simulation/core/entity/ConsumeBuildingTileEntityDefinition", "simulation/core/Size"], function (require, exports, ConsumeBuildingTileEntityDefinition_1, Size_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HousePlotTileEntityDefinition = /** @class */ (function (_super) {
        __extends(HousePlotTileEntityDefinition, _super);
        function HousePlotTileEntityDefinition() {
            var _this = _super.call(this, "houseplot", new Size_5.Size(2, 2), 16, 2, ["wood", "bread"], true, 1, 2, 10) || this;
            _this.requiredWoodForHouseUpgrade = 10;
            _this.requiredBreadForHouseUpgrade = 5;
            _this.scanTargetPeriodicity = 5000;
            _this.treshholdForItemsToFetch.put("wood", _this.requiredWoodForHouseUpgrade);
            _this.treshholdForItemsToFetch.put("bread", _this.requiredBreadForHouseUpgrade);
            return _this;
        }
        HousePlotTileEntityDefinition.prototype.onConsume = function (entity) {
            var metadata = entity.getMetadata();
            if (metadata.inputStorage.canRemove("wood", this.requiredWoodForHouseUpgrade) &&
                metadata.inputStorage.canRemove("bread", this.requiredBreadForHouseUpgrade)) {
                // we have enough wood & bread for upgrading to a house
                var world = entity.workers[0].world;
                world.removeEntity(entity);
                var newDef = world.getTileEntityDefinition("house");
                var area = entity.getArea();
                var instance = newDef.createInstance(world, area.position.x, area.position.y);
                var instanceMetadata = instance.getMetadata();
                // move the current storage to the new instance
                instanceMetadata.inputStorage.transferFrom(metadata.inputStorage);
                world.placeEntity(instance);
                return false; // EOL on this entity so don't reschedule
            }
            return true;
        };
        return HousePlotTileEntityDefinition;
    }(ConsumeBuildingTileEntityDefinition_1.ConsumeBuildingTileEntityDefinition));
    exports.HousePlotTileEntityDefinition = HousePlotTileEntityDefinition;
});
define("simulation/implementation/HouseTileEntityDefinition", ["require", "exports", "simulation/core/entity/ConsumeBuildingTileEntityDefinition", "simulation/core/Size"], function (require, exports, ConsumeBuildingTileEntityDefinition_2, Size_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HouseTileEntityDefinition = /** @class */ (function (_super) {
        __extends(HouseTileEntityDefinition, _super);
        function HouseTileEntityDefinition() {
            var _this = _super.call(this, "house", new Size_6.Size(2, 2), 18, 2, ["wood", "bread", "beef", "clothes"], true, 1, 4, 10) || this;
            _this.consumeBreadPeriodicity = 60000;
            _this.consumeWoodPeriodicity = 120000;
            _this.requiredBeefForHouseUpgrade = 5;
            _this.requiredClothesForHouseUpgrade = 5;
            _this.taxAmount = 30;
            _this.scanTargetPeriodicity = 5000;
            _this.treshholdForItemsToFetch.put("wood", 10);
            _this.treshholdForItemsToFetch.put("bread", 10);
            _this.treshholdForItemsToFetch.put("beef", 10);
            _this.treshholdForItemsToFetch.put("clothes", 10);
            return _this;
        }
        HouseTileEntityDefinition.prototype.initializeEntity = function (world, entity) {
            _super.prototype.initializeEntity.call(this, world, entity);
            this.scheduleConsumeBread(world, entity);
            this.scheduleConsumeWood(world, entity);
        };
        HouseTileEntityDefinition.prototype.scheduleConsumeWood = function (world, entity) {
            var _this = this;
            var consumeWoodAction = function () {
                var metadata = entity.getMetadata();
                if (metadata.inputStorage.canRemove("wood", 1)) {
                    metadata.inputStorage.remove("wood", 1);
                    _this.scheduleConsumeWood(world, entity);
                }
                else {
                    // devolve
                    _this.devolveToHousePlot(entity);
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME_WOOD", entity, "Consume wood", consumeWoodAction, this.consumeWoodPeriodicity);
        };
        HouseTileEntityDefinition.prototype.scheduleConsumeBread = function (world, entity) {
            var _this = this;
            var consumeBreadAction = function () {
                var metadata = entity.getMetadata();
                if (metadata.inputStorage.canRemove("bread", 1)) {
                    metadata.inputStorage.remove("bread", 1);
                    _this.scheduleConsumeBread(world, entity);
                }
                else {
                    // devolve
                    _this.devolveToHousePlot(entity);
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME_BREAD", entity, "Consume bread", consumeBreadAction, this.consumeBreadPeriodicity);
        };
        HouseTileEntityDefinition.prototype.devolveToHousePlot = function (entity) {
            var world = entity.workers[0].world;
            world.removeEntity(entity);
            var newDef = world.getTileEntityDefinition("houseplot");
            var area = entity.getArea();
            var instance = newDef.createInstance(world, area.position.x, area.position.y);
            var metadata = entity.getMetadata();
            var instanceMetadata = instance.getMetadata();
            // move the current storage to the new instance
            // remove all items that are not applicable to houseplot
            instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "wood", 10); // MAX ITEMS of wood TODO
            instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "bread", 10); // MAX ITEMS of bread TODO
            instanceMetadata.inputStorage.remove("beef", instanceMetadata.inputStorage.getTotalAmountOf("beef"));
            instanceMetadata.inputStorage.remove("clothes", instanceMetadata.inputStorage.getTotalAmountOf("clothes"));
            instanceMetadata.inputStorage.optimize();
            world.placeEntity(instance);
        };
        HouseTileEntityDefinition.prototype.onConsume = function (entity) {
            var metadata = entity.getMetadata();
            if (metadata.inputStorage.canRemove("beef", this.requiredBeefForHouseUpgrade) &&
                metadata.inputStorage.canRemove("clothes", this.requiredClothesForHouseUpgrade)) {
                // we have enough  buffer for upgrading to a medium house
                var world = entity.workers[0].world;
                world.removeEntity(entity);
                var newDef = world.getTileEntityDefinition("mediumhouse");
                var area = entity.getArea();
                var instance = newDef.createInstance(world, area.position.x, area.position.y);
                var instanceMetadata = instance.getMetadata();
                // move the current storage to the new instance
                instanceMetadata.inputStorage.transferFrom(metadata.inputStorage);
                world.placeEntity(instance);
                return false; // EOL on this entity so don't reschedule
            }
            return true;
        };
        return HouseTileEntityDefinition;
    }(ConsumeBuildingTileEntityDefinition_2.ConsumeBuildingTileEntityDefinition));
    exports.HouseTileEntityDefinition = HouseTileEntityDefinition;
});
define("simulation/implementation/MediumHouseTileEntityDefinition", ["require", "exports", "simulation/core/entity/ConsumeBuildingTileEntityDefinition", "simulation/core/Size"], function (require, exports, ConsumeBuildingTileEntityDefinition_3, Size_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MediumHouseTileEntityDefinition = /** @class */ (function (_super) {
        __extends(MediumHouseTileEntityDefinition, _super);
        function MediumHouseTileEntityDefinition() {
            var _this = _super.call(this, "mediumhouse", new Size_7.Size(2, 2), 20, 2, ["wood", "bread", "beef", "clothes"], true, 1, 4, 20) || this;
            _this.consumeBreadPeriodicity = 60000;
            _this.consumeBeefPeriodicity = 60000;
            _this.consumeWoodPeriodicity = 120000;
            _this.consumeClothesPeriodicity = 120000;
            _this.taxAmount = 100;
            _this.scanTargetPeriodicity = 5000;
            _this.treshholdForItemsToFetch.put("wood", 20);
            _this.treshholdForItemsToFetch.put("bread", 20);
            _this.treshholdForItemsToFetch.put("beef", 20);
            _this.treshholdForItemsToFetch.put("clothes", 20);
            return _this;
        }
        MediumHouseTileEntityDefinition.prototype.initializeEntity = function (world, entity) {
            _super.prototype.initializeEntity.call(this, world, entity);
            this.scheduleConsumeBread(world, entity);
            this.scheduleConsumeWood(world, entity);
            this.scheduleConsumeBeef(world, entity);
            this.scheduleConsumeClothes(world, entity);
        };
        MediumHouseTileEntityDefinition.prototype.scheduleConsumeWood = function (world, entity) {
            var _this = this;
            var consumeWoodAction = function () {
                var metadata = entity.getMetadata();
                if (metadata.inputStorage.canRemove("wood", 1)) {
                    metadata.inputStorage.remove("wood", 1);
                    _this.scheduleConsumeWood(world, entity);
                }
                else {
                    // devolve
                    _this.devolveToHouse(entity);
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME_WOOD", entity, "Consume wood", consumeWoodAction, this.consumeWoodPeriodicity);
        };
        MediumHouseTileEntityDefinition.prototype.scheduleConsumeBread = function (world, entity) {
            var _this = this;
            var consumeBreadAction = function () {
                var metadata = entity.getMetadata();
                if (metadata.inputStorage.canRemove("bread", 1)) {
                    metadata.inputStorage.remove("bread", 1);
                    _this.scheduleConsumeBread(world, entity);
                }
                else {
                    // devolve
                    _this.devolveToHouse(entity);
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME_BREAD", entity, "Consume bread", consumeBreadAction, this.consumeBreadPeriodicity);
        };
        MediumHouseTileEntityDefinition.prototype.scheduleConsumeBeef = function (world, entity) {
            var _this = this;
            var consumeBeefAction = function () {
                var metadata = entity.getMetadata();
                if (metadata.inputStorage.canRemove("beef", 1)) {
                    metadata.inputStorage.remove("beef", 1);
                    _this.scheduleConsumeBeef(world, entity);
                }
                else {
                    // devolve
                    _this.devolveToHouse(entity);
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME_BEEF", entity, "Consume beef", consumeBeefAction, this.consumeBeefPeriodicity);
        };
        MediumHouseTileEntityDefinition.prototype.scheduleConsumeClothes = function (world, entity) {
            var _this = this;
            var consumeClothesAction = function () {
                var metadata = entity.getMetadata();
                if (metadata.inputStorage.canRemove("clothes", 1)) {
                    metadata.inputStorage.remove("clothes", 1);
                    _this.scheduleConsumeClothes(world, entity);
                }
                else {
                    // devolve
                    _this.devolveToHouse(entity);
                }
            };
            world.scheduler.scheduleEntityAction("CONSUME_CLOTHES", entity, "Consume clothes", consumeClothesAction, this.consumeClothesPeriodicity);
        };
        MediumHouseTileEntityDefinition.prototype.devolveToHouse = function (entity) {
            var world = entity.workers[0].world;
            world.removeEntity(entity);
            var newDef = world.getTileEntityDefinition("house");
            var area = entity.getArea();
            var instance = newDef.createInstance(world, area.position.x, area.position.y);
            var metadata = entity.getMetadata();
            var instanceMetadata = instance.getMetadata();
            // move the current storage to the new instance
            instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "wood", 10); // MAX ITEMS of wood TODO
            instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "bread", 10); // MAX ITEMS of bread TODO
            instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "clothes", 10); // MAX ITEMS of bread TODO
            instanceMetadata.inputStorage.transferItemFrom(metadata.inputStorage, "beef", 10); // MAX ITEMS of bread TODO
            instanceMetadata.inputStorage.optimize();
            world.placeEntity(instance);
        };
        MediumHouseTileEntityDefinition.prototype.onConsume = function (entity) {
            return false;
        };
        return MediumHouseTileEntityDefinition;
    }(ConsumeBuildingTileEntityDefinition_3.ConsumeBuildingTileEntityDefinition));
    exports.MediumHouseTileEntityDefinition = MediumHouseTileEntityDefinition;
});
define("simulation/implementation/PastureTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProduceTileEntityDefinition", "simulation/core/Size"], function (require, exports, ProduceTileEntityDefinition_3, Size_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PastureTileEntityDefinition = /** @class */ (function (_super) {
        __extends(PastureTileEntityDefinition, _super);
        function PastureTileEntityDefinition() {
            var _this = _super.call(this, "pasture", new Size_8.Size(2, 2), 28, 2, true, 2, 5) || this;
            _this.upkeepCost = 10;
            _this.producePeriodicity = 10000;
            return _this;
        }
        PastureTileEntityDefinition.prototype.onItemProduced = function (entity) {
            var metadata = entity.getMetadata();
            var result = metadata.outputStorage.add("cow", 1);
            return result.actualAmount > 0; // stop production as soon as we can't produce anymore
        };
        return PastureTileEntityDefinition;
    }(ProduceTileEntityDefinition_3.ProduceTileEntityDefinition));
    exports.PastureTileEntityDefinition = PastureTileEntityDefinition;
});
define("simulation/implementation/StoneMasonTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProductionBuildingTileEntityDefinition", "simulation/core/Size", "simulation/implementation/BoulderTileEntityDefinition"], function (require, exports, ProductionBuildingTileEntityDefinition_2, Size_9, BoulderTileEntityDefinition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StoneMasonTileEntityDefinition = /** @class */ (function (_super) {
        __extends(StoneMasonTileEntityDefinition, _super);
        function StoneMasonTileEntityDefinition() {
            var _this = _super.call(this, "stonemason", new Size_9.Size(2, 2), 26, 2, ["stone"], true, 1, 1, 40) || this;
            _this.scanTargetPeriodicity = 5000;
            _this.timeToRetrieveItem = 5000;
            _this.upkeepCost = 50;
            return _this;
        }
        StoneMasonTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var result = _super.prototype.isTarget.call(this, world, x, y, item);
            if (!result)
                return false;
            var entity = world.getTile(x, y).entity;
            if (entity !== null && (entity.definition instanceof BoulderTileEntityDefinition_1.BoulderTileEntityDefinition))
                return true;
            return false;
        };
        return StoneMasonTileEntityDefinition;
    }(ProductionBuildingTileEntityDefinition_2.ProductionBuildingTileEntityDefinition));
    exports.StoneMasonTileEntityDefinition = StoneMasonTileEntityDefinition;
});
define("simulation/implementation/TailorTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProcessBuildingTileEntityDefinition", "simulation/core/entity/ProcessResult", "simulation/core/Size"], function (require, exports, ProcessBuildingTileEntityDefinition_4, ProcessResult_3, Size_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TailorTileEntityDefinition = /** @class */ (function (_super) {
        __extends(TailorTileEntityDefinition, _super);
        function TailorTileEntityDefinition() {
            var _this = _super.call(this, "tailor", new Size_10.Size(2, 2), 32, 2, "leather", true, 1, 1, 40, 1, 40) || this;
            _this.processPeriodicity = 5000;
            _this.scanTargetPeriodicity = 5000;
            _this.upkeepCost = 60;
            return _this;
        }
        TailorTileEntityDefinition.prototype.getProcess = function (item, amount) {
            var success = item === "leather" && amount >= 2;
            return new ProcessResult_3.ProcessResult(success, "leather", 2, ["clothes"], [1]);
        };
        return TailorTileEntityDefinition;
    }(ProcessBuildingTileEntityDefinition_4.ProcessBuildingTileEntityDefinition));
    exports.TailorTileEntityDefinition = TailorTileEntityDefinition;
});
define("simulation/core/metadata/StorageMetadata", ["require", "exports", "simulation/core/storage/Storage", "simulation/core/metadata/CachedTargetsMetadata"], function (require, exports, Storage_6, CachedTargetsMetadata_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorageMetadata = /** @class */ (function (_super) {
        __extends(StorageMetadata, _super);
        function StorageMetadata(storageDefinition) {
            var _this = _super.call(this) || this;
            _this._outputStorage = new Storage_6.Storage(storageDefinition);
            return _this;
        }
        Object.defineProperty(StorageMetadata.prototype, "outputStorage", {
            get: function () {
                return this._outputStorage;
            },
            enumerable: true,
            configurable: true
        });
        return StorageMetadata;
    }(CachedTargetsMetadata_5.CachedTargetsMetadata));
    exports.StorageMetadata = StorageMetadata;
});
define("simulation/core/entity/StorageBuildingTileEntityDefinition", ["require", "exports", "simulation/core/metadata/StorageMetadata", "simulation/core/storage/StorageContainerDefinition", "simulation/core/entity/BuildingTileEntity", "simulation/core/entity/FetchItemBuildingTileEntityDefinition"], function (require, exports, StorageMetadata_1, StorageContainerDefinition_6, BuildingTileEntity_7, FetchItemBuildingTileEntityDefinition_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorageBuildingTileEntityDefinition = /** @class */ (function (_super) {
        __extends(StorageBuildingTileEntityDefinition, _super);
        function StorageBuildingTileEntityDefinition(key, size, sourceTilesetX, sourceTilesetY, itemsToStore, blocked, availableNrOfWorkers, nrOfStorageSlots, maxNrOfItems) {
            if (blocked === void 0) { blocked = true; }
            if (availableNrOfWorkers === void 0) { availableNrOfWorkers = 0; }
            if (nrOfStorageSlots === void 0) { nrOfStorageSlots = 1; }
            if (maxNrOfItems === void 0) { maxNrOfItems = 1; }
            var _this = _super.call(this, key, size, sourceTilesetX, sourceTilesetY, itemsToStore, blocked, availableNrOfWorkers) || this;
            _this.outputStorageDefinition = new StorageContainerDefinition_6.StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
            for (var _i = 0, itemsToStore_1 = itemsToStore; _i < itemsToStore_1.length; _i++) {
                var item = itemsToStore_1[_i];
                // have 5 items as buffer, so when multiple workers arrive at the same time, they can go over the treshold a bit
                // so they don't get stuck waiting till there is room to drop items off
                _this.treshholdForItemsToFetch.put(item, maxNrOfItems - 5);
            }
            return _this;
        }
        StorageBuildingTileEntityDefinition.prototype.createMetadata = function () {
            return new StorageMetadata_1.StorageMetadata(this.outputStorageDefinition);
        };
        StorageBuildingTileEntityDefinition.prototype.createInstance = function (world, x, y) {
            var b = new BuildingTileEntity_7.BuildingTileEntity(this, world, x, y);
            for (var _i = 0, _a = b.workers; _i < _a.length; _i++) {
                var w = _a[_i];
                w.color = "#0000FF";
            }
            return b;
        };
        StorageBuildingTileEntityDefinition.prototype.getTargetStorageForDropOff = function (entity) {
            var metadata = entity.getMetadata();
            return metadata.outputStorage;
        };
        return StorageBuildingTileEntityDefinition;
    }(FetchItemBuildingTileEntityDefinition_4.FetchItemBuildingTileEntityDefinition));
    exports.StorageBuildingTileEntityDefinition = StorageBuildingTileEntityDefinition;
});
define("simulation/implementation/WarehouseTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProduceTileEntityDefinition", "simulation/core/entity/StorageBuildingTileEntityDefinition", "simulation/core/Size"], function (require, exports, ProduceTileEntityDefinition_4, StorageBuildingTileEntityDefinition_1, Size_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WarehouseTileEntityDefinition = /** @class */ (function (_super) {
        __extends(WarehouseTileEntityDefinition, _super);
        function WarehouseTileEntityDefinition() {
            var _this = _super.call(this, "warehouse", new Size_11.Size(2, 2), 4, 2, ["wood", "bread", "wheat", "stone", "beef", "leather", "clothes"], true, 4, 7, 40) || this;
            _this.scanTargetPeriodicity = 5000;
            _this.radius = 20;
            for (var _i = 0, _a = _this.itemsToFetch; _i < _a.length; _i++) {
                var item = _a[_i];
                _this.treshholdForItemsToFetch.put(item, _this.outputStorageDefinition.maxNrOfItems - 5);
            }
            return _this;
        }
        WarehouseTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var result = _super.prototype.isTarget.call(this, world, x, y, item);
            if (!result)
                return false;
            // super already checks if there are entities with output storage of the item to fetch
            // so if there are, narrow it down to only windmills
            var entity = world.getTile(x, y).entity;
            if (entity !== null &&
                !(entity.definition instanceof ProduceTileEntityDefinition_4.ProduceTileEntityDefinition) &&
                !(entity.definition instanceof WarehouseTileEntityDefinition))
                return true;
            return false;
        };
        return WarehouseTileEntityDefinition;
    }(StorageBuildingTileEntityDefinition_1.StorageBuildingTileEntityDefinition));
    exports.WarehouseTileEntityDefinition = WarehouseTileEntityDefinition;
});
define("simulation/implementation/WheatFarmPlotTileEntityDefinition", ["require", "exports", "globals", "simulation/core/entity/ProduceTileEntityDefinition", "simulation/core/Size"], function (require, exports, globals_10, ProduceTileEntityDefinition_5, Size_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WheatFarmPlotTileEntityDefinition = /** @class */ (function (_super) {
        __extends(WheatFarmPlotTileEntityDefinition, _super);
        function WheatFarmPlotTileEntityDefinition() {
            var _this = _super.call(this, "wheatfarmplot", new Size_12.Size(2, 2), 6, 2, true, 1, 5) || this;
            _this.upkeepCost = 5;
            _this.producePeriodicity = 2000;
            return _this;
        }
        WheatFarmPlotTileEntityDefinition.prototype.onItemProduced = function (entity) {
            var metadata = entity.getMetadata();
            var result = metadata.outputStorage.add("wheat", 1);
            return result.actualAmount > 0; // stop production as soon as we can't produce anymore
        };
        WheatFarmPlotTileEntityDefinition.prototype.draw = function (world, entity, x, y) {
            _super.prototype.draw.call(this, world, entity, x, y);
            var metadata = entity.getMetadata();
            var percFull = metadata.outputStorage.getTotalAmountOf("wheat") / 5;
            globals_10.ctx.globalAlpha = percFull;
            globals_10.ctx.drawImage(globals_10.img, (this.sourceTilesetPosition.x + 2) * globals_10.TILE_WIDTH, this.sourceTilesetPosition.y * globals_10.TILE_HEIGHT, this.size.width * globals_10.TILE_WIDTH, this.size.height * globals_10.TILE_HEIGHT, x * globals_10.TILE_WIDTH, y * globals_10.TILE_HEIGHT, this.size.width * globals_10.TILE_WIDTH, this.size.height * globals_10.TILE_HEIGHT);
            globals_10.ctx.globalAlpha = 1;
        };
        return WheatFarmPlotTileEntityDefinition;
    }(ProduceTileEntityDefinition_5.ProduceTileEntityDefinition));
    exports.WheatFarmPlotTileEntityDefinition = WheatFarmPlotTileEntityDefinition;
});
define("simulation/implementation/WheatFarmTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProductionBuildingTileEntityDefinition", "simulation/core/Size"], function (require, exports, ProductionBuildingTileEntityDefinition_3, Size_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WheatFarmTileEntityDefinition = /** @class */ (function (_super) {
        __extends(WheatFarmTileEntityDefinition, _super);
        function WheatFarmTileEntityDefinition() {
            var _this = _super.call(this, "wheatfarm", new Size_13.Size(2, 2), 10, 2, ["wheat"], true, 1, 1, 40) || this;
            _this.upkeepCost = 10;
            _this.scanTargetPeriodicity = 5000;
            return _this;
        }
        return WheatFarmTileEntityDefinition;
    }(ProductionBuildingTileEntityDefinition_3.ProductionBuildingTileEntityDefinition));
    exports.WheatFarmTileEntityDefinition = WheatFarmTileEntityDefinition;
});
define("simulation/implementation/WindMillTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProcessBuildingTileEntityDefinition", "simulation/core/Size", "simulation/core/entity/ProcessResult"], function (require, exports, ProcessBuildingTileEntityDefinition_5, Size_14, ProcessResult_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindMillTileEntityDefinition = /** @class */ (function (_super) {
        __extends(WindMillTileEntityDefinition, _super);
        function WindMillTileEntityDefinition() {
            var _this = _super.call(this, "windmill", new Size_14.Size(2, 2), 12, 2, "wheat", true, 1, 1, 40, 1, 40) || this;
            _this.scanTargetPeriodicity = 5000;
            _this.upkeepCost = 20;
            return _this;
        }
        WindMillTileEntityDefinition.prototype.getProcess = function (item, amount) {
            var success = item === "wheat" && amount >= 4;
            return new ProcessResult_4.ProcessResult(success, "wheat", 4, ["flour"], [1]);
        };
        WindMillTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            var result = _super.prototype.isTarget.call(this, world, x, y, item);
            if (!result)
                return false;
            // super already checks if there are entities with output storage of the item to fetch
            // so if there are, narrow it down to only wheatfarms
            var entity = world.getTile(x, y).entity;
            if (entity !== null && entity.definition.key === "wheatfarm")
                return true;
            return false;
        };
        return WindMillTileEntityDefinition;
    }(ProcessBuildingTileEntityDefinition_5.ProcessBuildingTileEntityDefinition));
    exports.WindMillTileEntityDefinition = WindMillTileEntityDefinition;
});
define("simulation/implementation/WoodCutterTileEntityDefinition", ["require", "exports", "simulation/core/entity/ProductionBuildingTileEntityDefinition", "simulation/core/Size", "simulation/core/TileModifierFlags"], function (require, exports, ProductionBuildingTileEntityDefinition_4, Size_15, TileModifierFlags_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WoodCutterTileEntityDefinition = /** @class */ (function (_super) {
        __extends(WoodCutterTileEntityDefinition, _super);
        function WoodCutterTileEntityDefinition() {
            var _this = _super.call(this, "woodcutter", new Size_15.Size(2, 2), 0, 2, ["wood"], true, 3, 3, 3) || this;
            _this.saplingsGrowBackToTreesIn = 300000;
            _this.scanOnUniqueEntities = false; // we're using tiles anyway
            _this.upkeepCost = 10;
            return _this;
        }
        WoodCutterTileEntityDefinition.prototype.isTarget = function (world, x, y, item) {
            // override super is target, check for tiles instead
            var defIdx = world.getTile(x, y).definitionIndex;
            return (world.getTileDefinition(defIdx).flags & TileModifierFlags_3.TileModifierFlags.Woodcuttable) === TileModifierFlags_3.TileModifierFlags.Woodcuttable;
        };
        WoodCutterTileEntityDefinition.prototype.onWorkerGetItem = function (worker, dest) {
            var defIdx = worker.world.getTile(dest.position.x, dest.position.y).definitionIndex;
            if ((worker.world.getTileDefinition(defIdx).flags & TileModifierFlags_3.TileModifierFlags.Woodcuttable) !== TileModifierFlags_3.TileModifierFlags.Woodcuttable)
                return false;
            // on get item
            var addStorageResult = worker.outputStorage.add("wood", 1);
            if (addStorageResult.actualAmount === 0)
                return false;
            // make the tile a sapling
            worker.world.setTileDefinition(dest.position.x, dest.position.y, "sapling");
            // make the sapling grow after a while
            worker.world.scheduler.scheduleWorldAction("SAPLING_REGROW_AT_" + dest.position.x + "_" + dest.position.y, "regrow sapling at " + dest.position.x + "," + dest.position.y, function () {
                if (worker.world.isTileOfDefiniton(dest.position.x, dest.position.y, "sapling"))
                    worker.world.setTileDefinition(dest.position.x, dest.position.y, "tree");
            }, this.saplingsGrowBackToTreesIn);
            return true;
        };
        return WoodCutterTileEntityDefinition;
    }(ProductionBuildingTileEntityDefinition_4.ProductionBuildingTileEntityDefinition));
    exports.WoodCutterTileEntityDefinition = WoodCutterTileEntityDefinition;
});
define("main", ["require", "exports", "globals", "Random", "simulation/core/entity/BuildingTileEntity", "simulation/core/ItemDefinition", "simulation/core/Tile", "simulation/core/TileDefinition", "simulation/core/TileModifierFlags", "simulation/core/World", "simulation/implementation/BakeryTileEntityDefinition", "simulation/implementation/BoulderTileEntityDefinition", "simulation/implementation/ButcherTileEntityDefinition", "simulation/implementation/HousePlotTileEntityDefinition", "simulation/implementation/HouseTileEntityDefinition", "simulation/implementation/MediumHouseTileEntityDefinition", "simulation/implementation/PastureTileEntityDefinition", "simulation/implementation/StoneMasonTileEntityDefinition", "simulation/implementation/TailorTileEntityDefinition", "simulation/implementation/WarehouseTileEntityDefinition", "simulation/implementation/WheatFarmPlotTileEntityDefinition", "simulation/implementation/WheatFarmTileEntityDefinition", "simulation/implementation/WindMillTileEntityDefinition", "simulation/implementation/WoodCutterTileEntityDefinition"], function (require, exports, globals, Random_1, BuildingTileEntity_8, ItemDefinition_1, Tile_1, TileDefinition_1, TileModifierFlags_4, World_1, BakeryTileEntityDefinition_1, BoulderTileEntityDefinition_2, ButcherTileEntityDefinition_1, HousePlotTileEntityDefinition_1, HouseTileEntityDefinition_1, MediumHouseTileEntityDefinition_1, PastureTileEntityDefinition_1, StoneMasonTileEntityDefinition_1, TailorTileEntityDefinition_1, WarehouseTileEntityDefinition_1, WheatFarmPlotTileEntityDefinition_1, WheatFarmTileEntityDefinition_1, WindMillTileEntityDefinition_1, WoodCutterTileEntityDefinition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var w;
    function getSetting(name) {
        var gl = globals;
        return gl[name];
    }
    exports.getSetting = getSetting;
    function setSetting(name, val) {
        var gl = globals;
        gl[name] = val;
    }
    exports.setSetting = setSetting;
    function clearOverlay() {
        globals.ctxOverlay.clearRect(0, 0, canvas.width, canvas.height);
    }
    exports.clearOverlay = clearOverlay;
    function clearBuildingStorage() {
        for (var _i = 0, _a = w.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            var outputContainer = entity.getMetadata();
            if (outputContainer.outputStorage)
                outputContainer.outputStorage.clear();
            var inputContainer = entity.getMetadata();
            if (inputContainer.inputStorage)
                inputContainer.inputStorage.clear();
        }
    }
    exports.clearBuildingStorage = clearBuildingStorage;
    var curTime = 0;
    var lastTime = new Date().getTime();
    function jumpForward5min() {
        var startTime = new Date().getTime();
        curTime += 300000;
        w.scheduler.update(curTime, 300000);
        var endTime = new Date().getTime();
        console.log("Jumping 5min took " + (endTime - startTime) + " ms");
    }
    exports.jumpForward5min = jumpForward5min;
    function optimizeBuildingWithSimulatedAnnealing() {
        var availableDefinitionsForPlacement = [
            "woodcutter", "houseplot", "wheatfarmplot", "wheatfarm", "windmill", "bakery",
            "warehouse", "boulder", "stonemason", "pasture", "butcher", "tailor"
        ];
        var testOptimize = new OptimizeBuildingLayout(availableDefinitionsForPlacement, 30, 30, getActionSet());
        var runTest = function () {
            var result = testOptimize.step();
            w = initializeWorld(30, 30);
            testOptimize.currentState.applyOnWorld(w);
            curTime = 0;
            lastTime = new Date().getTime();
            if (result)
                window.setTimeout(runTest, 200);
        };
        runTest();
    }
    exports.optimizeBuildingWithSimulatedAnnealing = optimizeBuildingWithSimulatedAnnealing;
    var canvas = $("#c").get(0);
    var ctx = canvas.getContext("2d");
    globals.setRenderingContext(ctx);
    var cOverlay = $("#cOverlay").get(0);
    var ctxOverlay = cOverlay.getContext("2d");
    globals.setOverlayRenderingContext(ctxOverlay);
    var img = $("#imgTileset").get(0);
    globals.setTileset(img);
    function main() {
        var nrOfCols = 30;
        var nrOfRows = 30;
        w = initializeWorld(nrOfRows, nrOfCols);
        placeEntities(w);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        w.draw();
        var frames = 0;
        var lastActionDump = curTime;
        var startTime = new Date().getTime();
        runDraw();
        runUpdate();
        function runDraw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            w.draw();
            window.requestAnimationFrame(runDraw);
            frames++;
            updateDebug(w);
        }
        function runUpdate() {
            var newTime = new Date().getTime();
            var diff = newTime - lastTime;
            if (globals.SPEEDUP10)
                diff *= 10;
            lastTime = newTime;
            if (!globals.PAUSE) {
                curTime += diff;
                w.scheduler.update(curTime, diff);
            }
            window.setTimeout(runUpdate, 25);
        }
        function updateDebug(w) {
            var laggingBehind = (new Date().getTime() - startTime) - w.scheduler.currentTime;
            var nrOfSeconds = w.scheduler.currentTime / 1000;
            var aps = Math.round((w.scheduler.processedActionCount / nrOfSeconds) * 100) / 100;
            var avgIdleWorkerTime = Math.round((w.scoring.idleWorkerCount / nrOfSeconds) * 100) / 100;
            document.getElementById("debug").innerHTML = frames + " - World time: " + w.scheduler.currentTime + " - lagging behind: " + laggingBehind +
                ("<br/>Nr of actions processed so far: " + w.scheduler.processedActionCount + ", avg per sec: " + aps) +
                ("<br/>Money: " + w.scoring.money + ", income: " + w.scoring.lastIncome + ", expense: " + w.scoring.lastExpense) +
                ("<br/>#items produced: " + w.scoring.nrOfItemsProduced + ", #items processed: " + w.scoring.nrOfItemsProcessed) +
                ("<br/>Avg. idle worker time:  " + avgIdleWorkerTime + "/sec (total nr of workers: " + w.scoring.workerCount + ")");
            var str = "";
            for (var _i = 0, _a = w.entities; _i < _a.length; _i++) {
                var e = _a[_i];
                var outputContainer = e.getMetadata();
                var inputContainer = e.getMetadata();
                str += "<div class=\"building\"><span>" + e.definition.key + " " + e.id + "<br/>";
                if (e instanceof BuildingTileEntity_8.BuildingTileEntity) {
                    var states = [];
                    for (var _b = 0, _c = e.workers; _b < _c.length; _b++) {
                        var worker = _c[_b];
                        states.push(worker.id + ": " + worker.behaviour.executingState);
                    }
                    str += "Workers: " + states.join(",") + "<br/>";
                }
                if (outputContainer.outputStorage) {
                    var outputDef = outputContainer.outputStorage.definition;
                    str += "OUTPUT: Nr of slots: " + outputDef.nrOfStorageSlots + ", max items per slot: " + outputDef.maxNrOfItems + "</span><br/>";
                    for (var j = 0; j < outputDef.nrOfStorageSlots; j++) {
                        var perc = Math.round((outputContainer.outputStorage.getAmount(j) / outputDef.maxNrOfItems) * 100);
                        str += "<span class=\"item\"><div class=\"load\" data-perc=\"" + perc + "\" style=\"width:" + perc + "%\"></div>" + outputContainer.outputStorage.getItem(j) + ": " + outputContainer.outputStorage.getAmount(j) + "</span>";
                    }
                    str += "<br/>";
                }
                if (inputContainer.inputStorage) {
                    var inputDef = inputContainer.inputStorage.definition;
                    str += "INPUT: Nr of slots: " + inputDef.nrOfStorageSlots + ", max items per slot: " + inputDef.maxNrOfItems + "</span><br/>";
                    for (var j = 0; j < inputDef.nrOfStorageSlots; j++) {
                        var perc = Math.round((inputContainer.inputStorage.getAmount(j) / inputDef.maxNrOfItems) * 100);
                        str += "<span class=\"item\"><div class=\"load\" data-perc=\"" + perc + "\" style=\"width:" + perc + "%\"></div>" + inputContainer.inputStorage.getItem(j) + ": " + inputContainer.inputStorage.getAmount(j) + "</span>";
                    }
                }
                str += "</div>";
            }
            document.getElementById("storageDebug").innerHTML = str;
            if (curTime - lastActionDump > 100) {
                var actions = w.scheduler.getFutureActions();
                str = "<span>Number of actions: " + actions.length + "</span><br/>";
                for (var _d = 0, actions_1 = actions; _d < actions_1.length; _d++) {
                    var action = actions_1[_d];
                    str += "<span>" + (Math.round(action.getTimeToFire()) - curTime) + " - " + action.getKey() + ": " + action.description + "</span>";
                    str += "<br/>";
                }
                document.getElementById("actionDebug").innerHTML = str;
                lastActionDump = curTime;
            }
        }
    }
    exports.main = main;
    function initializeWorld(nrOfRows, nrOfCols) {
        var tileset = [
            new TileDefinition_1.TileDefinition("grass"),
            new TileDefinition_1.TileDefinition("dirt"),
            new TileDefinition_1.TileDefinition("street", TileModifierFlags_4.TileModifierFlags.None, 5),
            new TileDefinition_1.TileDefinition("tree", TileModifierFlags_4.TileModifierFlags.Woodcuttable, 0.8),
            new TileDefinition_1.TileDefinition("water", TileModifierFlags_4.TileModifierFlags.Blocked),
            new TileDefinition_1.TileDefinition("boulder", TileModifierFlags_4.TileModifierFlags.Blocked),
            new TileDefinition_1.TileDefinition("sapling"),
        ];
        var itemset = [
            new ItemDefinition_1.ItemDefinition("wood", 0, 1),
            new ItemDefinition_1.ItemDefinition("plank", 1, 1),
            new ItemDefinition_1.ItemDefinition("wheat", 2, 1),
            new ItemDefinition_1.ItemDefinition("flour", 3, 1),
            new ItemDefinition_1.ItemDefinition("bread", 4, 1),
            new ItemDefinition_1.ItemDefinition("stone", 5, 1),
            new ItemDefinition_1.ItemDefinition("cow", 6, 1),
            new ItemDefinition_1.ItemDefinition("leather", 7, 1),
            new ItemDefinition_1.ItemDefinition("beef", 8, 1),
            new ItemDefinition_1.ItemDefinition("clothes", 9, 1),
        ];
        var entityset = [
            new WoodCutterTileEntityDefinition_1.WoodCutterTileEntityDefinition(),
            new WheatFarmPlotTileEntityDefinition_1.WheatFarmPlotTileEntityDefinition(),
            new WheatFarmTileEntityDefinition_1.WheatFarmTileEntityDefinition(),
            new WindMillTileEntityDefinition_1.WindMillTileEntityDefinition(),
            new BakeryTileEntityDefinition_1.BakeryTileEntityDefinition(),
            new HousePlotTileEntityDefinition_1.HousePlotTileEntityDefinition(),
            new HouseTileEntityDefinition_1.HouseTileEntityDefinition(),
            new MediumHouseTileEntityDefinition_1.MediumHouseTileEntityDefinition(),
            new WarehouseTileEntityDefinition_1.WarehouseTileEntityDefinition(),
            new BoulderTileEntityDefinition_2.BoulderTileEntityDefinition(),
            new StoneMasonTileEntityDefinition_1.StoneMasonTileEntityDefinition(),
            new PastureTileEntityDefinition_1.PastureTileEntityDefinition(),
            new ButcherTileEntityDefinition_1.ButcherTileEntityDefinition(),
            new TailorTileEntityDefinition_1.TailorTileEntityDefinition()
        ];
        var entities = [];
        var rnd = new Random_1.Random(1);
        var tileSeeds = [0, 0, 1, 1, 3, 3, 3, 3, 4, 5];
        // let tileSeeds = [0, 0, 1, 1, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5];
        var tiles = [];
        for (var i = 0; i < nrOfCols; i++) {
            tiles[i] = [];
            for (var j = 0; j < nrOfRows; j++) {
                tiles[i][j] = new Tile_1.Tile(tileSeeds[Math.floor(rnd.next() * tileSeeds.length)], null);
            }
        }
        for (var i = 10; i < 25; i++) {
            tiles[i][16] = new Tile_1.Tile(2, null);
            tiles[i][19] = new Tile_1.Tile(2, null);
            tiles[i][24] = new Tile_1.Tile(2, null);
        }
        for (var i = 0; i < 10; i++) {
            tiles[12][16 + i] = new Tile_1.Tile(2, null);
        }
        var w = new World_1.World(nrOfCols, nrOfRows, tileset, entityset, tiles, entities, itemset);
        w.scoring.money = 10000;
        return w;
    }
    function getActionSet() {
        var as = new ActionSet();
        as.actions.push(new Action(ActionEnum.place, "woodcutter", 10, 10));
        as.actions.push(new Action(ActionEnum.place, "woodcutter", 10, 20));
        as.actions.push(new Action(ActionEnum.place, "houseplot", 11, 14));
        as.actions.push(new Action(ActionEnum.place, "houseplot", 15, 14));
        as.actions.push(new Action(ActionEnum.place, "houseplot", 17, 17));
        as.actions.push(new Action(ActionEnum.place, "houseplot", 20, 17));
        as.actions.push(new Action(ActionEnum.place, "houseplot", 10, 17));
        as.actions.push(new Action(ActionEnum.place, "wheatfarmplot", 20, 20));
        as.actions.push(new Action(ActionEnum.place, "wheatfarmplot", 24, 16));
        as.actions.push(new Action(ActionEnum.place, "wheatfarm", 24, 20));
        as.actions.push(new Action(ActionEnum.place, "windmill", 23, 26));
        as.actions.push(new Action(ActionEnum.place, "windmill", 26, 24));
        as.actions.push(new Action(ActionEnum.place, "bakery", 20, 26));
        as.actions.push(new Action(ActionEnum.place, "warehouse", 15, 20));
        as.actions.push(new Action(ActionEnum.place, "warehouse", 13, 20));
        as.actions.push(new Action(ActionEnum.place, "boulder", 20, 10));
        as.actions.push(new Action(ActionEnum.place, "stonemason", 16, 10));
        as.actions.push(new Action(ActionEnum.place, "pasture", 3, 20));
        as.actions.push(new Action(ActionEnum.place, "butcher", 5, 18));
        as.actions.push(new Action(ActionEnum.place, "tailor", 13, 17));
        return as;
    }
    function placeEntities(w) {
        var as = getActionSet();
        if (as.canApplyOnWorld(w))
            as.applyOnWorld(w);
        return as;
    }
    var ActionEnum;
    (function (ActionEnum) {
        ActionEnum[ActionEnum["place"] = 0] = "place";
    })(ActionEnum || (ActionEnum = {}));
    var Action = /** @class */ (function () {
        function Action(actionType, entity, x, y) {
            this.actionType = actionType;
            this.entity = entity;
            this.x = x;
            this.y = y;
        }
        Action.prototype.mutate = function (availableEntityDefinitions, rnd, nrOfCols, nrOfRows) {
            var a = this.clone();
            var val = rnd.next();
            if (val < 1 / 5) {
                a.x++;
            }
            else if (val < 2 / 5)
                a.x--;
            else if (val < 3 / 5)
                a.y++;
            else if (val < 4 / 5)
                a.y--;
            else if (val < 5 / 5)
                a.entity = availableEntityDefinitions[Math.floor(rnd.next() * availableEntityDefinitions.length)];
            if (a.x >= nrOfCols - 1)
                a.x = nrOfCols - 1 - 1;
            if (a.y >= nrOfRows - 1)
                a.y = nrOfRows - 1 - 1;
            if (a.x < 0)
                a.x = 0;
            if (a.y < 0)
                a.y = 0;
            return a;
        };
        Action.prototype.clone = function () {
            return new Action(this.actionType, this.entity, this.x, this.y);
        };
        Action.getRandom = function (availableEntityDefinitions, rnd, nrOfCols, nrOfRows) {
            return new Action(ActionEnum.place, availableEntityDefinitions[Math.floor(rnd.next() * availableEntityDefinitions.length)], Math.floor(rnd.next() * nrOfCols), Math.floor(rnd.next() * nrOfRows));
        };
        return Action;
    }());
    var ActionSet = /** @class */ (function () {
        function ActionSet() {
            this.actions = [];
        }
        ActionSet.prototype.mutate = function (availableEntityDefinitions, rnd, nrOfCols, nrOfRows) {
            var val = rnd.next();
            if (val < 4 / 6) {
                // mutate an existing action
                var idx = Math.floor(rnd.next() * this.actions.length);
                var actionSet = this.clone();
                actionSet.actions[idx] = this.actions[idx].mutate(availableEntityDefinitions, rnd, nrOfCols, nrOfRows);
                return actionSet;
            }
            else if (val < 5 / 6) {
                // add an action
                var actionSet = this.clone();
                actionSet.actions.push(Action.getRandom(availableEntityDefinitions, rnd, nrOfCols, nrOfRows));
                return actionSet;
            }
            else if (val < 6 / 6) {
                // remove an action
                var idx = Math.floor(rnd.next() * this.actions.length);
                var actionSet = new ActionSet();
                for (var i = 0; i < this.actions.length; i++) {
                    if (i !== idx)
                        actionSet.actions.push(this.actions[i]);
                }
                return actionSet;
            }
            else
                throw new Error();
        };
        ActionSet.prototype.clone = function () {
            var actionSet = new ActionSet();
            actionSet.actions = this.actions.slice(0);
            return actionSet;
        };
        ActionSet.prototype.canApplyOnWorld = function (world) {
            var entities = [];
            var isValid = true;
            for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
                var a = _a[_i];
                if (a.actionType === ActionEnum.place) {
                    var entity = world.getTileEntityDefinition(a.entity).createInstance(world, a.x, a.y);
                    if (!world.canPlaceEntity(entity)) {
                        console.log("entity can't be placed: " + entity.definition.key + " on " + entity.getArea().position.toString());
                        for (var _b = 0, entities_1 = entities; _b < entities_1.length; _b++) {
                            var entity_1 = entities_1[_b];
                            world.removeEntity(entity_1);
                        }
                        return false;
                    }
                    else {
                        entities.push(entity);
                        world.placeEntity(entity);
                    }
                }
            }
            for (var _c = 0, entities_2 = entities; _c < entities_2.length; _c++) {
                var entity = entities_2[_c];
                world.removeEntity(entity);
            }
            return true;
        };
        ActionSet.prototype.applyOnWorld = function (world) {
            for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
                var a = _a[_i];
                if (a.actionType === ActionEnum.place) {
                    var entity = world.getTileEntityDefinition(a.entity).createInstance(world, a.x, a.y);
                    world.placeEntity(entity);
                }
            }
        };
        return ActionSet;
    }());
    var OptimizeBuildingLayout = /** @class */ (function () {
        function OptimizeBuildingLayout(availableEntityDefinitions, nrOfCols, nrOfRows, actionSet) {
            this.availableEntityDefinitions = availableEntityDefinitions;
            this.nrOfCols = nrOfCols;
            this.nrOfRows = nrOfRows;
            this.rnd = new Random_1.Random(7707);
            this.maxIterations = 200;
            this.iteration = 0;
            this.values = [];
            this.currentActionSet = actionSet;
            this.currentScore = this.getScore(this.currentActionSet);
            this.emptyWorld = initializeWorld(this.nrOfCols, this.nrOfRows);
            this.addLog("Current score: " + this.currentScore);
            $("#simulatedAnnealingDebug").show();
        }
        Object.defineProperty(OptimizeBuildingLayout.prototype, "currentState", {
            get: function () { return this.currentActionSet; },
            enumerable: true,
            configurable: true
        });
        OptimizeBuildingLayout.prototype.addLog = function (msg) {
            var el = $("<span>" + msg + "</span>");
            $("#simulatedAnnealingDebug").append(el);
        };
        OptimizeBuildingLayout.prototype.step = function () {
            var nrOfAttempts = 0;
            var newAS;
            newAS = this.currentActionSet.mutate(this.availableEntityDefinitions, this.rnd, this.nrOfCols, this.nrOfRows);
            /*  do {
                  newAS = this.currentActionSet.mutate(this.availableEntityDefinitions, this.rnd, this.nrOfCols, this.nrOfRows);
                  nrOfAttempts++;
              }
              while (!newAS.canApplyOnWorld(this.emptyWorld) && nrOfAttempts < 5)
      */
            if (newAS.canApplyOnWorld(this.emptyWorld)) {
                var newScore = this.getScore(newAS);
                if (newScore == 0) {
                    console.log(newAS);
                    this.currentActionSet = newAS;
                    this.currentScore = newScore;
                    return false;
                }
                if (newScore > this.currentScore) {
                    // accept it
                    this.addLog("Iteration " + this.iteration + ": score " + newScore + ", ACCEPTED");
                    this.currentActionSet = newAS;
                    this.currentScore = newScore;
                }
                else {
                    var probability = this.getProbability(this.currentScore, newScore);
                    if (this.rnd.next() < probability) {
                        // accept it
                        this.addLog("Iteration " + this.iteration + ": score " + newScore + ", ACCEPTED with probability " + probability);
                        this.currentActionSet = newAS;
                        this.currentScore = newScore;
                    }
                    else {
                        this.addLog("Iteration " + this.iteration + ": score " + newScore + ", REJECTED with probability " + probability);
                    }
                }
                this.iteration++;
            }
            return this.iteration < this.maxIterations;
        };
        OptimizeBuildingLayout.prototype.getProbability = function (oldScore, newScore) {
            var temperature = this.maxIterations - this.iteration;
            if (newScore < oldScore) {
                return Math.exp((newScore - oldScore) / temperature);
            }
            else
                return 1;
        };
        OptimizeBuildingLayout.prototype.onDone = function () {
            var max = Number.MIN_VALUE;
            var min = Number.MAX_VALUE;
            for (var i = 0; i < this.values.length; i++) {
                if (this.values[i] > max) {
                    max = this.values[i];
                }
                if (this.values[i] > 0 && this.values[i] < min) {
                    min = this.values[i];
                }
            }
            for (var i = 0; i < this.values.length; i++) {
                if (this.values[i] > 0) {
                    var alpha = (this.values[i] - min) / (max - min);
                    var r = Math.round(alpha * 255);
                    var b = Math.round((1 - alpha) * 255);
                    ctxOverlay.fillStyle = "rgba(" + r + ", 0," + b + ", 0.5)";
                    var x = i % this.nrOfCols;
                    var y = Math.floor(i / this.nrOfCols);
                    ctxOverlay.fillRect(x * globals.TILE_WIDTH, y * globals.TILE_HEIGHT, globals.TILE_WIDTH, globals.TILE_HEIGHT);
                }
            }
        };
        OptimizeBuildingLayout.prototype.getScore = function (as) {
            var w = initializeWorld(this.nrOfCols, this.nrOfRows);
            as.applyOnWorld(w);
            var nrOfSecToRun = 600;
            w.scheduler.update(nrOfSecToRun * 1000, nrOfSecToRun * 1000);
            return 10 * w.scoring.nrOfItemsProduced
                + 100 * w.scoring.nrOfItemsProcessed
                + 100 * (w.scoring.lastIncome - w.scoring.lastExpense)
                - 1000 * w.scoring.idleWorkerCount / nrOfSecToRun;
        };
        return OptimizeBuildingLayout;
    }());
});
var Segment = /** @class */ (function () {
    function Segment(x, y, duration) {
        this.x = x;
        this.y = y;
        this.duration = duration;
    }
    return Segment;
}());
