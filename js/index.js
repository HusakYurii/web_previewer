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
			if(!Array.isArray(selectors)){ console.warn('"cacheElements" receives only an array object'); return; };
			if(selectors.length === 0){ console.warn('There are no arguments passed'); return; };
			
			const res = selectors.some((selector) => typeof selector !== 'string');
			if(res) { console.warn('A value must be a type of string'); return; }

			selectors.forEach(addToCache);

			function addToCache(selector) {
				const words = selector.match(/\w*/gi).filter((el)=> el !== '');
				
				const collection = [];
				collection.push(words.shift());

				if(words.length >= 1){
					words.reduce((collect ,word) => {
						collect.push(transform(word));
						return collect;
					}, collection);
				}

				MNG.cached[collection.join("")] = document.querySelector(selector);
			}

			function transform(string) {
				let char = string.slice(0, 1).toUpperCase();
			 	return string.replace(/^\w/,char);
			}
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
			({ w, h, isRotatable } = config);
			//save these parameters as current
			MNG.current = {w, h, isRotatable};
		}else{
			//if the resize occures the current parameters will be used
			({ w, h, isRotatable } = MNG.current);
		};

		let { clientHeight: headerH } = MNG.cached.header;
		let { innerHeight: windowH,  innerWidth: windowW } = window;

		let minSize = Math.min( (windowH - headerH - windowH * 0.15), (windowW - 50) );
		if(!isRotatable){ minSize = windowW - windowW * 0.35;};

		let {phoneIframe, phone}  = MNG.cached;
		
		let phoneWidth = (MNG.rotate && isRotatable) ? h : w;
		let phoneHeight = (MNG.rotate && isRotatable) ? w: h;

		let scl = Math.min(1,  minSize / phoneWidth , minSize / phoneHeight);
		phoneIframe.style.width = phoneWidth + "px";
		phoneIframe.style.height = phoneHeight + "px";
		phone.style.transform = "scale(0,0)";
		phone.style.transform = "scale(" + scl + "," + scl + ")";

		let { dimentionsWidth: inputW, dimentionsHeight: inputH} = MNG.cached;
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
