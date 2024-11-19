'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;
var crypto = require('crypto');

var funct = require('../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "user";

var UserSchema = new Schema({
    full_name: String,
    first_name: String,
    last_name: String,
    other_names: String,
    date_of_birth: Date,
    age: Number,
    gender: { type: String, enum: env.userGenders, default: env.userGendersDefault },
    nationality: { type: String, enum: env.userNationalities, default: env.userNationalitiesDefault },
    details: String,
    phone: String,
    email: { type: String, lowercase: true, unique: true },
    home_address: String,
    postal_address: String,
    app_id: String,

    type: { type: String, enum: env.userTypes, default: env.userTypesDefault },
    contact_method: { type: String, enum: env.contactMethods, default: env.contactMethodsDefault },

    data: { type: {}, default: env.userDataDefault },
    social_media: {},

    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    portfolios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' }],
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }],
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],

    date_created: { type: Date, default: Date.now },
    image_stub: String,

    ////////////////////////////////////////////////////////////////////////////////////////////////
    //  EXTRA INFORMATION ADDED BASED ON EMPLOYEE / CLIENT / STAKEHOLDER INFORMATION
    /// USER FIELDS
    ////////////////////////////////////////////////////////////////////////////////////////////////
    username: { type: String, trim: true, unique: false, required: false }, // unique & required DO NOT NEED TO BE true FOR NOW ..

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // DATA NOT REALLY NEEDED FOR THE MAIN ACTIVITIES
    provider: { type: String, default: 'local' },
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // NOT TO BE INCLUDED IN ANY RESPONSE DATA
    hashedPassword: String,
    salt: String,

});

UserSchema.index({ location: '2d' });
/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(async function (password) {
        try {
            this._password = password;
            console.log("PASSWORD -> " + this._password);
            this.salt = this.makeSalt();
            console.log("SALT -> " + this.salt);
            this.hashedPassword = await this.encryptPassword(password);
            console.log("HASHED PASSWORD -> " + this.hashedPassword);
        } catch (err) {
            console.log(err);
            this._password = password;
        }
    })
    .get(function () {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function () {
        return {
            'username': this.username
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('access_token')
    .get(function () {
        return {
            '_id': this._id
        };
    });

/**
 * Validations
 */

// Validate empty username
UserSchema
    .path('provider')
    .validate(function (provider) {
        return ["local"].includes(provider) && (["local"].indexOf(this.provider) !== -1);
    }, 'provider is not supported');

UserSchema
    .path('username')
    .validate(function (username) {
        return username.trim().length;
    }, 'username cannot be blank');

// Validate empty email
// UserSchema
//     .path('email')
//     .validate(function(email) {
//         return email.trim().length;
//     }, 'email cannot be blank');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function (hashedPassword) {
        return hashedPassword.length;
    }, 'Password cannot be blank');

// Validate phone/email/company_email is not taken
// for(var sth of ["phone", "email"
// // , "company_email"
// ]){
//     UserSchema
//     .path(sth)
//     .validate(function(value) {
//         var self = this;
//         self[sth] = (self[sth] || '').trim();
//         var cond = {}; cond[sth] = value;
//         this.constructor.findOne(cond, function(err, user) {
//             if (err) throw err;
//             if (user) {
//                 if ( (self || 'self')._id.toString() === (user || 'user')._id.toString() ){
//                     return true
//                 }
//                 return false;
//             }
//             return true;
//         });
//     }, 'The specified ' + sth + ' is already in use.');
//
// }

var validatePresenceOf = function (value) {
    return value && value.length;
};

var authTypes = ["local"];

/**
 * Pre-save hook
 */
UserSchema.pre('save', async function (next) {
    try {
        if (!this.isNew) return next();

        // THIS IS COMMENTED COZ WHEN .first_name / .last_name IS UPDATED, .full_name ISN'T UPDATED COZ IT'LL STILL HAVE AN OLD VALUE
        // if(!this.full_name || (this.full_name && (this.full_name.length < 1)) )
        this.full_name = ((this.first_name || "").trim() + " " + (this.last_name || "").trim() + " " + (this.other_name || "").trim()).trim()

        console.log("FULL NAME -> " + this.full_name);
        console.log("PASS -> " + this.password);
        console.log("HASH -> " + this.hashedPassword);
        console.log("PROVIDER -> " + this.provider);

        if (validatePresenceOf(this.password)) {
            if (authTypes.indexOf(this.provider) === -1) {
                return next(new Error('Invalid password'))
            } else {
                if (!validatePresenceOf(this.hashedPassword)) {
                    this.salt = this.makeSalt();
                    this.hashedPassword = await this.encryptPassword(this.password);
                    console.log("NOW, SALT -> " + this.salt);
                    console.log("NOW, HASH -> " + this.hashedPassword);
                    return next();
                } else {
                    console.log("NOW, HASH -> " + this.hashedPassword);
                    return next();
                }
            }
        } else return next(new Error('Password not set'))
    } catch (err) {
        console.log("ERROR -> " + err);
        return next(new Error('Some error occurred'));
    }
});


// for(var x of ['', 'save', 'update']){
//     UserSchema.pre(x, async function(next) {
//         try {
//             // UserSchema.methods.encryptData();
//             console.log(x + "!!!")
//             if(x === 'save'){
//                 console.log("WITHIN SAVE NOW ...")
//                 if (!this.isNew) return next();

//                 console.log("PASS -> " + this.password);
//                 console.log("HASH -> " + this.hashedPassword);
//                 console.log("PROVIDER -> " + this.provider);

//                 if (validatePresenceOf(this.password)) {
//                     console.log("f")
//                     if (authTypes.indexOf(this.provider) === -1) {
//                         console.log("a")
//                         return next(new Error('Invalid password'))
//                     } else {
//                         console.log("b")
//                         if(!validatePresenceOf(this.hashedPassword)){
//                             console.log("c")
//                             this.salt = this.makeSalt();
//                             this.hashedPassword = await this.encryptPassword(this.password);
//                             console.log("NOW, HASH -> " + this.hashedPassword);
//                             return next();
//                         } else {
//                             console.log("d")
//                             console.log("NOW, HASH -> " + this.hashedPassword);
//                             return next();
//                         }
//                     }
//                 } else return next(new Error('Password not set'))
//                 console.log("e")

//             } else next();
//         } catch (err){
//             console.log("ERROR -> " + err);
//             return next(new Error('Some error occurred'));
//         }
//     });
// }

/**
 * Methods
 */
UserSchema.methods = {
    encryptData: function () {
    },
    decryptData: function () {
    },
    deleteDataSecurity: function () {
        return true; // THIS RETURNED BOOLEAN VALUE WON'T EVEN BE USED THOUGH
    },

    // Authenticate - check if the passwords are the same
    authenticate: async function (plainText) {
        try {
            console.log("PASSWORD ATTEMPT -> " + plainText);
            console.log("CURRENT HASHED PASSWORD -> " + this.hashedPassword);
            // 
            var passwordAttempt = await this.encryptPassword(plainText);
            console.log("HASHED PASSWORD ATTEMPT -> " + passwordAttempt);
            return passwordAttempt === this.hashedPassword;
        } catch (err) {
            console.log(err);
            return false;
        }
    },

    // Make salt
    makeSalt: function () {
        console.log("SALT GENERATION FUNCTION HAPPENS HERE!!!")
        return crypto.randomBytes(16).toString('base64');
    },

    // Encrypt password
    encryptPassword: async function (password) { // EDIT THIS FUNCTION TO COMBINE IT WITH SETTINGS
        console.log("PASSWORD HASHING (ENCRYPTION) HAPPENS HERE!!!");
        var salt = new Buffer(this.salt, 'base64');
        console.log("BUFFER SALT -> " + salt);
        return new Promise((resolve, reject) => {
            if (!password || !salt) resolve(password);
            // password, salt, iterations, keylen, digest (algorithm)
            // ALL POSSIBLE digest ALGORITHMS CAN GE GOTTEN BY crypto.getHashes()
            var iterations = 10000, keyLength = 64, algorithm = 'sha1'; // sha512

            crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, function (err, derivedKey) {
                if (err) {
                    console.log("Error occured in hashing password")
                    console.log(err);
                    // reject(err); // OR YOU CAN ALSO CHOOSE TO CALL THIS INSTEAD :)
                    resolve(password); // RETURN PASSWORD NAA IF HASHING FAILS
                } else {
                    console.log("Encrypted password: " + derivedKey);
                    resolve(derivedKey.toString('base64'));
                }
            });
            // // OR YOU CAN CALL THE SYNCHRONIZED VERSION INSTEAD ...
            // resolve(crypto.pbkdf2Sync(password, salt, iterations, keyLength, algorithm).toString('base64'));
        });
    }
};

UserSchema.plugin(timestamps, {});
UserSchema.plugin(deepPopulate, {});
var Model = mongoose.model('User', UserSchema);

var PublicMethods = {

    markModify: 'data social_media',
    deepPop: 'investments portfolios assets stocks properties projects accounts messages',
    mainData: 'full_name first_name last_name other_names gender age details phone email app_id home_address postal_address type contact_method username',

    dataToExclude: '-salt -hashedPassword -provider',
    imgdata: '',
    sort: { "date_created": -1 },
    type: type,

    validate: function validate(obj, add) {
        // full_name, date_created, image_stub, provider, is_employee, is_client, is_stakeholder
        // create user object SHOULD BE SETTLED HERE 
        if (add) {
            obj.date_created = Date.now();
            // // FIND A WAY TO POPULATE .password & .provider PROPERTIES
            // if(!obj.provider) obj.provider = "local";
            // else { // NOW FIND OUT IF THIS OBJ IS BEING CREATED FROM THE DASHBOARD
            //     var dash = obj.hasOwnProperty("dashboard") && obj.dashboard;
            //     delete obj.dashboard;
            //     var auths = settings.getPossibleAuthentications(dash);
            //     if(!auths.contains(obj.provider)) obj.provider = "local";
            // }
            if (!obj.password) { // SET IT TO DEFAULT FORMAT OF PASSWORD (BASED ON SETTINGS OR STH)
                obj.password = "0000";
            }
        } else {
            if (obj._id) {
                delete obj._id;
            }
        }
        for(var k of ["first_name", "last_name", "other_names"]){
            if(!obj[k] || (obj[k] == undefined)) obj[k] = "";
        }
        obj.full_name = obj.first_name + " " + obj.last_name + " " + obj.other_names + "";
        // obj.is_employee = obj.employee && obj.employee.hasOwnProperty("_id");
        // obj.is_client = obj.client && obj.client.hasOwnProperty("_id");
        // obj.is_stakeholder = obj.stakeholder && obj.stakeholder.hasOwnProperty("_id");
        //
        // obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/USER/" + obj._id;
        // if(obj.security){
        //     obj.datasecurity = funct.getDataSecurityObject(this.type, obj);
        //     delete obj.security;
        // }
        //
        // if (!(obj.userRole) || !config.userRoles.hasOwnProperty(obj.userRole)) {
        //     obj.userRole = config.userRolesDefault; // TAKE THE DEFAULT VALUE IN THE userRoles ARRAY
        // }
        // if (!(obj.levelOfSecurity) || !config.levelsOfSecurity.hasOwnProperty(obj.levelOfSecurity)) {
        //     obj.levelOfSecurity = config.levelsOfSecurityDefault; // TAKE THE DEFAULT VALUE IN THE levelsOfSecurity ARRAY
        // }
        // if (obj.types && obj.types.length > 0) { // THIS WON'T EVEN RUN COZ USER MODEL HAS NO .types PROPERTY ANYMORE
        //     obj = funct.createUpdateUserWithTypes(obj);
        // }
        // if (obj.image_data) {
        //     imgdata = obj.image_data;
        //     obj.image_data = null;
        //     delete obj.image_data;
        // }
        return obj;
    },

    Model: Model

};

module.exports = PublicMethods;
