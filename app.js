var path = require('path');

var apos = require('apostrophe')({
  shortName: 'unisco',

  // See lib/modules for basic project-level configuration of our modules
  // responsible for serving static assets, managing page templates and
  // configuring user accounts.
  bundles: [ 'apostrophe-blog' ],
  modules: {

    'apostrophe-blog': {},
    'apostrophe-blog-pages': {},
    'apostrophe-blog-widgets': {},
    'apostrophe-pages': {
      // We must list `apostrophe-blog-page` as one of the available page types
      types: [
        {
          name: 'apostrophe-blog-page',
          label: 'Blog'
        },
        {
          name: 'default',
          label: 'Default'
        },
        {
          name: 'articles',
          label: 'Articles'
        }
      ]
    },

    // favicon
    // ...
    'apostrophe-favicons': {},
    'apostrophe-favicons-global': {
      destinationDir: '/fav/',
      // Defaults to `/favicons/`. This is an uploadfs path, it will become /uploads/favicons/ on a server

      faviconConfig : {
        icons: {
          windows: true
        }
      }
      // Configuration for favicon module, see options here https://github.com/evilebottnawi/favicons#usage
      // **NOTE** The `path` option is automatically figured out by the module, no need to set it.
    },

    // Apostrophe module configuration

    // Note: most configuration occurs in the respective
    // modules' directories. See lib/apostrophe-assets/index.js for an example.
    
    // However any modules that are not present by default in Apostrophe must at
    // least have a minimal configuration here: `moduleName: {}`

    // If a template is not found somewhere else, serve it from the top-level
    // `views/` folder of the project
    //sign up
    'apostrophe-signup': {
        // How long a signup email remains valid
        hours: 48,     
        // Apostophe group newly signed-up users are added to,
        // with optional permissions
        group: {
          title: 'signup',
          // Let them create apostrophe blog posts (which would need
          // to be a module enabled in your project) and upload files
          // to attach to them
          permissions: [ 'edit-apostrophe-blog', 'edit-attachment' ]
        },
        // defaults
        signupUrl: '/signup',
        signupConfirmUrl: '/signup-confirm',
        afterSignupUrl: '/',
        // Allow the user to enter a subset of the
        // fields in your `apostrophe-users` schema as
        // they are signing up. These are the defaults.
    
        // They will always be asked for their email address
        // and password. If you leave `username` off this list,
        // the user can only log in with their email address.
        fields: [ 'firstName', 'lastName', 'username' ]
      },
    
      // The apostrophe-email module must be configured
      'apostrophe-email': {
        // See the nodemailer documentation, many
        // different transports are available, this one
        // matches how PHP does it on Linux servers
        nodemailer: {
          sendmail: true,
          newline: 'unix',
          path: '/usr/sbin/sendmail'
        }
      },

    'apostrophe-templates': { viewsFolderFallback: path.join(__dirname, 'views') },
    'apostrophe-pages': {
        filters: {
          // Grab our ancestor pages, with two levels of subpages
          ancestors: {
            children: {
              depth: 2
            }
          },
          // We usually want children of the current page, too
          children: true
        }
        // other apostrophe-pages options like `types` ...
      },
      'apostrophe-rich-text-widgets': {},
      'apostrophe-areas': {},
      'one-column-widgets': {},
      'two-column-widgets': {},
      'three-column-widgets': {},
      'four-column-widgets': {},
      'one-three-widgets': {},
      'three-one-widgets': {},
      'hm-feature-box-widgets': {},
      'theme': {}, // styles and js comes from this folder
      'footadd': {},
      'contact-item-widgets': {},

      //contact form
      'contact-form': {},
      'contact-form-widgets': {},
     
      
      //listing 
      'listing-widgets': {},
      'featlisting-widgets': {},
      // 'listing-two-column-widgets': {},


      //image widget
      'image-widgets': {},

      //internal page link
      
  }
});
