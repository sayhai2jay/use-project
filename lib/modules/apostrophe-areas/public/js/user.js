apos.define('apostrophe-areas', {
    construct: function(self, options) {
      // Use the super pattern - don't forget to call the original method
      var superEnableCkeditor = self.enableCkeditor;
      self.enableCkeditor = function() {
        superEnableCkeditor();
        // Now do as we please
        CKEDITOR.plugins.addExternal('myplugin', '/modules/my-apostrophe-areas/js/ckeditorPlugins/YOUR-PLUGIN-NAME/', 'plugin.js');
      };
    }
  });