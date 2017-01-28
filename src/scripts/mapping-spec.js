export default {
  types: [
    {
      type: 'id',
      label: "ID",
      primary: true,
      multiple: true,
      attributes: ["language"]
    },
    {
      type: 'label',
      label: "Label",
      primary: true,
      multiple: true,
      attributes: ["language", "regex"]
    },
    {
      type: 'imageLink',
      label: "Image Link",
      primary: true,
      multiple: false,
      attributes: ["language", "regex"]
    },
    {
      type: 'categoryHierarchy',
      label: "Category Hierarchy",
      primary: false,
      multiple: false,
      attributes: ["language", "regex", "delimiter"]
    },
    {
      type: 'mapping',
      label: "Mapping",
      primary: false,
      multiple: true,
      attributes: ["language", "name", "regex"]
    },
  ],

  attributes: [
    {
      type: "language",
      label: "Language"
    },
    {
      type: "regex",
      label: "Regular Expression"
    },
    {
      type: "name",
      label: "Attribute Name"
    },
    {
      type: "delimiter",
      label: "Hierarchy Delimiter"
    },
  ]
};
