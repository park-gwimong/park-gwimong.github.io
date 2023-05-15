/* jshint asi:true */

/**
 * 
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

  /**
     * Data JSON
     */
  var demoContent = [
    {
      demo_link: 'http://gaohaoyang.github.io/test/bootstrap-zhihu/',
      img_link: 'http://7q5cdt.com1.z0.glb.clouddn.com/teach-girlfriend-html-CopyZhihu.jpg',
      code_link: 'https://github.com/Gaohaoyang/test/tree/master/bootstrap-zhihu',
      title: 'Imitation of the page',
      core_tech: 'HTML BootStrap',
      description: 'BootStrap'
    }
  ];

  contentInit(demoContent) // Init content
  waitImgsLoad() // Wait load image
}());

/**
 * Init content
 * @return {[type]} [description]
 */
function contentInit(content) {
  var htmlStr = ''
  for (var i = 0; i < content.length; i++) {
    htmlStr += '<div class="grid-item">' 
			+ '   <a class="a-img" href="' + content[i].demo_link + '">' 
			+ '       <img src="' + content[i].img_link + '">' + '   </a>' 
			+ '   <h3 class="demo-title">' 
			+ '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' 
			+ '   </h3>' 
			+ '   <p>Core：' + content[i].core_tech + '</p>' 
			+ '   <p>' + content[i].description + '</p>'
			+ '	  <p><a href="' + content[i].code_link + '">Source <i class="fa fa-code" aria-hidden="true"></i></a></p>' 
			+ '</div>'
  }
  var grid = document.querySelector('.grid')
  grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * @return {[type]} [description]
 */
function waitImgsLoad() {
  var imgs = document.querySelectorAll('.grid img')
  var totalImgs = imgs.length
  var count = 0
  //console.log(imgs)
  for (var i = 0; i < totalImgs; i++) {
    if (imgs[i].complete) {
      //console.log('complete');
      count++
    } else {
      imgs[i].onload = function() {
        // alert('onload')
        count++
        //console.log('onload' + count)
        if (count == totalImgs) {
          //console.log('onload---bbbbbbbb')
          initGrid()
        }
      }
    }
  }
  if (count == totalImgs) {
    initGrid()
  }
}

/**
 * @return {[type]} [description]
 */
function initGrid() {
  var msnry = new Masonry('.grid', {
    // options
    itemSelector: '.grid-item',
    columnWidth: 250,
    isFitWidth: true,
    gutter: 20
  })
}
