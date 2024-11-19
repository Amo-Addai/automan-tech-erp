(function ($) {
  "use strict";
	
	// IMAGES TO UPDATE - logo-*, about-*, agent-*, author-*, mini-testimonial-*, plan*, 
	// post-*, post-single-*, property-*, slide-*, slide-about-*, testimonial-*, 

	// FOR STARTERS, HAVE ALL data OVER HERE, AND STORED WITHIN THE WINDOW'S LOCAL STORAGE ..
	var data = {

		limits: {
			latestProperties: 5
		},

		properties: [
			{
				name: "Residential Apartment",
				details: "Residential Apartment located in Abelemkpe Street 20, East Legon - Accra, in the Greater Accra Region of Ghana. \
				Currently being analyzed, using our stringent Due-Diligence process, and will soon be ready for investments.",
				type: "Residential",
				stage: "Initiation",
				investment_strategy: "Value-Added",
				
				data: {
					"property_details": {
						"name": {
							"full_name": "Residential Apartment in Accra Ghana",
							"nickname": ""
						},
						"type": {
							"type": "Residential",
							"sub_type": "Residential Apartment"
						},
						"type": {
							"type": "Multi-Family",
							"sub_type": "Apartments"
						},
						"shares": {
							"total": 100,
							"available": 0,
							"share_price": 1
						},
						"parameters": {
							"area": {
								"value": 240,
								"unit": "square metres"
							},
							"beds": 4,
							"baths": 4,
							"garages": 1,
							"amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck", 
							"Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
						},
						"location": {
							"country" : "Ghana", 
						    "region" : "Greater Accra",
							"city" : "Accra",
							"town" : "East Legon",
							"street" : "Abelemkpe St",
							"number" : "20",
							"address" : "Abelemkpe St 20, East Legon - Accra, Ghana",
							"zip" : "",
							"postal" : "",
							"geolocation" : {
								"lat" : 0, "lng" : 0
							}
						},
						"content": {
							"images": {
								"slides": [
									{ stub: "slide-1", format: "jpg" }
								],
								"pictures": [
									{ stub: "property-1", format: "jpg" }, 
									{ stub: "property-2", format: "jpg" }, 
									{ stub: "property-3", format: "jpg" }
								],
								"plans": []
							},
							"videos": {},
							"documents": {}
						}
					},
					"investment_analysis": {
						"irr": 10,
						"yield": 15,
						"cmult": 2.5
					},
					"valuation": {
							
						"value": {
							value: 100, currency: "USD"
						},
						"price": {
							price: 120, currency: "USD"
						},
					},
					"returns": {
	
					},
				},

				waitlist: {
					"Prospects": [],
					"Investors": []
				},
				asset: "",
				project: "",				
				investments: [],
				employees: [],
				property_developers: [],
				investors: [],
			},
			{
				name: "Office Building",
				details: "Commercial Real Estate Office Building located in Banana Street 20, Lagos in Nigeria. \
				Currently being analyzed, using our stringent Due-Diligence process, and will soon be ready for investments.",
				type: "Commercial",
				stage: "Initiation",
				investment_strategy: "Value-Added",
				
				data: {
					"property_details": {
						"name": {
							"full_name": "Office Building in Lagos, Nigeria",
							"nickname": ""
						},
						"type": {
							"type": "Commercial",
							"sub_type": "Office Rental"
						},
						"shares": {
							"total": 100,
							"available": 0,
							"share_price": 1
						},
						"parameters": {
							"area": {
								"value": 240,
								"unit": "square metres"
							},
							"beds": 4,
							"baths": 4,
							"garages": 1,
							"amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck", 
							"Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
						},
						"location": {
							"country" : "Nigeria", 
						    "region" : "Lagos",
							"city" : "Lagos",
							"town" : "Lagos",
							"street" : "Banana Street",
							"number" : "20",
							"address" : "Banana Street 20, Lagos - Lagos, Nigeria",
							"zip" : "",
							"postal" : "",
							"geolocation" : {
								"lat" : 0, "lng" : 0
							}
						},
						"content": {
							"images": {
								"slides": [
									{ stub: "slide-2", format: "jpg" }
								],
								"pictures": [
									{ stub: "property-4", format: "jpg" }, 
									{ stub: "property-5", format: "jpg" }, 
									{ stub: "property-6", format: "jpg" }
								],
								"plans": []
							},
							"videos": {},
							"documents": {}
						}
					},
					"investment_analysis": {
						"irr": 10,
						"yield": 15,
						"cmult": 2.5
					},
					"valuation": {
							
						"value": {
							value: 100, currency: "USD"
						},
						"price": {
							price: 120, currency: "USD"
						},
					},
					"returns": {
	
					},
				},

				waitlist: {
					"Prospects": [],
					"Investors": []
				},
				asset: "",
				project: "",				
				investments: [],
				employees: [],
				property_developers: [],
				investors: [],
			},
			{
				name: "Star Heights",
				details: "Multi-Family Real Estate Property located in Lagos Avenue 30, Takoradi in the Western Region of Ghana. \
				Currently being analyzed, using our stringent Due-Diligence process, and will soon be ready for investments.",
				type: "Multi-Family",
				stage: "Initiation",
				investment_strategy: "Value-Added",
				
				data: {
					"property_details": {
						"name": {
							"full_name": "StarBoy Real Estate Property",
							"nickname": ""
						},
						"type": {
							"type": "Multi-Family",
							"sub_type": "Apartments"
						},
						"shares": {
							"total": 100,
							"available": 0,
							"share_price": 1
						},
						"parameters": {
							"area": {
								"value": 240,
								"unit": "square metres"
							},
							"beds": 4,
							"baths": 4,
							"garages": 1,
							"amenities": ["Balcony", "Outdoor Kitchen", "Cable Tv", "Deck", 
							"Tennis Courts", "Internet", "Parking", "Sun Room", "Concrete Floor"]
						},
						"location": {
							"country" : "Ghana", 
						    "region" : "Western",
							"city" : "Takoradi",
							"town" : "Takoradi",
							"street" : "Lagos Avenue",
							"number" : "30",
							"address" : "Lagos Avenue 30, Takoradi - Takoradi, Ghana",
							"zip" : "",
							"postal" : "",
							"geolocation" : {
								"lat" : 0, "lng" : 0
							}
						},
						"content": {
							"images": {
								"slides": [
									{ stub: "slide-3", format: "jpg" }
								],
								"pictures": [
									{ stub: "property-7", format: "jpg" }, 
									{ stub: "property-8", format: "jpg" }, 
									{ stub: "property-9", format: "jpg" }
								],
								"plans": []
							},
							"videos": {},
							"documents": {}
						}
					},
					"investment_analysis": {
						"irr": 10,
						"yield": 15,
						"cmult": 2.5
					},
					"valuation": {
							
						"value": {
							value: 100, currency: "USD"
						},
						"price": {
							price: 120, currency: "USD"
						},
					},
					"returns": {
	
					},
				},

				waitlist: {
					"Prospects": [],
					"Investors": []
				},
				asset: "",
				project: "",				
				investments: [],
				employees: [],
				property_developers: [],
				investors: [],
			},
		]

	};

	//	FIRST, HAVE A STANDARD content OBJECT TO BE USED WITHIN THE ENTIRE WEBSITE
	var content = {
		// FOR THE SEARCH FORM ..
		propertyTypes: [
			{"text": "All Types", "value": ""},
			{"text": "For Sale", "value": ""}, 
			{"text": "For Rent", "value": ""}, 
			{"text": "For Investment", "value": ""}, 
			{"text": "Open House", "value": ""},
		],
		countries: [
			{"text": "Ghana", "value": ""},
			{"text": "Nigeria", "value": ""},
		],
		cities: [
			{"text": "Accra", "value": ""},
			{"text": "Tema", "value": ""},
			{"text": "Kumasi", "value": ""},
			{"text": "Cape Coast", "value": ""},
		],
		prices: [
			{"text": "Unlimited", "value": ""},
			{"text": "$50,000", "value": ""},
			{"text": "$100,000", "value": ""},
			{"text": "$150,000", "value": ""},
			{"text": "$200,000", "value": ""},
		],

		/////////////////////////////////////////////////////////////////////////////
		// INDEX PAGE CONTENT property-carousel
		carouselContent: [],


	};


  // Preloader
  $(window).on('load', function () {
    if ($('#preloader').length) {
      $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).remove();
      });
    }
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function(){
    $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
    return false;
  });
  
	var nav = $('nav');
	var navHeight = nav.outerHeight();

	// ASSIGN active CLASS TO THE CURRENT NAV-PAGE
	function setActiveNavPage(){
		$('a .nav-link').removeClass("active");
		var currentURL = window.location.pathname;
		if(currentURL === "/") currentURL = "/index";
		// console.log("CURRENT URL -> " + currentURL);
		for(var p of ["index", "about", "services", "properties", "blogposts", "contact"]){
			if(currentURL.includes(p)){
				$('#'+p+'-nav-link').addClass("active");
				break;
			} 
		} // IF CODE REACHES HERE, THEN IT'S THE SPECIAL CASES
	}
	setActiveNavPage();

	/*--/ ScrollReveal /Easy scroll animations for web and mobile browsers /--*/
	window.sr = ScrollReveal();
	sr.reveal('.foo', { duration: 1000, delay: 15 });

	
	function setupIndexUI(){
			
		//	SEARCH SIDE-NAV BAR

		var mapIdToContent = {
			"type": content.propertyTypes, "country": content.countries, "city": content.cities, "price": content.prices,
		}
		for(var k in mapIdToContent) {
			$.each(mapIdToContent[k], function (i, item) {
				$("select#"+k).append(new Option(item.text, item.value));
			}); // OR YOU CAN RATHER USE THIS INSTEAD .. 
			// $.each(mapIdToContent[k], function (i, item) {
			//   $("select#"+k).append($('<option>', { 
			//       value: item.value,
			//       text : item.text 
			//   }));
			// });
		}
	
		// CAROUSEL SECTION - GETTING DATA FOR CAROUSEL CONTENT ..
	
		if(data && data.properties && data.properties.length > 0){
			var carI = 0, property = null; 
			for(carI = 0; carI < data.limits.latestProperties; carI++){
				try {
					property = data.properties[carI];
					if(!property || (property == undefined)) continue;
					// 
					$("#carousel").append(' \
					<div class="carousel-item-a intro-item bg-image" style="background-image: url(img/' + 
					property.data.property_details.images[0].stub + '.' + property.data.property_details.images[0].format + ')"> \
						<div class="overlay overlay-a"></div> \
						<div class="intro-content display-table"> \
							<div class="table-cell"> \
								<div class="container"> \
									<div class="row"> \
										<div class="col-lg-8"> \
											<div class="intro-body"> \
												<p class="intro-title-top">' + property.data.property_details.location.town + ', ' + 
												property.data.property_details.location.city + ' - ' + property.data.property_details.location.country + ' \
												<br> 78345</p>  \
												<h1 class="intro-title mb-4"> \
													<span class="color-b">204 </span> ' + property.name + ' \
													<br> ' + property.data.property_details.location.street + ' ' + property.data.property_details.location.number + ' </h1> \
												<p class="intro-subtitle intro-price"> \
													<a href="property?id=' + property._id + '"><span class="price-a price-a-hover">View More</span></a> \
												</p> \
											</div> \
										</div> \
									</div> \
								</div> \
							</div> \
						</div> \
					</div> \
					');
				} catch (e){
					console.log("ERROR -> " + JSON.stringify(e));
					continue;
				}
			}
		}


		//	LATEST PROPERTY SECTION - GETTING DATA FOR CAROUSEL CONTENT ..
		
		if(data && data.properties && data.properties.length > 0){
			var pI = 0, property = null, propertyUnit = '', 
			propertyInfo = ' \
				<div class="price-box d-flex"> \
					<span class="price-a">Coming Soon</span> \
				</div> \
			'; 
			// 
			for(pI = 0; pI < data.properties.length; pI++){
				try {
					if(pI == data.limits.latestProperties) break;
					property = data.properties[pI];
					if(!property || (property == undefined)) continue;
					
					// 1ST, HANDLE SOME STUFF HERE ..
					switch(property.data.property_details.parameters.area.unit){
						case "square metres": 
							propertyUnit = 'm<sup>2</sup>';
							break;
						default:
							propertyUnit = '';
					}

					if(property.data.property_details.shares.available > 0){
						console.log("\nPROPERTY -> " + JSON.stringify(property));
						propertyInfo = ' \
						<div class="price-box d-flex"> \
							<span class="price-a">' + property.data.property_details.shares.available + ' shares available</span> \
						</div> \
						';
					}
					// 
					$("#property-carousel").append(' \
					<div class="carousel-item-b"> \
						<div class="card-box-a card-shadow"> \
							<div class="img-box-a"> \
								<img src="../img/' + property.data.property_details.images[1].stub + '.' + property.data.property_details.images[1].format + '" alt="" class="img-a img-fluid"> \
							</div> \
							<div class="card-overlay"> \
								<div class="card-overlay-a-content"> \
									<div class="card-header-a"> \
										<p class="card-title-top">' + property.data.property_details.location.town + ', ' + 
										property.data.property_details.location.city + ' - ' + property.data.property_details.location.country + '</p> \
										<h2 class="card-title-a"> \
											<a href="property">' + property.name + ' \
											<br /> ' + property.data.property_details.location.street + ' ' + property.data.property_details.location.number + ' </a> \
										</h2> \
									</div> \
									<div class="card-body-a"> \
										' + propertyInfo + ' \
										<a href="property?id=' + property._id + '" class="link-a">Click here to view \
											<span class="ion-ios-arrow-forward"></span> \
										</a> \
									</div> \
									<div class="card-footer-a"> \
										<ul class="card-info d-flex justify-content-around"> \
											<li> \
											<h4 class="card-info-title">Yield</h4> \
											<span>' + property.data.investment_analysis.yield + '%</span> \
											</li> \
											<li> \
											<h4 class="card-info-title">IRR</h4> \
											<span>' + property.data.investment_analysis.irr + '%</span> \
											</li> \
											<li> \
											<h4 class="card-info-title">Cash Multiple</h4> \
											<span>' + property.data.investment_analysis.cmult + 'x</span> \
											</li> \
										</ul> \
									</div> \
								</div> \
							</div> \
						</div> \
					</div> \
					');
				} catch (e){
					console.log("ERROR -> " + JSON.stringify(e));
					continue;
				}
			}
		}
		
	}
	// setupIndexUI();
	 

	/*--/ Carousel owl /--*/
	$('#carousel').owlCarousel({
		loop: true,
		margin: -1,
		items: 1,
		nav: true,
		navText: ['<i class="ion-ios-arrow-back" aria-hidden="true"></i>', '<i class="ion-ios-arrow-forward" aria-hidden="true"></i>'],
		autoplay: true,
		autoplayTimeout: 3000,
		autoplayHoverPause: true
	});

	/*--/ Animate Carousel /--*/
	$('.intro-carousel').on('translate.owl.carousel', function () {
		$('.intro-content .intro-title').removeClass('zoomIn animated').hide();
		$('.intro-content .intro-price').removeClass('fadeInUp animated').hide();
		$('.intro-content .intro-title-top, .intro-content .spacial').removeClass('fadeIn animated').hide();
	});

	$('.intro-carousel').on('translated.owl.carousel', function () {
		$('.intro-content .intro-title').addClass('zoomIn animated').show();
		$('.intro-content .intro-price').addClass('fadeInUp animated').show();
		$('.intro-content .intro-title-top, .intro-content .spacial').addClass('fadeIn animated').show();
	});

	/*--/ Navbar Collapse /--*/
	$('.navbar-toggle-box-collapse').on('click', function () {
		$('body').removeClass('box-collapse-closed').addClass('box-collapse-open');
	});
	$('.close-box-collapse, .click-closed').on('click', function () {
		$('body').removeClass('box-collapse-open').addClass('box-collapse-closed');
		$('.menu-list ul').slideUp(700);
	});

	/*--/ Navbar Menu Reduce /--*/
	$(window).trigger('scroll');
	$(window).bind('scroll', function () {
		var pixels = 50;
		var top = 1200;
		if ($(window).scrollTop() > pixels) {
			$('.navbar-default').addClass('navbar-reduce');
			$('.navbar-default').removeClass('navbar-trans');
		} else {
			$('.navbar-default').addClass('navbar-trans');
			$('.navbar-default').removeClass('navbar-reduce');
		}
		if ($(window).scrollTop() > top) {
			$('.scrolltop-mf').fadeIn(1000, "easeInOutExpo");
		} else {
			$('.scrolltop-mf').fadeOut(1000, "easeInOutExpo");
		}
	});

	/*--/ Property owl /--*/
	$('#property-carousel').owlCarousel({
		loop: true,
		margin: 30,
		responsive: {
			0: {
				items: 1,
			},
			769: {
				items: 2,
			},
			992: {
				items: 3,
			}
		}
	});

	/*--/ Property owl owl /--*/
	$('#property-single-carousel').owlCarousel({
		loop: true,
		margin: 0,  
		nav: true,
		navText: ['<i class="ion-ios-arrow-back" aria-hidden="true"></i>', '<i class="ion-ios-arrow-forward" aria-hidden="true"></i>'],
		responsive: {
			0: {
				items: 1,
			}
		}
	});

	/*--/ News owl /--*/
	$('#new-carousel').owlCarousel({
		loop: true,
		margin: 30,
		responsive: {
			0: {  
				items: 1,
			},
			769: {
				items: 2,
			},
			992: {
				items: 3,
			}
		}
	});

	/*--/ Testimonials owl /--*/
	$('#testimonial-carousel').owlCarousel({
		margin: 0,
		autoplay: true,
		nav: true,
		loop: true,
		animateOut: 'fadeOut',
		animateIn: 'fadeInUp',
		navText: ['<i class="ion-ios-arrow-back" aria-hidden="true"></i>', '<i class="ion-ios-arrow-forward" aria-hidden="true"></i>'],
		autoplayTimeout: 4000,
		autoplayHoverPause: true,
		responsive: {
			0: {
				items: 1,
			}
		}
	});



})(jQuery);
