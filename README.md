## HashMap class

HashMap implementation in JavaScript.

Like in Java, but not.

### Usage

```javascript
var capacity = 16,
	loadFactor = 0.75,  // default value
	hashMap = new HashMap(capacity, loadFactor);
hashMap.put("someKey", "Some variable");
hashMap.get("someKey");
>> 'Some variable'
```

Hash map can auto resize.
But you can call it manualy:

```javascript
hashMap.resize(32);
```
