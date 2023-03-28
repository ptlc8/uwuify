const UwUify = function() {
	// Available items
	var items = [
		{asset:"assets/hearts-crown.png", x:27, y:27, w:[15,0,2.5], oX:0, oY:-2},
		{asset:"assets/blush.png", x:30, y:30, w:[15,0,1], oX:0, oY:0},
		{asset:"assets/fingers.png", x:8, y:8, w:[15,0,2], oX:0, oY:2},
		{asset:"assets/peach-blush.png", x:30, y:30, w:[15,0,.75], oX:0, oY:0},
		{asset:"assets/plant-crown.png", x:27, y:27, w:[15,0,1.5], oX:0, oY:-2},
		{asset:"assets/cyan-hearts-crown.png", x:27, y:27, w:[15,0,2.5], oX:0, oY:-2},
		{asset:"assets/yellow-flowers-crowns.png", x:27, y:27, w:[15,0,1], oX:0, oY:-2.5},
		{asset:"assets/sweat-drops.png", x:21, y:21, w:[15,0,1], oX:-.25, oY:-3.5},
		{asset:"assets/stars-halo.png", x:27, y:27, w:[15,0,2.5], oX:0, oY:-2.5},
		{asset:"assets/tumblr.png", x:27, y:27, w:[15,0,2], oX:0, oY:-1},
		{asset:"assets/uwu-ears.png", x:27, y:27, w:[15,0,1.25], oX:0, oY:-1.75},
		{asset:"assets/hamtaro.png", x:27, y:27, w:[15,0,.5], oX:0, oY:-4.2},
		{asset:"assets/narval.png", x:0, y:0, w:[15,0,1], oX:-1, oY:-1},
		{asset:"assets/rainbow-stars-blush.png", x:29, y:29, w:[15,0,.8], oX:0, oY:0}
	];

	// Loading process
	var loading = null;
	function load(onProgress = null) {
		var promises = [
			faceapi.nets.tinyFaceDetector.loadFromUri("models"),
			faceapi.nets.faceLandmark68Net.loadFromUri("models"),
			faceapi.nets.ssdMobilenetv1.loadFromUri("models")
		];
		var loadingProgress = 1;
		if (onProgress) {
			onProgress("Chargement 1/" + promises.length);
			for (let p of promises) {
				p.then(() => {
					onProgress("Chargement " + ++loadingProgress + "/" + promises.length);
				});
			}
		}
		return loading = Promise.all(promises);
	}
	
	// Return an array of random items indices
	function getRandomItems(amount) {
		return new Array(amount).fill(0).map(() => Math.floor(Math.random() * items.length))
	}

	// Uwuify canvas
	async function uwuify(cvs, { debug, selectedItems }) {
		if (loading == null) throw "Need to load UwUify";
		loading.then(async () => {
			var faces = await faceapi.detectAllFaces(cvs, new faceapi.TinyFaceDetectorOptions())
				.withFaceLandmarks();
			// display
			var ctx = cvs.getContext("2d");
			for (let face of faces) {
				if (debug) {
					console.log(face);
					for (const [i,pos] of Object.entries(face.landmarks.positions)) {
						ctx.fillStyle = "#66ff66";
						ctx.beginPath();
						ctx.rect(pos.x-1, pos.y-1, 2, 2);
						ctx.fill();
						ctx.fillText(i, pos.x, pos.y);
					}
				}
				if (!selectedItems) getRandomItems(5);
				for (let i of selectedItems) {
					let item = items[i];
					let img = new Image();
					img.src = item.asset;
					img.onload = () => {
						var w = item.w[2] * (face.landmarks.positions[item.w[0]].x - face.landmarks.positions[item.w[1]].x);
						var h = w * img.height / img.width;
						var x = (item.oX / 2 - .5) * w + face.landmarks.positions[item.x].x;
						var y = (item.oY / 2 - .5) * h + face.landmarks.positions[item.y].y;
						ctx.drawImage(img, x, y, w, h);
					}
				}
			}
		});
	}

	// Loading image in a canvas
	function loadImageFile(file, cvs) {
		return new Promise((resolve, reject) => {
			var fr = new FileReader();
			fr.onload = event => {
				var img = new Image();
				img.onload = () => {
					cvs.width = img.width;
					cvs.height = img.height;
					cvs.getContext("2d").drawImage(img, 0, 0);
					resolve();
				};
				img.src = event.target.result;
			};
			fr.readAsDataURL(file);
		});
	}
	
	return { load, uwuify, loadImageFile, items, getRandomItems }
}();
