export default {
  // 支持值为 Object 和 Array
  'GET /api/v2/list': {
    code: 200,
    data: {
      list: [
        {
          name: 'aa',
          age: 12,
        },
        {
          name: 'bb',
          age: 13,
        },
      ],
      total: 2,
    },
  },
};
