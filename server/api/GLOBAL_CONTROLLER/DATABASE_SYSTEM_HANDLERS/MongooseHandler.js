var mongoose = require('mongoose');

var MongooseHandler = {

    getPropAsObjectOrId: async function(type, data, str){
        return new Promise((resolve, reject) => {

            function returnIdOrString(id, str){
                if(str === "id") return new mongoose.Types.ObjectId(id);
                else if(str === "str") return id.toString();
                else return id.toString();
            }

            if(!(["obj", "id", "str"].includes(str))) reject({ success : false, message : "str argument not valid"});
            try {
                console.log("Getting Model for " + type);
                var obj = null, M = this.getModel(type);
                console.log(type + " Model -> " + M.modelName);
                if(str === "obj"){ // THEREFORE, WE NEED THE WHOLE DATA OBJECT
                    console.log("Requiring a WHOLE data object ...");
                    if((typeof data === "object") && (data._id)) {
                        console.log("THIS MUST RUN!!")
                        resolve(data);
                    } else if((typeof data === "string") || this.checkIDMatch(data)) {
                        if(data.length > 0) { // type SHOULD BE A MODEL THOUGH
                            M.findById(data, function(err, obj){
                                if (err || !obj || typeof obj == 'undefined') reject(err);
                                else if(obj && obj._id) resolve(obj);
                            })
                        } else reject({ success : false, message : "Data ID is of incorrect length"});
                    } else reject({ success : false, message : "Data doesn't include ID"});

                } else { // THEREFORE, WE NEED THE ._id AS EITHER OBJECTID / STRING
                    console.log("Requiring an ID in " + (str === "str" ? "string" : str) + " format ...");
                    if((typeof data === "string") || (this.checkIDMatch(data))) {
                        var idOrStr = returnIdOrString(data, str); 
                        console.log("Data is already in " + (str === "str" ? "string" : str) 
                        + " format -> " + idOrStr + " with datatype -> " + typeof idOrStr);
                        resolve(idOrStr);
                    } else if(typeof data === "object") {
                        if(data && data._id) {
                            var idOrStr = returnIdOrString(data._id, str);
                            console.log("Data is an object, therefore returning its ID in " + (str === "str" ? "string" : str)
                             + " format -> " + idOrStr + " with datatype -> " + typeof idOrStr);
                            resolve(idOrStr);
                        } else reject({ success : false, message : "Data Object doesn't include ID"});
                    } else reject({ success : false, message : "Data doesn't include ID"});

                }
            } catch (err){
                console.log("Error -> " + JSON.stringify(err));
                reject(err);
            }
        });
    },

    getModelName: function(type){
        switch(type){
            case "autolog": return "AutoLog";
            case "autoevent": return "AutoEvent";
            case "user": return "User";
        }
        return null;
    },

    getModel: function(type){
        return mongoose.model(this.getModelName(type));
    },
    getSchema: function(type){
        return mongoose.model(this.getModelName(type)).schema;
    },

    checkIDMatch: function(id){
        return mongoose.Types.ObjectId.isValid(id);
        // return id.match(/^[0-9a-fA-F]{24}$/);
    },
       
};

module.exports = MongooseHandler;
