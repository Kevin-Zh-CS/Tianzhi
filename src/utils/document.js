/*
 * Created By Chris Su on 2018-11-21 11:31:00
 */
import { getDraftList } from './draft';

// 根据id，查找目录
export const getCategoryById = (id, list = []) => {
  let category;
  for (let i = 0; i < list.length; i += 1) {
    if (`${list[i].id}` === `${id}`) {
      category = list[i];
      break;
    } else if (list[i].children && list[i].children.length) {
      category = getCategoryById(id, list[i].children);
      if (category) {
        break;
      }
    }
  }
  return category;
};

// 获取第一个有效文档的id
export const getFirstDoc = (list = []) => {
  let doc;
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    if (`${item.level}` === '2') {
      doc = item;
      break;
    } else if (list[i].children && list[i].children.length) {
      doc = getFirstDoc(list[i].children);
      if (doc) {
        break;
      }
    }
  }
  return doc;
};

// 排序
export const sortCategory = (id, clist = [], type) => {
  const list = [...clist];
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    if (`${item.id}` === `${id}`) {
      if (type === 'down') {
        if (i + 1 < list.length) {
          const nextItem = list[i + 1];
          list.splice(i, 1, nextItem);
          list.splice(i + 1, 1, item);
        }
      } else if (type === 'up') {
        if (i - 1 >= 0) {
          const prevItem = list[i - 1];
          list.splice(i, 1, prevItem);
          list.splice(i - 1, 1, item);
        }
      }
      break;
    } else if (item.children && item.children.length) {
      item.children = sortCategory(id, list[i].children, type);
    }
  }

  return list;
};

// 获取parentKey
export const getParentKey = (id, list = []) => {
  let parentKey;
  let i;
  for (i = 0; i < list.length; i += 1) {
    // 查找一级
    parentKey = `${list[i].id}`;
    if (`${list[i].id}` === `${id}`) {
      break;
    }
    // 查找二级
    if (list[i].children && list[i].children.length) {
      const { children } = list[i];
      let j;
      for (j = 0; j < children.length; j += 1) {
        if (`${children[j].id}` === `${id}`) {
          break;
        }
      }
      if (j < children.length) {
        break;
      }
    }
  }
  if (i === list.length) {
    return '';
  }
  return parentKey;
};

export const updateCategory = (category, list1 = []) => {
  const list = list1;
  const { id } = category;
  for (let i = 0; i < list.length; i += 1) {
    if (`${list[i].id}` === `${id}`) {
      list[i] = category;
      break;
    } else if (list[i].children && list[i].children.length) {
      updateCategory(category, list[i].children);
    }
  }
  return list;
};

export const deleteCategory = (id, list = []) => {
  for (let i = 0; i < list.length; i += 1) {
    if (`${list[i].id}` === `${id}`) {
      list.splice(i, 1);
      break;
    } else if (list[i].children && list[i].children.length) {
      deleteCategory(id, list[i].children);
    }
  }
  return list;
};

export const formatCategoryList = (list = []) => {
  let nextList = [...list];
  const DRAFT_LIST = getDraftList();
  // console.log('DRAFT_LIST:', DRAFT_LIST);
  if (!DRAFT_LIST) {
    return nextList;
  }
  // 矫正数据, 有修改过的目录，读取本地数据
  for (let i = 0; i < DRAFT_LIST.length; i += 1) {
    const draft = DRAFT_LIST[i];
    const category = getCategoryById(draft.id, nextList);
    if (category) {
      category.name = draft.name;
      category.content = draft.content;
      nextList = updateCategory(category, nextList);
    } else if (`${draft.level}` === '1') {
      nextList.push({
        id: draft.id,
        name: draft.name,
        level: draft.level,
        content: draft.content,
      });
    } else if (`${draft.level}` === '2') {
      const parentCategory = getCategoryById(draft.pid, nextList);
      if (parentCategory) {
        parentCategory.children = parentCategory.children || [];
        parentCategory.children.push({
          id: draft.id,
          name: draft.name,
          level: draft.level,
          content: draft.content,
        });
        nextList = updateCategory(parentCategory, nextList);
      }
    }
  }
  return nextList;
};
