'use strict';

var mongooseHandler = require('../DATABASE_SYSTEM_HANDLERS/MongooseHandler');


function getPlural (type){
    if(type[type.length-1] === 'y') return type.substr(0, type.length-1) + 'ies';
    else return type + 's';
}

function getSingular (type){
    if((type[type.length-1] === 's') && (type[type.length-2] === 'e') && (type[type.length-3] === 'i'))
        return type.substr(0, type.length-3) + 'y';
    else return type.substr(0, type.length-1);
}

function propertyEqualsID (prop, id){
    return prop.toString() == id.toString();
}

function arrayContainsID (arr, id){
    for(var objId of arr){
        console.log(objId + " == " + id + " -> " + (objId.toString() == id.toString()));
        if(objId.toString() == id.toString()) return true;
    }
    return false;
}

function removeIDFromArray (arr, id){
    for(var objId of arr){
        console.log(objId + " == " + id + " -> " + (objId.toString() == id.toString()));
        if(objId.toString() == id.toString()) {
            arr.splice(arr.indexOf(objId), 1);
        }
    }
    return arr;
}

module.exports = {

    explode: function(deepPop){
        return deepPop.split(' '); // JUST LIKE PHP'S .explode() FUNCTION
    },

    getModel: function(type){
        return mongooseHandler.getModel(type);
    },
    // getModelController: function(type){
    // },

    isSingular: function(type){
      // return !type.endsWith('s'); // OR YOU CAN JUST CALL THIS SHIT RIGHT HERE
        return type[type.length-1] !== 's'; // THIS EXPRESSION WON'T ALWAYS WORK THOUGH
    },

        handleParentOrSub: function(type, prop, data){
            
        },

        handleHead: function(type, data){
            
        },

        handleDefault: async function(type, prop, data){
            try {
                var id = '', M = null; // THIS WILL BE THE MODEL OF THE OTHER OBJECT TO BE MARK MODIFIED
                if(this.isSingular(prop)){
                    
                    console.log("Handling single object ..");
                    M = this.getModel(prop);
                    console.log("OTHER OBJECT MODEL -> " + M.modelName);

                    var i = "";
                    // NOW CHECK IF THIS WAS SETUP FROM AN EDIT / DELETE OPERATION
                    if (data.deleted != undefined){
                        i = data["deleted"][prop];
                    } else if (data.old != undefined){
                        i = data["old"][prop];
                        delete data["old"]; // DO THIS IF YOU WANT, COZ IT WON'T BE NEEDED ANYMORE
                    } else if (data[prop] != undefined) {
                        i = data[prop];
                    } else return;
                    // WITHIN DATA HANDLER, WE USED findById() FOR EDIT/DELETE SO data[prop] WON'T BE POPULATED (JUST AN ID STRING)
                    // WITH ADD ACTION TOO, data[prop] WILL NEVER BE AN ID STRING EITHER, BUT STILL GET THE ID FORM TO BE SURE
                    id = await mongooseHandler.getPropAsObjectOrId(prop, i, "id");
                    console.log("ID OF OTHER OBJECT -> " + id);
                    // YOU CAN DECIDE WHETHER YOU WANT THIS NEXT FUNCTION TO BE await'ed OR NOT
                    this.handleSingleOrPlural(M, id, type, data, prop);
                    // ALSO, YOU CAN FIND A WAY TO WORK WITH THE RESULT (BOOLEAN OR err) RETURNED BY FUNCTION ABOVE
                } else if(data[prop] instanceof Array){
                    var singularProp = getSingular(prop);
                    console.log("Handling multiple objects ..");
                    M = this.getModel(singularProp);
                    console.log("OTHER OBJECT MODEL -> " + M.modelName);

                    var arr = [];
                    // NOW CHECK IF THIS WAS SETUP FROM AN EDIT / DELETE OPERATION
                    if (data.deleted != undefined){
                        console.log("a")
                        arr = data["deleted"][prop];
                    } else if (data.old != undefined){
                        console.log("b")
                        console.log("OLD -> " + JSON.stringify(data["old"]));
                        console.log("NEW -> " + JSON.stringify(data));
                        arr = [];
                        // data["old"] MIGHT NOT HAVE HAD LINKS THAT'VE NOW BEEN INTRO'D INTO data[prop] ...
                        for(var a of [data["old"][prop], data[prop]] ) {// SO CALL THIS TO GET ALL POSSIBLE LINKS WITHIN THE ARRAY
                            for(var i of a) if(!arr.includes(i)) arr.push(i);
                        }
                        delete data["old"]; // DO THIS IF YOU WANT, COZ IT WON'T BE NEEDED ANYMORE
                    } else if (data[prop] != undefined) { // THIS WILL MOST LIKELY ALWAYS BE TRUE THOUGH
                        console.log("c")
                        arr = data[prop];
                    } else return;
                    console.log("NOW ARRAY TO GLOBALLY MARK MODIFY -> "); console.log(arr);

                    for(var x of arr) {
                        console.log("Handling Plural " + prop + " Property -> " + x);

                        // WITHIN DATA HANDLER, WE USED findById() FOR EDIT/DELETE SO data[prop] WON'T BE POPULATED (JUST AN ID STRING)
                        // WITH ADD ACTION TOO, data[prop] WILL NEVER BE AN ID STRING EITHER, BUT STILL GET THE ID FORM TO BE SURE
                        id = await mongooseHandler.getPropAsObjectOrId(singularProp, x, "id");
                        console.log("ID OF OTHER OBJECT -> " + id);
                        // YOU CAN DECIDE WHETHER YOU WANT THIS NEXT FUNCTION TO BE await'ed OR NOT
                        this.handleSingleOrPlural(M, id, type, data, singularProp);
                        // ALSO, YOU CAN FIND A WAY TO WORK WITH THE RESULT (BOOLEAN OR err) RETURNED BY FUNCTION ABOVE
                    }
                } else console.log("PROPERTY IS NEITHER SINGULAR NOR PLURAL :( -> " + prop);
            } catch(err){
                console.log("Some error occured -> " + JSON.stringify(err));
            }
        },

        handleSingleOrPlural: async function(OtherM, id, type, data, otherType){
            return new Promise((resolve, reject) => {
                console.log("NOW, MODEL OF OTHER OBJECT TO MODIFY -> " + OtherM.modelName);
                console.log("ID OF OTHER OBJECT TO MODIFY -> " + id);
                console.log("ID DATATYPE OF OBJECT TO MODIFY -> " + typeof id); // string
                console.log("TYPE OF OTHER OBJECT TO MODIFY -> " + otherType);
                console.log("TYPE OF OBJECT MODIFYING -> " + type);
                console.log("ID OF OBJECT MODIFYING -> " + data._id);
                console.log("ID DATATYPE OF OBJECT MODIFYING -> " + typeof data._id); // object
                console.log("DATA OF OBJECT MODIFYING -> " + data);
                // GET MODEL OBJECT OF OBJECT MODIFYING
                var aimToSet = false, pluralOtherType = getPlural(otherType), ModifyingM = this.getModel(type); 
                // 
                console.log("NOW, DETERMINING WHETHER WE'RE AIMING TO SET LINK WITH OBJECT TO MODIFY OR NOT..")
                ///////////////////////////////////////////////////////////////////////////////////////////////
                if(data["deleted"] != undefined) {
                    console.log("OBJECT MODIFYING WAS DELETED, THEREFORE LINK MUST BE REMOVED")
                    aimToSet = false;
                } else {
                    if( (ModifyingM.schema.path(otherType) !== undefined)) {
                        console.log("Modifying Object has property of Object to Modify as singular ...");
                        if(propertyEqualsID(data[otherType], id)) {
                            aimToSet = true;
                            console.log("Modifying Object contains a link to Object to Modify");
                        } else console.log("Modifying Object doesn't contain a link to Object to Modify");
                    } else if( (ModifyingM.schema.path(pluralOtherType) !== undefined) ) {
                        console.log("Modifying Object has property of Object to Modify as plural ...");
                        console.log("ARRAY -> " + data[pluralOtherType]);
                        console.log("ID -> " + id);
                        ///////////////////////////////////////////////////////////////////////////////////////////////
                        if(arrayContainsID(data[pluralOtherType], id)) {
                            aimToSet = true;
                            console.log("Modifying Object contains a link to Object to Modify");
                        } else console.log("Modifying Object doesn't contain a link to Object to Modify");
                    } else {
                        console.log("Modifying Object doesn't contain Object to Modify as a property");
                        resolve(false);
                    } 
                }
                // NOW, YOU CAN THEN FIND OBJECT TO MODIFY THEN SET/NOT BASED ON aimToSet
                console.log("NOW, ATTEMPTING TO RETRIEVE OBJECT TO MODIFY");
                console.log("AIMING TO SET -> " + aimToSet);

                OtherM.findById(id, function (err, old) { // THIS FUNCTION WILL NOT DEEP POPULATE
                    if(err || !old) {
                        console.log("Some error occured in finding other object -> " + JSON.stringify(err));
                        console.log("Most likely, the id for Other object doesn't exist, therefore rectifying issue ...")

                        if(data["deleted"] != undefined) resolve(false); // IN CASE OBJECT MODIFYING WAS DELETED, YOU DON'T NEED TO RE-SAVE ANYTHING

                        if( (ModifyingM.schema.path(otherType) !== undefined)) {
                            console.log("Modifying Object had property of Object to Modify as singular ...");
                            if( propertyEqualsID(data[otherType], id) ) { // FOR SINGULAR - data[otherType] 
                                console.log("Unassigning Data ID -> " + id);
                                data[otherType] = ""; // (NOT data[otherType]._id) COZ findById DOES NOT DEEP POPULATE
                                data.save(function (err) {
                                    if (err) console.log("Some error occured in rectifying modifying object -> " + JSON.stringify(err));
                                    else console.log("Modifying object rectified successfully");
                                    resolve(false);
                                });
                            }
                        } else if( (ModifyingM.schema.path(pluralOtherType) !== undefined) ) {
                            console.log("Modifying Object had property of Object to Modify as plural ...");
                            if( arrayContainsID(data[pluralOtherType], id) )  {
                                console.log("OBJECT'S PROPERTY ARRAY DOES INCLUDE (" + otherType + "'s ID '"+id+"') -> " + arrayContainsID(data[pluralOtherType], id) );
                                console.log("Removing Data ID -> " + id);
                                data[pluralOtherType] = removeIDFromArray(data[pluralOtherType], id); // FOR PLURAL
                                data.save(function (err) {
                                    if (err) console.log("Some error occured in rectifying modifying object -> " + JSON.stringify(err));
                                    else console.log("Modifying object rectified successfully");
                                    resolve(false);
                                });
                            }
                        } else {
                            console.log("Modifying Object doesn't contain Object to Modify as a property");
                            resolve(false);
                        } 
                        resolve(false);
                    } else { // DO THIS OR JAVASCRIPT'S "NON-STOP" EXECUTION FEATURE WILL MESS WITH YOU
                        console.log("NOW, OBJECT TO MODIFY -> " + JSON.stringify(old));
                        console.log("NOW, CHECKING IF THE OBJECT TO MODIFY HAS PROPERTY (TYPE OF OBJECT MODIFYING) AS SINGULAR OR PLURAL ... ");
                        // NOW CHECK IF THE OBJECT TO MODIFY HAS PROPERTY (TYPE OF OBJECT MODIFYING) AS SINGULAR OR PLURAL
                        var pluralType = getPlural(type), modifyingId = data._id;
                        ///////////////////////////////////////////////////////////////////////////////////////////////
                        if( (OtherM.schema.path(type) !== undefined)) {
                            console.log("Object to Modify has property of Object modifying as singular ...");
                            console.log("DATA ID -> " + modifyingId);
                            console.log("OBJECT'S LINK -> "+ old[type]);
                            //
                            if(aimToSet) {
                                console.log("Aiming to set link, therefore Checking to see if a link must be added ...")
                                if( propertyEqualsID(old[type], modifyingId) ) { // FOR SINGULAR - old[type] 
                                    console.log("Assigning Data ID -> " + modifyingId);
                                    old[type] = modifyingId; // (NOT old[type]._id) COZ findById DOES NOT DEEP POPULATE
                                }
                            } else {
                                console.log("Not aiming to set link, therefore Checking to see if a link must be removed ...")
                                if( propertyEqualsID(old[type], modifyingId) ) { // FOR SINGULAR - old[type] 
                                    console.log("Unassigning Data ID -> " + modifyingId);
                                    old[type] = ""; // (NOT old[type]._id) COZ findById DOES NOT DEEP POPULATE
                                }
                            }
                        } else if( (OtherM.schema.path(pluralType) !== undefined) ) {

                            console.log("Object to Modify has property of Object modifying as plural ...");
                            console.log("DATA ID -> " + modifyingId);
                            console.log("OBJECT'S ARRAY OF LINKS -> " + old[pluralType]);
                            ///////////////////////////////////////////////////////////////////////////////////////////////
                            if(aimToSet) {
                                console.log("Aiming to set link, therefore Checking to see if a link must be added ...")
                                if( !( arrayContainsID(old[pluralType], modifyingId) ) ) { 
                                    console.log("OBJECT'S PROPERTY ARRAY DOESN'T INCLUDE (" + type + "'s ID '"+modifyingId+"') -> " + !( arrayContainsID(old[pluralType], modifyingId) ) );
                                    console.log("Adding Data ID -> " + modifyingId);
                                    old[pluralType].push(modifyingId); // FOR PLURAL
                                }
                            } else {
                                console.log("Not aiming to set link, therefore Checking to see if a link must be removed ...")
                                if( ( arrayContainsID(old[pluralType], modifyingId) ) ) { 
                                    console.log("OBJECT'S PROPERTY ARRAY DOES INCLUDE (" + type + "'s ID '"+modifyingId+"') -> " + ( arrayContainsID(old[pluralType], modifyingId) ) );
                                    console.log("Removing Data ID -> " + modifyingId);
                                    old[pluralType] = removeIDFromArray(old[pluralType], modifyingId); // FOR PLURAL
                                }
                            }
                        } else {
                            console.log("Object to Modify doesn't contain Modifying Object as a property");
                            resolve(false);
                        }

                        var updatedobj = old; // funct.markModified(old, {}); // NOT EVEN REQUIRED SINCE THERE'S NO NEW OBJECT
                        console.log("FINALLY, UPDATED OBJECT -> " + JSON.stringify(updatedobj));
                        updatedobj.save(function (err) {
                            if (err) {
                                console.log("Some error occured in saving other object -> " + JSON.stringify(err));
                                resolve(false);
                            } else resolve(true);
                        });
                    }
                });
            });
        }

};
