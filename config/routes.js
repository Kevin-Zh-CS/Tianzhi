export default [
  { path: '/', redirect: '/login' },
  { path: '/login', component: './Login' },
  // 个人中心
  {
    path: '/account',
    component: '../layouts/index',
    routes: [{ path: '/account', component: './Account' }],
  },
  {
    path: '/price-config',
    component: '../layouts/index',
    routes: [{ path: '/price-config', component: './Account/price' }],
  },
  // 数据共享平台
  {
    path: '/share',
    component: '../layouts/index',
    routes: [
      { path: '/share', redirect: '/share/platform' },
      // // 数据共享概览
      // {
      //   path: '/share/overview',
      //   routes: [
      //     { path: '/share/overview', component: './Share/Overview' },
      //     { component: './404' },
      //   ],
      // },
      // 数据平台
      {
        path: '/share/platform',
        routes: [
          { path: '/share/platform', component: './Share/Platform' },
          { path: '/share/platform/datadetail', component: './Share/Platform/DataDetail' },
          { path: '/share/platform/confirmorder', component: './Share/Platform/ConfirmOrder' },
          { path: '/share/platform/traderesult', component: './Share/Platform/TradeResult' },
          { path: '/share/platform/search-list', component: './Share/Platform/SearchResult' },
          { component: './404' },
        ],
      },
      // 数据获取
      {
        path: '/share/obtain',
        routes: [
          { path: '/share/obtain', redirect: '/share/obtain/list' },
          { path: '/share/obtain/list', component: './Share/Obtain' },
          { path: '/share/obtain/detail', component: './Share/detail' },
          { path: '/share/obtain/request', component: './Share/Obtain/request' },
          { component: './404' },
        ],
      },
      // 数据提供
      {
        path: '/share/provide',
        routes: [
          { path: '/share/provide', redirect: '/share/provide/list' },
          { path: '/share/provide/list', component: './Share/Provide' },
          { path: '/share/provide/detail', component: './Share/detail' },
          { component: './404' },
        ],
      },
      // 404，确保放到routes数组中的最后一项
      { component: './404' },
    ],
  },
  // 数据管理平台
  {
    path: '/manage',
    component: '../layouts/index',
    routes: [
      // 数据管理概览
      { path: '/manage', redirect: '/manage/overview' },
      {
        path: '/manage/overview',
        component: './Manage/Overview',
      },
      // 内部资源管理
      {
        path: '/manage/inner',
        routes: [
          { path: '/manage/inner', redirect: '/manage/inner/repository' },
          {
            path: '/manage/inner/repository',
            routes: [
              { path: '/manage/inner/repository', component: './Manage/Inner' },
              { path: '/manage/inner/repository/detail', component: './Manage/Inner/Detail' },
              { path: '/manage/inner/repository/import', component: './Manage/Inner/Import' },
              { path: '/manage/inner/repository/model', component: './Manage/Inner/Model' },
              {
                path: '/manage/inner/repository/model/publish',
                component: './Manage/Inner/Model/Publish',
              },
              {
                path: '/manage/inner/repository/model/publish/success',
                component: './Manage/Inner/Model/Publish/success',
              },
              {
                path: '/manage/inner/repository/model/detail/unpublished',
                component: './Manage/Inner/Model/Detail/Unpublished',
              },
              {
                path: '/manage/inner/repository/model/detail/published',
                component: './Manage/Inner/Model/Detail/Published',
              },
              {
                path: '/manage/inner/repository/model/editor',
                component: './Manage/Inner/Model/Editor',
              },
              { path: '/manage/inner/repository/interface', component: './Manage/Inner/Interface' },
              {
                path: '/manage/inner/repository/interface/publish',
                component: './Manage/Inner/Interface/Publish',
              },
              {
                path: '/manage/inner/repository/interface/publish/success',
                component: './Manage/Inner/Interface/Publish/Success',
              },
              {
                path: '/manage/inner/repository/interface/detail/unpublished',
                component: './Manage/Inner/Interface/Detail/Unpublished',
              },
              {
                path: '/manage/inner/repository/interface/detail/published',
                component: './Manage/Inner/Interface/Detail/Published',
              },
              {
                path: '/manage/inner/repository/import/upload',
                component: './Manage/Inner/Import/Upload',
              },
              {
                path: '/manage/inner/repository/import/detail',
                component: './Manage/Inner/Import/Detail',
              },
              { path: '/manage/inner/repository/origin', component: './Manage/Inner/Origin' },
              {
                path: '/manage/inner/repository/origin/publish',
                component: './Manage/Inner/Origin/Publish',
              },
              {
                path: '/manage/inner/repository/origin/publish/success',
                component: './Manage/Inner/PublishStatus/Success',
              },
              {
                path: '/manage/inner/repository/origin/detail/unpublished',
                component: './Manage/Inner/Origin/Detail/Unpublished',
              },
              {
                path: '/manage/inner/repository/origin/detail/published',
                component: './Manage/Inner/Origin/Detail/Published',
              },
              { path: '/manage/inner/repository/database', component: './Manage/Inner/Database' },
              {
                path: '/manage/inner/repository/database/connect',
                component: './Manage/Inner/Database/Connect',
              },
              {
                path: '/manage/inner/repository/database/detail',
                component: './Manage/Inner/Database/Detail',
              },
              { path: '/manage/inner/repository/file', component: './Manage/Inner/File' },
              {
                path: '/manage/inner/repository/file/publish',
                component: './Manage/Inner/File/Publish',
              },
              {
                path: '/manage/inner/repository/file/publish/success',
                component: './Manage/Inner/File/Publish/Success',
              },
              {
                path: '/manage/inner/repository/file/detail/unpublished',
                component: './Manage/Inner/File/Detail/Unpublished',
              },
              {
                path: '/manage/inner/repository/file/detail/published',
                component: './Manage/Inner/File/Detail/Published',
              },
              { component: './404' },
            ],
          },
          // { path: '/manage/inner/publish', component: './Manage/Inner/Publish'},
          {
            path: '/manage/inner/publish',
            routes: [
              { path: '/manage/inner/publish', component: './Manage/Inner/Publish' },
              {
                path: '/manage/inner/publish/file',
                component: './Manage/Inner/Publish/file-published',
              },
              {
                path: '/manage/inner/publish/interface',
                component: './Manage/Inner/Publish/interface-published',
              },
              {
                path: '/manage/inner/publish/model',
                component: './Manage/Inner/Publish/model-published',
              },
              {
                path: '/manage/inner/publish/origin',
                component: './Manage/Inner/Publish/origin-published',
              },
            ],
          },
          {
            path: '/manage/inner/publish/file',
            component: './Manage/Inner/Publish/file-published',
          },
          {
            path: '/manage/inner/publish/interface',
            component: './Manage/Inner/Publish/interface-published',
          },
          {
            path: '/manage/inner/publish/model',
            component: './Manage/Inner/Publish/model-published',
          },
          {
            path: '/manage/inner/publish/origin',
            component: './Manage/Inner/Publish/origin-published',
          },
          { component: './404' },
        ],
      },
      // 外部资源管理
      {
        path: '/manage/outer',
        routes: [
          { path: '/manage/outer', redirect: '/manage/outer/repository' },
          {
            path: '/manage/outer/repository',
            routes: [
              { path: '/manage/outer/repository', component: './Manage/Outer' },
              { path: '/manage/outer/repository/detail', component: './Manage/Outer/Detail' },
              { path: '/manage/outer/repository/model', component: './Manage/Outer/Repository' },
              {
                path: '/manage/outer/repository/model/detail',
                component: './Manage/Outer/Repository/Detail',
              },
              {
                path: '/manage/outer/repository/interface',
                component: './Manage/Outer/Repository',
              },
              {
                path: '/manage/outer/repository/interface/detail',
                component: './Manage/Outer/Repository/Detail',
              },
              { path: '/manage/outer/repository/origin', component: './Manage/Outer/Repository' },
              {
                path: '/manage/outer/repository/origin/detail',
                component: './Manage/Outer/Repository/Detail',
              },
              { path: '/manage/Outer/repository/file', component: './Manage/Outer/Repository' },
              {
                path: '/manage/outer/repository/file/detail',
                component: './Manage/Outer/Repository/Detail',
              },
              { component: './404' },
            ],
          },
          { path: '/manage/outer/obtain', component: './Manage/Outer/Obtain' },
          { path: '/manage/outer/obtain/detail', component: './Manage/Outer/Obtain/detail' },
          { path: '/manage/outer/obtain/request', component: './Manage/Outer/Obtain/request' },
          { component: './404' },
        ],
      },
      // 404，确保放到routes数组中的最后一项
      {
        component: './404',
      },
    ],
  },
  // 联邦计算
  {
    path: '/federate',
    component: '../layouts/index',
    routes: [
      // 应用中心
      // { path: '/federate', redirect: '/federate/application' },
      {
        path: '/federate/application',
        routes: [
          { path: '/federate/application/info/:id', component: './Federate/Application/Info' },
          {
            path: '/federate/application/blacklist',
            component: './Federate/Application/Blacklist',
          },
          {
            path: '/federate/application/risk-control',
            component: './Federate/Application/RiskControl',
          },
          { path: '/federate/application', component: './Federate/Application' },
          { component: './404' },
        ],
      },
      // 我发起的
      { path: '/federate', redirect: '/federate/sponsor' },
      {
        path: '/federate/sponsor',
        routes: [
          { path: '/federate/sponsor', component: './Federate/Sponsor' },
          { path: '/federate/sponsor/task', component: './Federate/Sponsor/Task' },
          {
            path: '/federate/sponsor/make-interface',
            component: './Federate/Sponsor/make-interface',
          },
          { path: '/federate/sponsor/doc-detail', component: './Federate/Sponsor/doc-detail' },
          { path: '/federate/sponsor/editor', component: './Federate/Sponsor/Editor' },
          { path: '/federate/sponsor/member', component: './Federate/Sponsor/Member' },
          { component: './404' },
        ],
      },
      // 我参与的
      {
        path: '/federate/partner',
        routes: [
          { path: '/federate/partner', component: './Federate/Partner' },
          { path: '/federate/partner/detail', component: './Federate/Partner/Detail' },
          { path: '/federate/partner/editor', component: './Federate/Partner/Editor' },
          { path: '/federate/partner/addData', component: './Federate/Partner/AddData' },
          { component: './404' },
        ],
      },
      // 404，确保放到routes数组中的最后一项
      {
        component: './404',
      },
    ],
  },
  // 后台管理
  {
    path: '/backstage',
    component: '../layouts/index',
    routes: [
      // 机构管理
      { path: '/backstage', redirect: '/backstage/organization/info' },
      {
        path: '/backstage/organization',
        routes: [
          { path: '/backstage/organization/info', component: './Backstage/Organization/Info' },
          {
            path: '/backstage/organization/user',
            component: './Backstage/Organization/User',
          },
          {
            path: '/backstage/organization/department',
            component: './Backstage/Organization/Department',
          },
          {
            path: '/backstage/organization/permission',
            component: './Backstage/Organization/Permission',
          },
          {
            path: '/backstage/organization/permission/detail',
            component: './Backstage/Organization/Permission/detail',
          },
          {
            path: '/backstage/organization/permission/edit',
            component: './Backstage/Organization/Permission/edit',
          },
          { component: './404' },
        ],
      },
      {
        path: '/backstage/credit',
        routes: [
          { path: '/backstage/credit/info', component: './Backstage/Credit/info' },
          { path: '/backstage/credit/settle', component: './Backstage/Credit/settle' },
          {
            path: '/backstage/credit/settle/detail',
            component: './Backstage/Credit/settle-detail',
          },
          {
            path: '/backstage/credit/settle/org/detail',
            component: './Backstage/Credit/settle-org-detail',
          },
          { component: './404' },
        ],
      },
      // 404，确保放到routes数组中的最后一项
      {
        component: './404',
      },
    ],
  },
  // 站内信页面
  {
    path: '/message',
    component: '../layouts/index',
    routes: [{ path: '/message', component: './Message/list' }],
  },
  {
    path: '/qfl',
    component: '../layouts/index',
    routes: [
      { path: '/qfl', redirect: '/qfl/sponsor/repository' },
      {
        path: '/qfl/sponsor/repository',
        routes: [{ path: '/qfl/sponsor/repository', component: './Qfl/sponsor/repository' }],
      },
      {
        path: '/qfl/partner',
        routes: [
          { path: '/qfl/partner', component: './Qfl/partner' },
          { path: '/qfl/partner/detail', component: './Qfl/partner/detail' },
          { path: '/qfl/partner/project-detail', component: './Qfl/partner/project-detail' },
          {
            path: '/qfl/partner/project-detail-info',
            component: './Qfl/partner/project-detail-info',
          },
          { path: '/qfl/partner/addData', component: './Qfl/partner/add-data' },
        ],
      },
      {
        path: '/qfl/sponsor/project/detail',
        routes: [
          { path: '/qfl/sponsor/project/detail', component: './Qfl/sponsor/project' },
          {
            path: '/qfl/sponsor/project/detail/info',
            component: './Qfl/sponsor/project/detail',
          },
          {
            path: '/qfl/sponsor/project/detail/modal-add',
            component: './Qfl/modal-manage/add',
          },
        ],
      },
      {
        path: '/qfl/sponsor/project/member',
        component: './Qfl/sponsor/member',
      },
      {
        path: '/qfl/modal-manage',
        routes: [
          { path: '/qfl/modal-manage', component: './Qfl/modal-manage' },
          { path: '/qfl/modal-manage/detail', component: './Qfl/modal-manage/detail' },
          { path: '/qfl/modal-manage/upload', component: './Qfl/modal-manage/upload' },
          {
            path: '/qfl/modal-manage/add-version',
            component: './Qfl/modal-manage/add-version',
          },
          { path: '/qfl/modal-manage/edit', component: './Qfl/modal-manage/edit' },
          { path: '/qfl/modal-manage/add', component: './Qfl/modal-manage/add' },
          { path: '/qfl/modal-manage/diff', component: './Qfl/modal-manage/diff' },
        ],
      },
      {
        component: './404',
      },
    ],
  },

  { component: './404' },
];
