var orientationToVector = [
	{x:0, y:0, z:-1, name:"Forward" },
	{x:0, y:0, z:1, name:"Backward" },
	{x:-1, y:0, z:0, name:"Left" },
	{x:1, y:0, z:0, name:"Right" },
	{x:0, y:-1, z:0, name:"Up" },
	{x:0, y:1, z:0, name:"Down" }
];
var blockTypes = [
	{ subtypeName:"", type:"" },
	{ subtypeName:"SmallBlockArmorBlock", type:"MyObjectBuilder_CubeBlock" },
	{ subtypeName:"SmallBlockArmorSlope", type:"MyObjectBuilder_CubeBlock" },
	{ subtypeName:"SmallBlockArmorCorner", type:"MyObjectBuilder_CubeBlock" },
	{ subtypeName:"SmallBlockArmorCornerInv", type:"MyObjectBuilder_CubeBlock" }
];

function Ship3D(name, xSize, ySize, zSize, scale) {
	this.name = name;
	this.scale = scale;
	this.xSize = xSize;
	this.ySize = ySize;
	this.zSize = zSize;
	this.blocks = new Array(xSize);
	for(var x = 0; x < xSize; x++) {
		this.blocks[x] = new Array(ySize);
		for(var y = 0; y < ySize; y++) {
			this.blocks[x][y] = new Array(zSize);
			for(var z = 0; z < zSize; z++) {
				this.blocks[x][y][z] = {};
				this.blocks[x][y][z].block = 0;
				this.blocks[x][y][z].forward = 0;
				this.blocks[x][y][z].up = 0;
				this.blocks[x][y][z].densityPosition = { x:x - Math.floor(xSize/2), y:y - Math.floor(ySize/2), z:z - Math.floor(zSize/2) };
				this.blocks[x][y][z].density = 0.0;
			}
		}
	}
	this.Apply = function(functor) {
		for(var x = 0; x < xSize; x++) {
			for(var y = 0; y < ySize; y++) {
				for(var z = 0; z < zSize; z++) {
					functor.Exec(this.blocks[x][y][z]);
				}
			}
		}
	};
	this.DensityToBlock = function(type) {
		for(var x = 0; x < xSize; x++) {
			for(var y = 0; y < ySize; y++) {
				for(var z = 0; z < zSize; z++) {
					if(this.blocks[x][y][z].density > 0.0 ) {
						this.blocks[x][y][z].density = 0.0;
						this.blocks[x][y][z].block = type;
					}
				}
			}
		}
	};
	this.ToBlueprint = function() {
		var data ="<?xml version=\"1.0\"?>\n" 
			+ "<Definitions xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n"
			+ "  <ShipBlueprints>\n"
			+ "    <ShipBlueprint>\n"
			+ "      <Id>\n"
			+ "        <TypeId>MyObjectBuilder_ShipBlueprintDefinition</TypeId>\n"
			+ "        <SubtypeId>" + this.name + "</SubtypeId>\n"
			+ "      </Id>\n"
			+ "      <DisplayName>shipgen</DisplayName>\n"
			+ "      <CubeGrids>\n"
			+ "        <CubeGrid>\n"
			+ "          <EntityId>199500361957648316</EntityId>\n"
			+ "          <PersistentFlags>CastShadows InScene</PersistentFlags>\n"
			+ "          <PositionAndOrientation>\n"
			+ "            <Position x=\"27.0\" y=\"6.0\" z=\"52.0\" />\n"
			+ "            <Forward x=\"-0\" y=\"-0\" z=\"-1\" />\n"
			+ "            <Up x=\"0\" y=\"1\" z=\"0\" />\n"
			+ "          </PositionAndOrientation>\n"
			+ "          <GridSizeEnum>" + (this.scale === "Small" ? "Small" : "Large") + "</GridSizeEnum>\n"
			+ "          <CubeBlocks>\n";
		
		for(var x = 0; x < xSize; x++) {
			for(var y = 0; y < ySize; y++) {
				for(var z = 0; z < zSize; z++) {
					if(this.blocks[x][y][z].block > 0 ) {
						  data += "            <MyObjectBuilder_CubeBlock xsi:type=\"" + blockTypes[this.blocks[x][y][z].block].type + "\">\n"
						  + "              <SubtypeName>" + blockTypes[this.blocks[x][y][z].block].subtypeName + "</SubtypeName>\n"
						  + "              <Min x=\"" + z + "\" y=\"" + y + "\" z=\"" + x + "\" />\n"
						  + "              <ColorMaskHSV x=\"0\" y=\"-0.95\" z=\"0.4\" />\n"
						  + "            </MyObjectBuilder_CubeBlock>\n";
					}
				}
			}
		}
		
		data += "          </CubeBlocks>\n"
 			+ "          <DisplayName>" + this.name + "</DisplayName>\n"
			+ "          <DestructibleBlocks>true</DestructibleBlocks>\n"
			+ "          <CreatePhysics>" + (this.scale === "Station" ? "false" : "true") + "</CreatePhysics>\n"
			+ "          <EnableSmallToLargeConnections>false</EnableSmallToLargeConnections>\n"
			+ "        </CubeGrid>\n"
			+ "      </CubeGrids>\n"
			+ "      <WorkshopId>0</WorkshopId>\n"
			+ "      <OwnerSteamId>0</OwnerSteamId>\n"
			+ "      <Points>0</Points>\n"
			+ "    </ShipBlueprint>\n"
			+ "  </ShipBlueprints>\n"
			+ "</Definitions>";	
			
		return data;
	};
};

//////////////////////////////////////////////////////////////
// Functors
function distanceSq(a, b) {
	return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y) + (a.z - b.z)*(a.z - b.z);
};
function distance(a, b) {
	return Math.sqrt(distanceSq(a, b));
};

function SphereFunctor( center, radius ) {
	this.center = center;
	this.radius = radius;
	this.Exec = function( block ) {
		if( distanceSq(this.center, block.densityPosition) < (this.radius * this.radius) ) {
			block.density += 1.0;
		} else {
			block.density -= 1.0;
		}
	};
};

function Ribbing( length, gap, offset ) {
	this.length = length;
	this.gap = gap;
	this.offset = offset;
	// axis
	this.Exec = function( block ) {
		if(Math.abs(block.densityPosition.x % (this.length + this.gap)) < this.length ) {
			block.densityPosition.y *= this.offset;
			block.densityPosition.z *= this.offset;
		}
	};
};

function MergeShip(otherShip, offset) {
	this.otherShip = otherShip;
	this.offset = offset;
	this.Exec = function( block ) {
	}
};


