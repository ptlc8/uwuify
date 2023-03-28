const UwUify = function() {
	// Available items
	var items = [
		{asset:"assets/hearts-crown.png", x:27, y:27, w:[15,0,2.5], oX:0, oY:-2},
		{asset:"assets/blush.png", x:30, y:30, w:[15,0,1], oX:0, oY:0},
		{asset:"assets/fingers.png", x:8, y:8, w:[15,0,2], oX:0, oY:2}
	];

	// Loading process
	var loading = null;
	function load() {
		var promises = [
			faceapi.nets.tinyFaceDetector.loadFromUri("models"),
			faceapi.nets.faceLandmark68Net.loadFromUri("models"),
			faceapi.nets.ssdMobilenetv1.loadFromUri("models")
		];
		var loadingProgress = 1;
		document.getElementById("loading").innerText = "Chargement 1/" + promises.length;
		for (let p of promises) {
			p.then(() => {
				document.getElementById("loading").innerText = "Chargement " + ++loadingProgress + "/" + promises.length
			});
		}
		loading = Promise.all(promises).then(() => {
			var loadingIndicator = document.getElementById("loading");
			loadingIndicator.parentElement.removeChild(loadingIndicator);
		});
	}

	// Uwuify canvas
	async function uwuify(cvs, debug=false) {
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
					}
				}
				for (let i of items) {
					let img = new Image();
					img.src = i.asset;
					img.onload = () => {
						var w = i.w[2] * (face.landmarks.positions[i.w[0]].x - face.landmarks.positions[i.w[1]].x);
						var h = w * img.height / img.width;
						var x = (i.oX / 2 - .5) * w + face.landmarks.positions[i.x].x;
						var y = (i.oY / 2 - .5) * h + face.landmarks.positions[i.y].y;
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
	
	return { load, uwuify, loadImageFile }
}();
