module.exports = {        
  extend: 'apostrophe-widgets',        
  label: 'Featlisting',        
  addFields: [
    {
        name: 'url',
        type: 'url',
        label: 'URL',
        required: true
    },
    {
        name: 'label',
        type: 'string',
        label: 'Label',
        required: true
    }
  ]        
};
