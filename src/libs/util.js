import cookies from "./util.cookies";
import log from "./util.log";
import db from "./util.db";
import dayjs from "dayjs";

export function treeToList(
  tree = [],
  idValue = null,
  childrenField = "children",
  idField = "id",
  parentIdField = "parentId"
) {
  const list = [];
  if (!childrenField) childrenField = "children";
  for (let i = 0, j = tree.length; i < j; i++) {
    const d = tree[i];
    const id = d[idField];
    if (!list.some(l => l[idField] === id)) {
      list.push(d);
    }
    if (parentIdField) d[parentIdField] = idValue;
    const children = d[childrenField];
    if (children && children.length > 0) {
      const items = treeToList(
        children,
        id,
        childrenField,
        idField,
        parentIdField
      );
      const values = items.values();
      for (const v of values) {
        if (!list.some(l => l[idField] === v[idField])) {
          list.push(v);
        }
      }
    }
  }
  return list;
}

export function listToTree(
  list = [],
  root = null,
  idField = "id",
  parentIdField = "parentId"
) {
  const tree = [];
  const hash = {};
  const childrenField = "children";
  for (let i = 0, l = list.length; i < l; i++) {
    const d = list[i];
    hash[d[idField]] = d;
  }

  for (let i = 0, l = list.length; i < l; i++) {
    const d = list[i];
    const parentID = d[parentIdField];
    if (parentID === "" || parentID === 0 || parentID === null) {
      tree.push(d);
      continue;
    }

    const parent = hash[parentID];
    if (!parent) {
      tree.push(d);
      continue;
    }

    let children = parent[childrenField];
    if (!children) {
      children = [];
      parent[childrenField] = children;
    }
    children.push(d);
  }

  if (root) {
    root[childrenField] = tree;
    return [root];
  }

  return tree;
}

export function getListParents(
  list = [],
  idValue,
  idField = "id",
  parentIdField = "parentId"
) {
  const parents = [];
  const self = list.find(o => o[idField] === idValue);
  let parent = list.find(o => o[idField] === self[parentIdField]);
  while (parent && parent[idField] > 0) {
    parents.unshift(parent);
    parent = list.find(o => o[idField] === parent[parentIdField]);
  }
  return parents;
}

export function getTreeParents(
  tree = [],
  idValue,
  childrenField = "children",
  idField = "id",
  parentIdField = "parentId",
  parentIdValue = 0
) {
  const list = treeToList(
    tree,
    parentIdValue,
    childrenField,
    idField,
    parentIdField
  );
  return getListParents(list, idValue, idField, parentIdField);
}

export function getTenantByHost() {
  var hostname = location.hostname;
  // eslint-disable-next-line no-useless-escape
  var reg = /^(?<identifier>[^\.]+)(\.[^\.]+)*$/;
  var tenant = hostname.match(reg).groups["identifier"];
  return tenant;
}

export function formatTime(time, format = "YYYY-MM-DD HH:mm") {
  let timeFormat = dayjs(time).format(format);
  return timeFormat;
}

export const param2Obj = url => {
  const search = url.split("?")[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  );
};

const util = {
  cookies,
  log,
  db,
  getTenantByHost,
  treeToList,
  listToTree,
  getListParents,
  getTreeParents,
  formatTime,
  param2Obj
};

export default util;
