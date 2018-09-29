'use strict';

(function () {
	const CONFIG = {
		elementsToCache: ["header", "#updateIcon" , "#url", "#menu",
							"#closeMenu", "main", ".shader", ".phone-wrapper",
					  	   ".phone",".phone > iframe",
					  		".dimentions #width", ".dimentions #height",
					  		"#button" ],

		models: [{name:"Galaxy-S5", isRotatable:true, w:360 ,h:640},
				{name:"Pixel-2", isRotatable:true, w:411 ,h:731},
				{name:"Pixel-2XL", isRotatable:true, w:411 ,h:823},
				{name:"iPhone-5/SE", isRotatable:true, w:320 ,h:568},
				{name:"iPhone-6/7/8", isRotatable:true, w:375 ,h:667},
				{name:"iPhone-6/7/8-Plus", isRotatable:true, w:414 ,h:736},
				{name:"iPhone-X", isRotatable:true, w:375 ,h:812},
				{name:"iPad", isRotatable:true, w:768 ,h:1024},
				{name:"iPad-Pro", isRotatable:true, w:1024 ,h:1366},
				{name:"Laptop-HD", isRotatable:false, w:1366 ,h:768},
				{name:"Laptop-HD+", isRotatable:false, w:1600 ,h:900},
				{name:"Desctop-Full-HD", isRotatable:false, w:1920 ,h:1080}], 
	};

	const MNG = {
		cached: {},
		rotate: false,
		clickable: false,
		current: {},
	};

	Object.defineProperty(MNG, 'cacheElements', {
		get: function() {
			return MNG.cached;
		},
		set: function (selectors) {
			if(!selectors.forEach){ console.warn('"cacheElements" receives only an array object'); return;};
			if(selectors.length === 0){console.warn('There are no arguments passed'); return;};
			for(let i = 0; i < selectors.length; i++){
				if(typeof selectors[i] !== 'string'){ console.warn('A value must be a type of string'); return;};
			};

			for(let selector = 0; selector < selectors.length; selector++){

				let matched = selectors[selector].match(/\w*/gi);
				let	words = matched.filter((el)=> el !== '');

				let temp = [];
					temp.push(words[0]);

					if(words.length > 1){
						for(let word = 1; word < words.length; word++){
							let char = words[word].slice(0, 1).toUpperCase();
							temp.push( words[word].replace(/./,char) );
						};
					};

				let	elementName = temp.join('');
					MNG.cached[elementName] = document.querySelector(selectors[selector]);
			};
		},
		enumerable: false,
		configurable: false
	});


	MNG.toggleClass = function(element, clas) {

		let classList = element.className;
		let result = classList.indexOf(clas);

		if(result === -1){
			classList += ' '+ clas;
		}else{
			classList = classList.replace(clas,'').replace(' ','');
		};
		element.setAttribute('class', classList);
	};

	MNG.hasClass = function(element, clas) {
		let classList = element.className;
		let result = classList.indexOf(clas);
		return (result === -1) ? false : true;
	};

	MNG.updatePhoneSize = function (config) {
		//if(window.innerWidth <= 360){return;};
		if(window.innerWidth <= 640){return;};

		let w, h, isRotatable;

		if(config){
			w = config.w;
			h = config.h;
			isRotatable = config.isRotatable;
			//save these parameters as current
			MNG.current.w = w;
			MNG.current.h = h;
			MNG.current.isRotatable = isRotatable;
		}else{
			//if the resize occures the current parameters will be used
			w = MNG.current.w;
			h = MNG.current.h;
			isRotatable = MNG.current.isRotatable;
		};

		let headerHeight = MNG.cached.header.clientHeight;

		let minSize = Math.min( (window.innerHeight - headerHeight - window.innerHeight * 0.15), (window.innerWidth - 50) );
		if(!isRotatable){minSize = window.innerWidth - window.innerWidth * 0.35;};

		let phoneIframe = MNG.cached.phoneIframe,
			phone = MNG.cached.phone,
			phoneWidth, 
			phoneHeight;
		
		if(MNG.rotate && isRotatable){
			phoneWidth = h;
			phoneHeight = w;
		}else{
			phoneWidth = w;
			phoneHeight = h;
		};

		let scl = Math.min(1,  minSize / phoneWidth , minSize / phoneHeight);
			phoneIframe.style.width = phoneWidth + "px";
			phoneIframe.style.height = phoneHeight + "px";
			phone.style.transform = "scale(0,0)";
			phone.style.transform = "scale(" + scl + "," + scl + ")";

		let inputW = MNG.cached.dimentionsWidth,
			inputH = MNG.cached.dimentionsHeight;

			inputW.value = phoneWidth;
			inputH.value = phoneHeight;
	};

	MNG.onAnchorClick = function (event) {
		if(!MNG.clickable){return;};

		event.preventDefault();

		let anchor = this.querySelector('a'),
			name = anchor.getAttribute('id'),
			config;

		for(let model = 0; model < CONFIG.models.length; model++){
			if(CONFIG.models[model].name === name){
				config = CONFIG.models[model];
				break;
			};
		};

		MNG.updatePhoneSize(config);
	};

	MNG.onUpdateIconClick = function () {
		if(!MNG.clickable){return;};

		let url = MNG.cached.url.value;
		let iframe = MNG.cached.phoneIframe;
			iframe.src = url; //+ "?" + Math.random();
			MNG.updatePhoneSize();
	};

	MNG.onRotateButtonClick = function () {
		if(!MNG.clickable){return;};
		if(!MNG.current.isRotatable){return;};

		if(MNG.rotate){
			MNG.rotate = false;
		}else{
			MNG.rotate = true;
		};
		
		let phone = MNG.cached.phone;
		MNG.toggleClass(phone, "lanscape");

		MNG.updatePhoneSize();
	};


	MNG.hangEventListeners = function () {
		let liArr = document.getElementsByTagName('li');

		for(let li = 0; li < liArr.length; li++){
			liArr[li].addEventListener('click', MNG.onAnchorClick);
		};

		let updateIcon = MNG.cached.updateIcon;
			updateIcon.addEventListener('click', MNG.onUpdateIconClick);

		let button = MNG.cached.button;
			button.addEventListener('click', MNG.onRotateButtonClick);

		let menu = MNG.cached.menu;
			menu.addEventListener('click', MNG.toggleSettingsBar);

		let closeMenu = MNG.cached.closeMenu;
			closeMenu.addEventListener('click', MNG.toggleSettingsBar);
		let shader = MNG.cached.shader;
			shader.addEventListener('click', MNG.toggleSettingsBar);
	};

	MNG.onWindowLoad = function () {
		MNG.cacheElements = CONFIG.elementsToCache;
		
		MNG.updatePhoneSize(CONFIG.models[0]);
		MNG.hangEventListeners();
		MNG.clickable = true;
	};

	MNG.toggleSettingsBar = function () {
		if(!MNG.clickable){return;};

		MNG.toggleClass(MNG.cached.main, "disabled");
		MNG.toggleClass(MNG.cached.shader, "hidden")
	};

	MNG.onWindowResize = function() {
		MNG.updatePhoneSize();
	};

	window.addEventListener("load", MNG.onWindowLoad);
	window.addEventListener("resize", MNG.onWindowResize);

})();
