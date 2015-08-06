/**
 * HashMap implementation. Like in Java, but not.
 * @type {number}
 * @private
 */

var _hashStateX = Math.random(),
    _hashStateY = 842502087 ,
    _hashStateZ = 0x8767    ,    // (int)(3579807591LL & 0xffff) ;
    _hashStateW = 273326509 ;

var get_next_hash = function(){
	// Marsaglia's xor-shift scheme with thread-specific state
	// This is probably the best overall implementation -- we'll
	// likely make this the default in future releases.
	var t = _hashStateX ;
	t ^= (t << 11) ;
	_hashStateX = _hashStateY ;
	_hashStateY = _hashStateZ ;
	_hashStateZ = _hashStateW ;
	var v = _hashStateW ;
	v = (v ^ (v >> 19)) ^ (t ^ (t >> 8)) ;
	_hashStateW = v ;
	return v;
};
var hashCache = {};

var HashMap = function(capacity, loadFactor){
	this._capacity = capacity;
	this._table = [];
//	this._table.length = capacity;
	this._table[0] = [];
	this._loadFactor = loadFactor || 0.75;
	this._threshold = capacity * this._loadFactor;

};
HashMap.hashCode = function(key){
	var v = typeof key + key;
	var hash = hashCache[v];
	if (hash) {
		return hash;
	} else {
		var newHash = get_next_hash();
		hashCache[v] = newHash;
		return newHash;
	}
};
HashMap.prototype.isNullKey = function(k){
	return k === null || k === undefined;
};
HashMap.prototype.putForNullKey = function(value){
	var chunk = this._table[0],
		exist;
	// find exist element
	while (chunk && !exist) {
		if (chunk.value === value ) {
			// replace oldValue
			exist = true;
		}
		chunk = chunk.next;
	}
	if (!exist)
		this.addEntry(0, null, value, 0);
};
HashMap.prototype.hash = function(h){
	h ^= (h >>> 20) ^ (h >>> 12);
	return h ^ (h >>> 7) ^ (h >>> 4);
};
HashMap.prototype.indexFor = function(h, l){
	return (h & (l - 2)) +1;  // return 1..l-1, because 0 for null keys
};
HashMap.prototype.addEntry = function(hash, key, value, index){
	var old = this._table[index],
		newEntry = {
			key: key,
			value: value,
			hash: hash,
			next: old
		};
	this._table[index] = newEntry;
	// check threshold
	if (Object.keys(this._table).length >= this._threshold) {
		this.resize( this._capacity*2 );
	}
};

HashMap.prototype.put = function(k, v){
	if (this.isNullKey(k)){
		this.putForNullKey(v);
	} else {
		var hash = this.hash( HashMap.hashCode(k)),
			index = this.indexFor(hash, this._capacity),
			chunk = this._table[index],
			oldValue;
		// find exist element
		while (chunk && !oldValue) {
			if (chunk.hash === hash && chunk.key === k ) {
				// replace oldValue
				oldValue = chunk.value;
				chunk.value = v;
			}
			chunk = chunk.next;
		}
		if (!oldValue) {
			// not found, add new entry
			this.addEntry(hash, k, v, index);
		}
	}
};

HashMap.prototype.get = function(k){
	var chunk;
	if (this.isNullKey(k)){
		chunk = this._table[0];
		var out = [];    // return all elements
		while (chunk) {
			out.push(chunk.value);
			chunk = chunk.next;
		}
		return out;
	} else {
		var hash = this.hash( HashMap.hashCode(k)),
			index = this.indexFor(hash, this._capacity),
			value;
		chunk = this._table[index];

		while (chunk && !value) {
			if (chunk.hash === hash && chunk.key === k ) {
				// replace oldValue
				return value = chunk.value;
			}
			chunk = chunk.next;
		}
	}
};

const MAXIMUM_CAPACITY = 4503599627370495; // don't asc me why

HashMap.prototype.resize = function(newCapacity){
	if (this._table.length == MAXIMUM_CAPACITY) {
		this._threshold = Number.MAX_VALUE;
		return;
	}

	var newTable = new HashMap(newCapacity, this._loadFactor);
	this.transfer(newTable);
	this._table = newTable._table;
	this._capacity = newTable._capacity;
	this._threshold = newCapacity * this._loadFactor;
};

HashMap.prototype.transfer = function(newTable){
	var readChunk = function(chunk){
		newTable.put(chunk.key, chunk.value);
		if (chunk.next)
			readChunk(chunk.next);
	};
	this._table.forEach(readChunk);
};

exports = module.exports = HashMap;