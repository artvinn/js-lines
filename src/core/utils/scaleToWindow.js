import Device from '../sys/Device';

function scaleToWindow(canvas, width, height) {

  var scaleX, scaleY, scale, center;
  
  scaleX = window.innerWidth / width;
  scaleY = window.innerHeight / height;
  if (!Device.isMobile() && window.innerWidth > width && window.innerHeight > height) {
    scale = 1;
  } else {
    scale = Math.min(scaleX, scaleY);
  }

  canvas.style.transformOrigin = "0 0";
  canvas.style.transform = "scale(" + scale + ")";
  
  //Center horizontally
  var margin;
  margin = (window.innerWidth - width * scale) / 2;
  canvas.style.marginLeft = margin + "px";
  canvas.style.marginRight = margin + "px";

  //Center vertically
  margin = (window.innerHeight - height * scale) / 2;
  canvas.style.marginTop = margin + "px";
  canvas.style.marginBottom = margin + "px";

  //3. Remove any padding from the canvas  and body and set the canvas
  //display style to "block"
  canvas.style.paddingLeft = 0;
  canvas.style.paddingRight = 0;
  canvas.style.paddingTop = 0;
  canvas.style.paddingBottom = 0;
  canvas.style.display = "block";

  //5. Return the `scale` value. This is important, because you'll nee this value 
  //for correct hit testing between the pointer and sprites
  return scale;
}

export default scaleToWindow;