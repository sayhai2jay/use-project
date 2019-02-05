module.exports = {
  construct: function(self, options) {
    // loads from public/js/site.js of this module
    self.pushAsset('script', 'site');
    // self.pushAsset('script', 'jquery-2.1.0.min');
    // self.pushAsset('script', 'stick_menu');
    self.pushAsset('script', 'popper');
    self.pushAsset('script', 'bootstrap.min');
    self.pushAsset('script', 'scrollreveal.min');
    self.pushAsset('script', 'imgfix.min');
    self.pushAsset('script', 'parallax.min');
    self.pushAsset('script', 'custom');
    
    // loads from public/css/site.less of this module
    self.pushAsset('stylesheet', 'site');
    self.pushAsset('stylesheet', 'bootstrap.min');
    self.pushAsset('stylesheet', 'font-awesome.min');
    self.pushAsset('stylesheet', 'blue');
  }
};
