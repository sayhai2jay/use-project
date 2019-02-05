module.exports = {        
  extend: 'apostrophe-widgets',        
  label: 'Hm Feature Box',   
  contextualOnly: true,       
  addFields: [
        {
            name: 'feature_title',
            type: 'area'
        }
        // ,
        // {
        //     name: 'feature_description',
        //     type: 'area'
        // }
  ]        
};