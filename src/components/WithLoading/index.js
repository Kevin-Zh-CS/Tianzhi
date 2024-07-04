import React from 'react';
import { Spin } from 'quanta-design';
import { Skeleton } from 'antd';
import GridLayout from 'react-grid-layout';
import classnames from 'classnames';
import Card from './Card';
import styles from './index.less';

const skeletonTemplates = {
  // 使用场景：
  // 内部资源库-各类资源的详情（包括已发布和未发布的）
  // 内部资源库-已发布数据
  1: {
    skeletonNum: 1,
    skeletonProps: {
      1: {
        title: { width: '20%' },
        paragraph: {
          rows: 20,
          width: [
            '30%',
            '50%',
            '50%',
            '30%',
            '30%',
            '30%',
            '30%',
            '100%',
            '100%',
            '50%',
            '30%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '50%',
            '50%',
            '50%',
            '30%',
          ],
        },
      },
    },
  },
  // 使用场景：
  // 部门管理
  2: {
    skeletonNum: 12,
    skeletonProps: {
      1: { avatar: { shape: 'circle', size: 'small' }, title: { width: '100%' }, paragraph: false },
      2: { avatar: { shape: 'circle', size: 'small' }, title: { width: '70%' }, paragraph: false },
      3: { avatar: { shape: 'circle', size: 'small' }, title: { width: '100%' }, paragraph: false },
      4: { avatar: { shape: 'circle', size: 'small' }, title: { width: '70%' }, paragraph: false },
      5: { avatar: { shape: 'circle', size: 'small' }, title: { width: '100%' }, paragraph: false },
      6: { avatar: { shape: 'circle', size: 'small' }, title: { width: '70%' }, paragraph: false },
      7: { avatar: { shape: 'circle', size: 'small' }, title: { width: '100%' }, paragraph: false },
      8: { avatar: { shape: 'circle', size: 'small' }, title: { width: '70%' }, paragraph: false },
      9: { avatar: { shape: 'circle', size: 'small' }, title: { width: '100%' }, paragraph: false },
      10: { avatar: { shape: 'circle', size: 'small' }, title: { width: '70%' }, paragraph: false },
      11: {
        avatar: { shape: 'circle', size: 'small' },
        title: { width: '100%' },
        paragraph: false,
      },
      12: { avatar: { shape: 'circle', size: 'small' }, title: { width: '70%' }, paragraph: false },
    },
    skeletonStyle: { padding: '0 0 32px 0', background: '#fff' },
    skeletonItemStyle: { padding: '0 32px' },
  },
  // 使用场景：
  // 外部资源管理-已获取数据-请求数据
  // 外部资源管理-数据详情
  3: {
    skeletonNum: 2,
    skeletonProps: {
      1: {
        paragraph: {
          rows: 20,
          width: [
            '50%',
            '50%',
            '100%',
            '100%',
            '100%',
            '50%',
            '50%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '50%',
            '50%',
            '100%',
            '100%',
            '100%',
          ],
        },
      },
      2: {
        paragraph: {
          rows: 20,
          width: [
            '50%',
            '50%',
            '100%',
            '100%',
            '100%',
            '50%',
            '50%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '50%',
            '50%',
            '100%',
            '100%',
            '100%',
          ],
        },
      },
    },
    skeletonStyle: { background: '#fff', padding: 0, margin: '0 20px' },
    layoutWidth: window.innerWidth - 240,
    layout: [
      { i: 'a', x: 0, y: 0, w: 6, h: 5, static: true },
      { i: 'b', x: 6, y: 0, w: 6, h: 5, static: true },
    ],
  },
  // 使用场景：
  // 内部资源库-列表
  // 外部资源库-列表
  // 隐私计算-列表
  4: {
    skeletonNum: 1,
    skeletonComponent: (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    ),
    skeletonStyle: { padding: '0 8px 0 20px' },
    skeletonItemStyle: { background: 'transparent', padding: 0 },
  },
};

/**
 * props
 * loading            请求loading（dva请求存在loading.global，普通请求存在global.loading中）
 * loadingAuth        权限请求loading（存在global.loadingAuth中，作特殊处理）
 *
 *
 * options
 * spinStyle
 * skeletonNum        骨架屏数量（启用骨架屏需要透传一个style属性给WrappedComponent）
 * skeletonProps: {}  骨架屏props（从左到右，从上到下，从1开始计数，没有则不传）
 * skeletonComponent  自定义骨架屏组件
 * layout: []         骨架屏启用grid布局，可自定义宽高
 * layoutWidth        启用grid布局时骨架屏总宽度
 * skeletonStyle
 * skeletonItemStyle
 * skeletonTemplate
 */

let _loading = false;
function WithLoading(WrappedComponent, _options = {}) {
  setTimeout(() => {
    if (_loading) {
      _loading = false;
    }
  }, 5000);

  return props => {
    const { loading, loadingAuth, ...restProps } = props;
    // const _loading = !!(loading || loadingAuth);
    _loading = !!(loading || loadingAuth);

    // 外部资源库-数据源详情和请求数据特殊处理
    const { id, type } = props;
    // eslint-disable-next-line no-param-reassign
    if (id && typeof type === 'number') _options.skeletonTemplate = type === 3 ? 1 : 3;

    const options = _options.skeletonTemplate
      ? skeletonTemplates[_options.skeletonTemplate]
      : _options;
    const skeletonProps = [];
    if (options.skeletonNum) {
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i <= options.skeletonNum; i++) {
        skeletonProps.push((options.skeletonProps || {})[i] || {});
      }
    }

    return !options.skeletonNum ? (
      <Spin spinning={_loading} style={{ marginTop: '-16px', ...(options.spinStyle || {}) }}>
        <WrappedComponent loading={_loading} {...restProps} />
      </Spin>
    ) : (
      <>
        <WrappedComponent
          style={_loading ? { display: 'none' } : {}}
          loading={_loading}
          {...restProps}
        />
        {loadingAuth ? (
          <div className={styles.spinAuth} style={options.spinStyle || {}}>
            <Spin />
          </div>
        ) : !options.layout ? (
          <div
            style={{
              display: _loading ? 'block' : 'none',
              padding: '0 20px',
              ...(options.skeletonStyle || {}),
            }}
          >
            {skeletonProps.map(item => (
              <div
                className={classnames(
                  styles.skeleton,
                  options.skeletonNum === 1 ? styles.skeleton1 : '',
                )}
                style={options.skeletonItemStyle || {}}
              >
                {options.skeletonComponent ? (
                  options.skeletonComponent
                ) : (
                  <Skeleton active {...item} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <GridLayout
            style={{
              display: _loading ? 'block' : 'none',
              padding: '0 10px',
              ...(options.skeletonStyle || {}),
            }}
            layout={options.layout}
            cols={12}
            rowHeight={136}
            width={options.layoutWidth}
          >
            {skeletonProps.map((item, index) => (
              <div
                key={options.layout[index].i}
                className={styles.skeletonLayout}
                style={options.skeletonItemStyle || {}}
              >
                {options.skeletonComponent ? (
                  options.skeletonComponent
                ) : (
                  <Skeleton active {...item} />
                )}
              </div>
            ))}
          </GridLayout>
        )}
      </>
    );
  };
}

export default WithLoading;
