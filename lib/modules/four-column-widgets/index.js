module.exports = {        
  extend: 'apostrophe-widgets',        
  label: 'Four Column',   
  contextualOnly: true,       
  addFields: [
    {
        name: 'one',
        type: 'area'
    },
    {
        name: 'two',
        type: 'area'
    },
    {
        name: 'three',
        type: 'area'
    },
    {
        name: 'four',
        type: 'area'
    }
  ]        
};