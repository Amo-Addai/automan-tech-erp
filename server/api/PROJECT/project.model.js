'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var funct = require('../../functions');
var settings = funct.settings;
var env = funct.config;
funct = funct.funct;
var type = "project";

var ProjectSchema = new Schema({
    name: String,
    details: String,

    start_date: Date,
    end_date: Date,

    // NOT TOO SURE IF PROJECT TYPE IS NECESSARY AT THE MOMENT
    type: { type: String, enum: env.projectTypes, default: env.projectTypesDefault },
    stage: { type: String, enum: env.projectStages, default: env.projectStagesDefault },

    data: { type: {}, default: env.projectDataDefault },

    proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },

    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    property_developers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    investors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    date_created: { type: Date, default: Date.now },
    image_stub: String, 
    

    /*
    is_assigned: Boolean,
    read: Boolean,
    funding: Number,
    datasecurity: {type:mongoose.Schema.Types.ObjectId, ref:'DataSecurity'},

    parent : {type:mongoose.Schema.Types.ObjectId, ref:'Project'},
    head : {type:mongoose.Schema.Types.ObjectId, ref:'Employee'},

    sub_projects:[{type:mongoose.Schema.Types.ObjectId, ref:'Project'}],
    tasks: [{type:mongoose.Schema.Types.ObjectId, ref:'Task'}],
    companies: [{type:mongoose.Schema.Types.ObjectId, ref:'Company'}],
    departments: [{type:mongoose.Schema.Types.ObjectId, ref:'Department'}],
    employees: [{type:mongoose.Schema.Types.ObjectId, ref:'Employee'}],
    clients: [{type:mongoose.Schema.Types.ObjectId, ref:'Client'}],
    stakeholders: [{type:mongoose.Schema.Types.ObjectId, ref:'StakeHolder'}],
    users: [{type:mongoose.Schema.Types.ObjectId, ref:'User'}],


    //  DATA FOR COMPLETION & VALIDATION
    is_completed: Boolean,
    performance_grade: { type: String, enum: env.performanceGrades, default: env.performanceGradesDefault },
    completion_remarks: {
        "employees": [
            {
                "employee": "",
                "remark": "",
                "percentage": 100
            }
        ],
        "clients": [
            {
                "client": "",
                "remark": "",
                "percentage": 100
            }
        ],
        "stakeholders": [
            {
                "stakeholder": "",
                "remark": "",
                "percentage": 100
            }
        ]
    },
    */

});

ProjectSchema.plugin(timestamps, {});
ProjectSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Project', ProjectSchema);

var PublicMethods = {

    markModify: 'data',
    deepPop: 'proposal properties accounts employees property_developers investors',
    mainData: 'name details start_date end_date type stage',
    dataToExclude: '',
    imgdata: '',
    sort: { "date_created": -1 },
    type: type,

    validate: function validate(obj, add) {
        // date_created, image_stub SHOULD BE SETTLED HERE
        if (add) {
            obj.date_created = Date.now();
        } else {
            if (obj._id) {
                delete obj._id;
            }
        }
        if (obj.security) {
            delete obj.security;
            // obj.datasecurity = funct.getDataSecurityObject(type, obj);
            // delete obj.security;
        }
        return obj;
    },

    Model: Model

};
module.exports = PublicMethods;

/*
var x;
for(x of ['save', 'update']){
    ProjectSchema.pre(x, function(next) {
        ProjectSchema.methods.encryptData();
        next();
    });
}
for(x of ['find', 'findOne']){
    ProjectSchema.pre(x, function(next) {
        ProjectSchema.methods.decryptData();
        next();
    });
}
for(x of ['remove']){
    ProjectSchema.post(x, function(next){
        // DELETE THIS OBJECT'S DATASECURITY OBJECT
        ProjectSchema.methods.deleteDataSecurity();
    })
}

ProjectSchema.methods = {
    // setPreCallbacks: function(){
    //     for(var x in ['save', 'update']){
    //         ProjectSchema.pre(x, function(next) {
    //             ProjectSchema.methods.encryptData();
    //             next();
    //         });
    //     }
    //     for(var x in ['find', 'findOne']){
    //         ProjectSchema.pre(x, function(next) {
    //             ProjectSchema.methods.decryptData();
    //             next();
    //         });
    //     }
    // },
    //
    // setPostCallbacks: function(){
    // },

    encryptData: function(){
        var x = funct.encryptData(type, this);
        for(var key in x){
            this[key] = x[key]; // DO THIS TO ONLY EDIT PROPS OF this WHICH ARE PRESENT IN x
        }
    },
    decryptData: function(){
        var x = funct.decryptData(type, this);
        for(var key in x){
            this[key] = x[key];
        }
    },
    deleteDataSecurity: function(){
        return funct.deleteDataSecurityObject(type, this); // THIS RETURNED BOOLEAN VALUE WON'T EVEN BE USED THOUGH
    }
};

ProjectSchema.plugin(timestamps, {});
ProjectSchema.plugin(deepPopulate, {});
var Model = mongoose.model('Project', ProjectSchema);

var PublicMethods = {

  deepPop : 'datasecurity parent head sub_projects tasks companies departments employees clients stakeholders users',
  mainData : 'name details is_assigned start_date deadline read funding is_completed performance_grade completion_remarks',
  dataToExclude : '',
  imgdata : '',
  sort : 'name',
  type : type,

    validate : function validate(obj, add) {
        // is_completed, read, date_created, is_assigned, image_stub, SHOULD BE SETTLED HERE
        if (add) {
            obj.is_completed = false;
            obj.read = false;
            obj.date_created = Date.now();
        } else {
            if (obj._id) {
                delete obj._id;
            }
        }
        obj.is_assigned = (obj.departments.length > 0) || (obj.employees.length > 0);
        obj.image_stub = "/AUTOMAN_FILE_SYSTEM/IMAGES/PROJECT/" + obj._id;
        if(obj.security){
            obj.datasecurity = funct.getDataSecurityObject(type, obj);
            delete obj.security;
        }
        obj.users = funct.getUsersInvolved(obj);
        if (obj.image_data) {
            imgdata = obj.image_data;
            obj.image_data = null;
            delete obj.image_data;
        }
        return obj;
    },

  Model : Model

};
module.exports = PublicMethods;
*/