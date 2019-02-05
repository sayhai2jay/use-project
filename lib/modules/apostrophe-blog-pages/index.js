module.exports = {
    name: 'apostrophe-events-page',
    label: 'Events Page',
    extend: 'apostrophe-pieces-pages',
    previous: {
        projection: {
          title: 1,
          slug: 1,
          tags: 1,
          type: 1
        }
      },
      next: {
        projection: {
          title: 1,
          slug: 1,
          tags: 1,
          type: 1
        }
      },
    piecesFilters: [
      { name: 'year' },
      { name: 'month' },
      { name: 'day' }
    ],

    'profiles-pages': {
        extend: 'apostrophe-pieces-pages',
        piecesFilters: [
          {
            name: 'tags'
          },
          {
            name: 'market'
          }
        ]
      },
  
    construct: function(self, options) {
      // Append upcoming flag by extending pieces.indexCursor.
      var superIndexCursor = self.indexCursor;
      self.indexCursor = function(req) {
        return superIndexCursor(req).upcoming(true);
      };
    }
  };