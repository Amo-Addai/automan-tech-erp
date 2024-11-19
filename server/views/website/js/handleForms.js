jQuery(document).ready(function($) {
  "use strict";

  const URL_DOMAIN = window.location.protocol+"//"+window.location.hostname+("")+"/"; // :8080
  // "http://cofundie.com/"; // "https://cofundieapp.herokuapp.com/"; // "http://localhost:8080/"; // 
  var AutoWebsiteAccessData = {
    routes: {
      autowebsite: URL_DOMAIN + "public/autowebsite/"
    }
  };


  // 
  // SEARCH FOR ALL CALLS OF makeRequest(...), AS THIS WILL SHOW YOU THE REQUIRED PARAMS
  // 
  // url CAN ONLY BE -> new_waitlist / new_message / new_prospect

  async function makeRequest(url="", method="", query=null, body=null){
    var _this = this;
    return new Promise(async (resolve, reject) => {
        try {
            var options = {
              headers: {
              //   'Authorization': 'Bearer ' + STH_TOKEN_HERE,
                'Accept': 'application/json'
              },
              uri: AutoWebsiteAccessData.routes.autowebsite + url,
              method: method
            };
            if(query) options["qs"] = query;
            if(body && !(["GET", "DELETE"].includes(method)) ) options["body"] = body;
            console.log("REQUEST OPTIONS -> " + JSON.stringify(options));
            // 
            $.ajax({
              type: options.method,
              headers: options.headers, 
              dataType: "json",
              // contentType: 'application/json; charset=utf-8',
              url: options.uri, // + ((query && options.qs && (Object.keys(options.qs).length > 0)) ? "?" + options.qs : ""),
              data: options.body || null, 
              success: function(res) {
                // res = JSON.parse(res);
                console.log("\nRESULT DATA -> " + JSON.stringify(res) + "\n");
                resolve(res);
              },
              error: function(err) {
                console.log("ERROR -> " + JSON.stringify(err))
                resolve(null);
              },
              done: function() {
                // console.log("DONE!!!");
              }
            });
            // 
        } catch (e) {
            console.log("ERROR DURING REQUEST -> " + e);
            resolve(null);
        }
    });
  }


  function validateForm(f){ 
    // YOU CAN LATER IMPLEMENT THIS TO MAKE THE VALIDATION SIMPLER
    var ferror = false,
      emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;
      
    f.children('input').each(function() { // run all inputs

      var i = $(this); // current input

      var rule = i.attr('data-rule'); 

      if (rule !== undefined) {
        var ierror = false; // error flag for current input
        var pos = rule.indexOf(':', 0);
        if (pos >= 0) {
          var exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        switch (rule) {
          case 'required':
            if (i.val() === '') {
              ferror = ierror = true;
            }
            break;

          case 'minlen':
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;

          case 'email':
            if (!emailExp.test(i.val())) {
              ferror = ierror = true;
            }
            break;

          case 'checked':
            if (! i.is(':checked')) {
              ferror = ierror = true;
            }
            break;

          case 'regexp':
            exp = new RegExp(exp);
            if (!exp.test(i.val())) {
              ferror = ierror = true;
            }
            break;
        }

        i.next('.validation').html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
      }
    });

    f.children('textarea').each(function() { // run all inputs

      var i = $(this); // current input
      var rule = i.attr('data-rule');

      if (rule !== undefined) {
        var ierror = false; // error flag for current input
        var pos = rule.indexOf(':', 0);
        if (pos >= 0) {
          var exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        switch (rule) {
          case 'required':
            if (i.val() === '') {
              ferror = ierror = true;
            }
            break;

          case 'minlen':
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;
        }
        i.next('.validation').html((ierror ? (i.attr('data-msg') != undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
      }
    });


    if (ferror) return false;
    else return true;

  }
    

  // Subscribe

  $('form.subscribeForm').submit(async function(e) {
    e.preventDefault();
    var f = $(this).find('.form-group')
    if (!validateForm(f)) return false;
    var data = {}; // $(this).serialize();
    $(this).serializeArray().map(x => { data[x.name] = x.value; });
    console.log("BODY TO SEND -> " + JSON.stringify(data));
    // 
    var res = await makeRequest("new_prospect", "POST", null, data);
    // alert(res); // OR WORK WITH res HOWEVER YOU LIKE ..
    if (res) {
      $("#subscribeForm_sendmessage").addClass("show");
      $("#subscribeForm_errormessage").removeClass("show");
      $('.subscribeForm').find("input, textarea").val("");
    } else {
      $("#subscribeForm_sendmessage").removeClass("show");
      $("#subscribeForm_errormessage").addClass("show");
      $('#subscribeForm_errormessage').html(msg);
    }

  });


  // Join Waitlist 

  $('form.waitlistForm').submit(async function(e) {
    e.preventDefault();
    var f = $(this).find('.form-group')
    if (!validateForm(f)) return false;
    var data = {}; // $(this).serialize();
    $(this).serializeArray().map(x => { data[x.name] = x.value; });
    // MAKE SURE YOU INCLUDE THE ID OF THE PROPERTY'S WAITLIST TO BE JOINED
    data.propertyId = window.location.search.split("=")[1];
    console.log("BODY TO SEND -> " + JSON.stringify(data));
    // 
    var res = await makeRequest("new_waitlist", "POST", null, data);
    // alert(res); // OR WORK WITH res HOWEVER YOU LIKE ..
    if (res) {
      $("#waitlistForm_sendmessage").addClass("show");
      $("#waitlistForm_errormessage").removeClass("show");
      $('.contactForm').find("input, textarea").val("");
    } else {
      $("#waitlistForm_sendmessage").removeClass("show");
      $("#waitlistForm_errormessage").addClass("show");
      $('#waitlistForm_errormessage').html(msg);
    }
  });

  
  // Contact

  $('form.contactForm').submit(async function(e) {
    e.preventDefault();
    var f = $(this).find('.form-group')
    if (!validateForm(f)) return false;
    var data = {}; // $(this).serialize();
    $(this).serializeArray().map(x => { data[x.name] = x.value; });
    console.log("BODY TO SEND -> " + JSON.stringify(data));
    // 
    var res = await makeRequest("new_message", "POST", null, data);
    // alert(res); // OR WORK WITH res HOWEVER YOU LIKE ..
    if (res) {
      $("#contactForm_sendmessage").addClass("show");
      $("#contactForm_errormessage").removeClass("show");
      $('.contactForm').find("input, textarea").val("");
    } else {
      $("#contactForm_sendmessage").removeClass("show");
      $("#contactForm_errormessage").addClass("show");
      $('#contactForm_errormessage').html(msg);
    }
  });


});
