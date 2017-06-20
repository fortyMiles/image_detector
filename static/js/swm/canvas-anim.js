/**
 * 3D Funky Internet Animation Thing
 * (C) Silktide 2014
 *
 * By Oliver Emberton and Doug Nelson.
 */

/**
 * Add browser-agnostic support for requestAnimationFrame
 */
(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());


window.canvasAnimInnerWidth = document.body.clientWidth;


/**
 * Full-screen canvas
 */
function Canvas(id) {
  this.hide = false;
  this.canvas = document.getElementById(id);
  this.context = this.canvas.getContext("2d");

  this.canvas.setAttribute("width", window.innerWidth);
  this.canvas.setAttribute("height", window.innerHeight - 50);

  this.width = this.canvas.width;
  this.height = this.canvas.height;
}

Canvas.prototype.getContext = function() {
  return this.context;
}

Canvas.prototype.resetCanvas = function() {
  this.context.clearRect(0, 0, this.width, this.height);
}

/**
 * Helper for converting between degrees and radians
 */
function Degree(angle) {
  if (angle !== undefined)
    this.set(angle % 360);
}

Degree.prototype.set = function(angle) {
  this.value = angle * (Math.PI / 180);
}

Degree.prototype.get = function() {
  return this.value;
}

Degree.prototype.getAsAngle = function() {
  return this.value * (180 / Math.PI);
}

Degree.prototype.valueOf = function() {
  return this.value;
}

/**
 * A single point in our model. Each point is stored as a polar co-ordinate,
 * making later transformations around the axis trivial.
 */
function Point(azimuth, elevation, radius, pulseSpeed, pulseAmplitude, canLink) {
  this.points = [];

  if (!this.azimuth instanceof Degree)
    alert("Azimuth isn't a degree");

  if (!this.elevation instanceof Degree)
    alert("Elevation isn't a degree");

  this.visible = true;
  this.azimuth = azimuth;
  this.elevation = elevation;
  this.radius = radius;
  this.pulseSpeed = pulseSpeed;
  this.pulseAmplitude = pulseAmplitude;
  this.canLink = canLink;
  this.link = false;
}

/**
 * Our 3D world, including the rotation of the world
 * (azimuth, elevation) and camera position (x, y, z).
 *
 * The camera position is set initially, subsequently we only
 * ever set the *target* camera position, which we move
 * smoothly towards.
 */
function World(Canvas, azimuth, elevation, x, y, z) {
  this.azimuth = new Degree(azimuth);
  this.elevation = new Degree(elevation);
  this.x = x;
  this.y = y;
  this.z = z;
  this.tx = x;
  this.ty = y;
  this.tz = z;
  this.points = [];
  this.canvas = Canvas;
}

World.prototype.setAngle = function(azimuth, elevation) {
  this.azimuth = new Degree(azimuth);
  this.elevation = new Degree(elevation);
}

World.prototype.setCameraTargetPosition = function(x, y, z) {
  this.tx = x;
  this.ty = y;
  this.tz = z;
}

World.prototype.moveCameraToTarget = function() {
  this.x -= (this.x - this.tx) * 0.1;
  this.y -= (this.y - this.ty) * 0.1;
  this.z -= (this.z - this.tz) * 0.1;
}

World.prototype.addPoint = function(point) {
  this.points.push(point);
}

/**
 * Make the connections between points randomly change on and off.
 */
World.prototype.twinkleLinks = function() {
  for (var i = 0; i < this.points.length; i++) {
    var point = this.points[i];

    var probability = 0.99;

    if (firstFrame)
      probability = 0.4;

    if (point.canLink && Math.random() > probability) {
      var r = Math.random();
      if (r > 0.8)
        point.link = 'y';
      else if (r > 0.6)
        point.link = 'x';
      else
        point.link = false;
    }
  }
}

/**
 * Colour of connecting lines. These pulse in and out slowly.
 */
World.prototype.getLineColour = function() {
  lineAlpha = (Math.sin(t * 0.05) * 0.03) + 0.06;
  return "rgba(0, 0, 0, " + lineAlpha + ")";
}

/**
 * Build our sphere model.
 */
World.prototype.buildSphere = function(pointsPerAxis) {
  var anglePerPoint = 360 / pointsPerAxis;

  for (var x = 0; x < 30; x++) {
    for (var y = 0; y < pointsPerAxis; y++) {
      canLink = false;

      if (Math.random() > 0.5 && x > 0 && y > 0)
        canLink = true;

      var point = new Point(
        new Degree(x * 12 + (Math.random() * 10)),
        new Degree(y * anglePerPoint + (Math.random() * 10)),
        500,
        Math.random() * 0.02,
        0.05,
        canLink);

      this.addPoint(point);
    }
  }
}

/**
 * Render everything. This is where most of the magic happens.
 */
World.prototype.render = function() {
  this.canvas.resetCanvas();

  context = this.canvas.getContext();

  context.strokeStyle = this.getLineColour();
  context.lineWidth = 2;

  // Scaling constants. We cheat and stretch horizontally to create a more
  // convincing sphere without having to zoom in and add far more points
  var kx = 900;
  var ky = 600;

  // First pass: create an array of all the 2D points we can render
  var twoD_points = [];

  for (var i = 0; i < this.points.length; i++) {
    var point = this.points[i];

    // We modify the radius of each point slightly along a sine wave. Each point has a random speed and amplitude for this.
    var radiusModifier = 1 + (Math.sin(t * point.pulseSpeed) * point.pulseAmplitude);

    // Combine polar co-ords with world, convert to cartesian
    var threeD_x = (Math.cos(point.azimuth + this.azimuth) * Math.cos(point.elevation + this.elevation) * (point.radius * radiusModifier)) - this.x;
    var threeD_y = (Math.sin(point.azimuth + this.azimuth) * point.radius) - this.y;
    var threeD_z = (Math.cos(point.azimuth + this.azimuth) * Math.sin(point.elevation + this.elevation) * (point.radius * radiusModifier)) - this.z;

    // Convert cartesian to 2D screen coordinates
    var twoD_x = (threeD_x / threeD_z * kx) + (DrawingBoard.width / 2);
    var twoD_y = (threeD_y / threeD_z * ky) + (DrawingBoard.height / 2);

    // Don't render points behind the camera (we still need their co-ords though)
    if (threeD_z <= 0)
      var size = 0;
    else {
      var size = 3 / threeD_z * ky;
      if (size < 1)
        size = 1;
    }

    twoD_points.push([twoD_x, twoD_y, size, point.link]);
  }

  context.beginPath();

  // 2nd pass: render lines
  for (var i = 0; i < twoD_points.length; i++) {
    var point = twoD_points[i];
    var twoD_x = point[0];
    var twoD_y = point[1];
    var size = point[2];
    var link = point[3];

    if (link != false) {
      // We either link above us, or to our immediate left - this way we
      // know where our point is trivially
      if (i > pointsPerAxis && link == 'y') {
        var lastX = twoD_points[i - pointsPerAxis][0];
        var lastY = twoD_points[i - pointsPerAxis][1];
      } else {
        var lastX = twoD_points[i - 1][0];
        var lastY = twoD_points[i - 1][1];
      }
      context.moveTo(twoD_x, twoD_y);
      context.lineTo(lastX, lastY);
    }
  }

  context.stroke();

  // 3rd pass: render dots
  for (var i = 0; i < twoD_points.length; i++) {
    var point = twoD_points[i];
    var twoD_x = point[0];
    var twoD_y = point[1];
    var size = point[2];
    var link = point[3];

    if (size > 10) {
      if (link)
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
      else
        context.fillStyle = "rgba(120, 240, 255, 0.5)";

      context.beginPath();
      context.arc(twoD_x, twoD_y, size, 0, 2 * Math.PI);
      context.fill();

      if (link)
        context.fillStyle = "rgba(255, 255, 255, 1)";
      else
        context.fillStyle = "rgba(120, 240, 255, 0.8)";

      context.beginPath();
      context.arc(twoD_x, twoD_y, size / 3, 0, 2 * Math.PI);
      context.fill();
    } else if (size > 0) {

      if (link)
        context.fillStyle = "rgba(255, 255, 255, 1)";
      else
        context.fillStyle = "rgba(120, 240, 255, 0.75)";

      context.beginPath();
      context.arc(twoD_x, twoD_y, size, 0, 2 * Math.PI);
      context.fill();
    }
  }

}

/**
 * Initialise
 */
document.body.style.margin = '0';

DrawingBoard = new Canvas("canvas-anim");
DrawingBoard.hide = false;
var firstFrame = true;

// Frame count (timer) - used to calculate our animation position
var t = 0;

// How many points to include per line of our sphere
var pointsPerAxis = 80;

// Target frames per second
var fps = 30;

/**
 * Build our model and start animating.
 */
//window.onload = function()
//{
// Determine initial camera position based on context

var initialX = 0;
var initialY = -1500;
var initialZ = -300;

//  if (DrawingBoard.hide && document.getElementById('progressouter')) // Progress screen?
//  {
//      var initialY = 0;
//      var initialZ = -650+Math.sin(t*0.018)*100;
//  }
//  else if (DrawingBoard.hide)
//  {
//      var initialY = -1000+(window.innerHeight*0.55);
//      var initialZ = -550+Math.sin(t*0.02)*20;
//  }
//  else if (document.getElementById('progressouter')) // Progress screen?
//  {
//    var initialY = 0;
//    var initialZ = -800;
//  }
//  else if (document.getElementById('inputOverlay')) // Homepage?
//  {
//    var initialY = -1500+(window.innerHeight*0.55);
//    var initialZ = -300;
//  }
//  else
//  {
//    var initialY = -1000+(window.innerHeight*0.55);
//    var initialZ = -550;
//  }

var world = new World(DrawingBoard, 0, 0, initialX, initialY, initialZ);

world.buildSphere(pointsPerAxis);

function renderFrame() {
  // Hide if we've no room
  //    if (window.innerHeight<600)
  //    {
  //        DrawingBoard.resetCanvas();
  //    }
  //    else if((firstFrame || !DrawingBoard.hide))
  //    {
  // Determine new target camera position based on context

  var cameraX = (window.canvasAnimInnerWidth - Math.max(document.body.clientWidth, 300)) / 2;
  //DrawingBoard.setAttribute("height", window.innerHeight-50);
  //      if (document.getElementById('progressouter')) // Progress screen?
  //      {
  //        var cameraY = 0;
  //        var cameraZ = -650+Math.sin(t*0.018)*100;
  //      }
  //      else
  //      {
  // var cameraY = -1100 + (window.innerHeight * 0.55);
  // var cameraZ = -850 + Math.sin(t * 0.02) * 20;
  var cameraY = -1100 + (window.innerHeight * 0.55);
  var cameraZ = -850 + Math.sin(t * 0.02) * 20;
  //   }

  world.twinkleLinks();

  world.setAngle(t * 0.005, (Math.sin(t * 0.001) * 50) + 180);
  world.setCameraTargetPosition(cameraX, cameraY, cameraZ);
  world.moveCameraToTarget();
  world.render();
  firstFrame = false;
  t++;
  //}

  setTimeout(function() {
    requestAnimationFrame(renderFrame);
  }, 1000 / fps);
}

renderFrame();


//}