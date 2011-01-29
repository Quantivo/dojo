define("dojo/store/util/SimpleQueryEngine", ["dojo"], function(dojo) {
dojo.getObject("store.util", true, dojo);

/*=====
dojo.store.util.SimpleQueryEngine.__sortInformation = function(attribute, descending){
	//	summary:
	//		An object describing what attribute to sort on, and the direction of the sort.
	//	attribute: String
	//		The name of the attribute to sort on.
	//	descending: Boolean
	//		The direction of the sort.  Default is false.
	this.attribute = attribute;
	this.descending = descending;
};

dojo.store.util.SimpleQueryEngine.__queryOptions = function(sort, start, count){
	//	summary:
	//		Optional object with additional parameters for query results.
	//	sort: dojo.store.util.SimpleQueryEngine.__sortInformation[]?
	//		A list of attributes to sort on, as well as direction
	//	start: Number?
	//		The first result to begin iteration on
	//	count: Number?
	//		The number of how many results should be returned.
	this.sort = sort;
	this.start = start;
	this.count = count;
};
=====*/

dojo.store.util.SimpleQueryEngine = function(query, options){
	// summary:
	//		Simple query engine that matches using filter functions, named filter
	//		functions or objects by name-value on a query object hash
	//
	// description:
	// 		The SimpleQueryEngine provides a way of getting a QueryResults through
	// 		the use of a simple object hash as a filter.  The hash will be used to
	// 		match properties on data objects with the corresponding value given. In
	// 		other words, only exact matches will be returned.
	//
	// 		This function can be used as a template for more complex query engines;
	// 		for example, an engine can be created that accepts an object hash that
	// 		contains filtering functions, or a string that gets evaluated, etc.
	//
	// 		When creating a new dojo.store, simply set the store's queryEngine
	// 		field as a reference to this function.
	//
	// 	query: Object
	// 		An object hash with fields that may match fields of items in the store.
	//	
	// 	options: dojo.store.util.SimpleQueryEngine.__queryOptions?
	// 		An object that contains optional information such as sort, start, and count.
	//
	// 	returns: Function
	// 		A function that caches the passed query under the field "matches".  See any
	// 		of the "query" methods on dojo.stores.
	//
	// 	example:
	// 		Define a store with a reference to this engine, and set up a query method.
	//
	// 	|	var myStore = function(options){
	// 	|		//	...more properties here
	// 	|		this.queryEngine = dojo.store.util.SimpleQueryEngine;
	// 	|		//	define our query method
	// 	|		this.query = function(query, options){
	// 	|			return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	// 	|		};
	// 	|	};

	// create our matching query function
	switch(typeof query){
		default:
			throw new Error("Can not query with a " + typeof query);
		case "object": case "undefined":
			var queryObject = query;
			query = function(object){
				for(var key in queryObject){
					if(queryObject[key] != object[key]){
						return false;
					}
				}
				return true;
			};
			break;
		case "string":
			// named query
			if(!this[query]){
				throw new Error("No filter function " + query + " was found in store");
			}
			query = this[query];
			// fall through
		case "function":
			// fall through
	}
	function execute(array){
		// execute the whole query, first we filter
		var results = dojo.filter(array, query);
		// next we sort
		if(options && options.sort){
			results.sort(function(a, b){
				for(var sort, i=0; sort = options.sort[i]; i++){
					var aValue = a[sort.attribute];
					var bValue = b[sort.attribute];
					if (aValue != bValue) {
						return !!sort.descending == aValue > bValue ? -1 : 1;
					}
				}
				return 0;
			});
		}
		// now we paginate
		if(options && (options.start || options.count)){
			var total = results.length;
			results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
			results.total = total;
		}
		return results;
	}
	execute.matches = query;
	return execute;
};

return dojo.store.util.SimpleQueryEngine;
});
