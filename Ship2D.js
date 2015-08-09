
var pixelTypes = [
	"Blank",
	"Hull",
	"Windows",
	"Wings",
	"Fins",
	"Nacelles"
];

function Pixel(x, y) {
	this.x = x;
	this.y = y;
	this.type = 0;
}

function Ship2D(name, xSize, ySize, scale, pixels) {
	this.name = name;
	this.xSize = xSize;
	this.ySize = ySize;
	this.scale = scale;
	this.pixels = pixels;	
	
	this.ConvertTo3D = function(style) {
		var ship3D = new Ship3D( this.name, this.ySize, this.ySize, this.xSize, this.scale );
		var zOffset = Math.floor( this.ySize / 2 );

		for(var x = 0; x < this.xSize; x++ ) {
			for(var y = 0; y < this.ySize; y++) {
				if(pixels[x][y].type > 0) {
					ship3D.blocks[zOffset][y][x].block = 1;
				}
			}
		}
		if( style === "organic" ) {
			var tempPixels = new Array(2);
			for(var b = 0; b < 2; b++) {
				tempPixels[b] = new Array(this.xSize);
				for (var x = 0; x < this.xSize; x++) {
					tempPixels[b][x] = new Array(this.ySize);
					for (var y = 0; y < this.ySize; y++) {
						tempPixels[b][x][y] = pixels[x][y].type > 0;
					}
				}
			}
			var z = 0;
			var b = 0;
			var workDone = true;
			while(workDone) {
				z += 1;
				workDone = false;
				for(var x = 0; x < this.xSize; x++ ) {
					for(var y = 0; y < this.ySize; y++) {
						if(x == 0 || x == this.xSize-1 || y == 0 || y == this.ySize-1) {
							tempPixels[b][x][y] = false;
						}
						else if(!tempPixels[1-b][x-1][y] || !tempPixels[1-b][x+1][y] || !tempPixels[1-b][x][y-1] || !tempPixels[1-b][x][y+1]) {
							tempPixels[b][x][y] = false;
						}
						else if(tempPixels[b][x][y]) {
							ship3D.blocks[zOffset+z][y][x].block = 1;
							ship3D.blocks[zOffset-z][y][x].block = 1;
							workDone = true;
						}
					}
				}
				b = 1 - b;
			} 
		}
		return ship3D;
	};
}
