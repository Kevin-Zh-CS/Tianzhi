/*
 * Created By Chris Su on 2018-11-20 16:28:18
 */
export const getDraftList = () => JSON.parse(localStorage.getItem('DRAFT_LIST') || '[]');

export const setDraftList = (list = []) => {
  localStorage.setItem('DRAFT_LIST', JSON.stringify(list));
};

export const getDraft = id => {
  const DRAFT_LIST = getDraftList();
  const [DRAFT] = DRAFT_LIST.filter(draft => `${draft.id}` === `${id}`);
  return DRAFT;
};

export const clearDraft = () => {
  localStorage.removeItem('DRAFT_LIST');
};

export const removeDraft = id => {
  const DRAFT_LIST = getDraftList();
  const NEXT_DRAFT_LIST = DRAFT_LIST.filter(draft => `${draft.id}` !== `${id}`);
  setDraftList(NEXT_DRAFT_LIST);
};

export const addDraft = draft => {
  let DRAFT_LIST = getDraftList();
  if (draft) {
    const NEXT_DRAFT = getDraft(draft.id);
    // 判重
    if (NEXT_DRAFT) {
      DRAFT_LIST = DRAFT_LIST.map(d => {
        if (`${draft.id}` === `${d.id}`) {
          return { ...d, ...draft };
        }
        return d;
      });
    } else {
      DRAFT_LIST.push(draft);
    }
  }
  setDraftList(DRAFT_LIST);
};

export const updateDraft = (draft = {}) => {
  const DRAFT_LIST = getDraftList();
  const NEXT_DRAFT_LIST = DRAFT_LIST.map(d => {
    if (`${draft.id}` === `${d.id}`) {
      return { ...d, ...draft };
    }
    return d;
  });
  // console.log('NEXT_DRAFT_LIST', NEXT_DRAFT_LIST);
  setDraftList(NEXT_DRAFT_LIST);
};
