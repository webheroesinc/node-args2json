const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.DEBUG_LEVEL || 'fatal',
});

const sprintf				= require('sprintf-js').sprintf;

function args2json ( params ) {
    const args				= {};
    
    for ( let param of params ) {
	// Example param:
	// 
	//     something="string"
	//     something=3
	//     agent.id=6
	//     agent.key="Hcblabla..."
	//     agent.names[0]="Homer"
	//     agent.names[1]="Simpson"
	//     
	log.silly("param: %s", param );

	let ctx			= args;
	let [key, value]	= param.split(/=(.+)/);

	// If the `key` contains any '.' characters, that means it is refering to a child object
	// that may or may not exist.  If it does not exist, we will create one.  If it exists, but
	// is not an object, throw an error.
	let keys		= key.includes('.') ? key.split('.') : [ key ];
	let last_index		= keys.length - 1;
	    
	for ( let [n,k] of keys.entries() ) {
	    log.silly("key %s:%s => %s", last_index, n, k );
	    
	    let i;

	    log.silly("CTX: %s", ctx );
	    if ( k.includes('[') ) {
		[_,k,i]	= k.match(/(.*)\[([0-9]+)\]/);
		if ( isNaN(i) )
		    throw new Error(sprintf("Invalid parameter index '%s'. Must be an integer: %s", i, param ));
		
		i		= parseInt( i );
		
		log.silly("New array ctx for: %s", k );
		ctx		= ctx[k]	= ctx[k] || [];

		// If assigning an array item to the base ctx, check if the base context was already
		// treated as an object and throw if true.
		if ( n === 0 && k === '' && (
		    args[''] === undefined || Object.keys( args ).length > 1
		)) {
		    throw new Error(sprintf("Misconfiguration, cannot treat base as array because base was already assigned as an object"));
		}

		// Verify that ctx is an array
		if ( !Array.isArray( ctx ) )
		    throw new Error(sprintf("Misconfiguration, expected '%s' for key '%s' to be an array", typeof ctx, k ));
		
		
		if ( n === last_index ) {
		    key	= i;
		} else {
		    ctx	= ctx[i]	= ctx[i] || {};
		}
	    } else if ( n === last_index ) {
		// The last key of the array needs to be used for the final value assignment.
		log.silly("Last key: %s", k );
		key		= k;
	    } else {
		// This is not the final value, so we will use ore create an object here.
		log.silly("New object ctx for: %s", k );
		ctx		= ctx[k]	= ctx[k] || {};

		// If assigning an object item to the base ctx, check if the base context was
		// already treated as an array and throw if true.
		if ( n === 0 && Array.isArray( args[''] ) ) {
		    throw new Error(sprintf("Misconfiguration, cannot treat base as object because base was already assigned as an array"));
		}

		// Verify that ctx is an object
		if ( ctx === null || typeof ctx !== 'object' )
		    throw new Error(sprintf("Misconfiguration, expected '%s' for key '%s' to be an object", typeof ctx, k ));
	    }
	    
	    log.silly("Current state: %20.20s = %-20.20s in %s", key, value, ctx );
	}
	log.silly("Final state: %20.20s = %-20.20s in %s", key, value, ctx );

	try {
	    if ( ctx[key] !== undefined )
		throw new Error( sprintf("Cannot overwrite existing key '%s' with value: %s", key, value ) );
	    
	    if ( !isNaN( value ) )
		ctx[key]	= parseInt( value );
	    else
		ctx[key]	= eval( value );
	} catch (err) {
	    log.error("Failed to parse param '%s', failed with: %s", param, String(err) );
	    throw err;
	}
    }

    return Array.isArray( args[''] ) ? args[''] : args;
}

module.exports = args2json;
