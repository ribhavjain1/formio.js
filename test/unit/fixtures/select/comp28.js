export default {
  _id: '672483c1d9abe46bcd70bca4',
  title: 'yyyyyyy',
  name: 'yyyyyyy',
  path: 'yyyyyyy',
  type: 'form',
  display: 'form',
  components: [
    {
      label: 'Number',
      applyMaskOn: 'change',
      mask: false,
      tableView: false,
      delimiter: false,
      requireDecimal: false,
      inputFormat: 'plain',
      truncateMultipleSpaces: false,
      validateWhenHidden: false,
      key: 'number',
      type: 'number',
      input: true,
    },
    {
      label: 'Select - Resource',
      widget: 'choicesjs',
      tableView: true,
      dataSrc: 'resource',
      data: {
        resource: '672482f2d9abe46bcd70a0dc',
      },
      valueProperty: 'data.textField',
      template: '<span>{{ item.data.textField }}</span>',
      validate: {
        select: false,
      },
      validateWhenHidden: false,
      key: 'selectResource',
      type: 'select',
      searchField: 'data.textField__regex',
      noRefreshOnScroll: false,
      addResource: false,
      reference: false,
      input: true,
      searchThreshold: 0.3,
    },
    {
      type: 'button',
      label: 'Submit',
      key: 'submit',
      disableOnInvalid: true,
      input: true,
      tableView: false,
    },
  ],
  project: '67211a9aa929e4e6ebc2bf77',
  created: '2024-11-01T07:31:13.647Z',
  modified: '2024-11-01T12:51:23.213Z',
  machineName: 'izutenexavvxnws:yyyyyyy',
};