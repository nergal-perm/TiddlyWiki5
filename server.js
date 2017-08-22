var $tw = require("./boot/boot.js").TiddlyWiki();

$tw.boot.argv = [
  process.env.OPENSHIFT_DATA_DIR,
  "--init",
  "empty",
  "--verbose",
  "--server",
  process.env.OPENSHIFT_NODEJS_PORT,
  "$:/core/save/all",
  "text/plain",
  "text/html",
  "Eugene Terekhov",
  "PassW0rd",
  process.env.OPENSHIFT_NODEJS_IP,
];

console.log(JSON.stringify($tw.boot.argv));

//$tw.boot.boot();