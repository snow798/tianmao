

// 只需要编译 html 文件，以及其用到的资源。
//fis.set('project.files', ['*.html', 'map.json']);

fis.match('*.js', {
  isMod: true
});

fis.match('**/sea.js', {
  isMod: false
}, true);

fis.match('**/*.less', {
  rExt: '.css', // from .less to .css
  parser: fis.plugin('less-2.x', {
    // fis-parser-less-2.x option
  })
});

fis.hook('module', {
  mode: 'cmd',
  // 记得设置这个。
  forwardDeclaration: true,
  baseUrl: '.comp/',
  paths: {
    "utli": "jquery/utli.js",
    'static': '../dist/'
  }
});

fis.match('::packager', {
  postpackager: fis.plugin('loader')
});


fis.match('*', {
  domain: '/ok/tianmao/dist'
});

fis.match('*', {
  release: '/$0'
});

fis.match('/comp/**/*', {
  release: '$0'
});
