export interface TreeNode {
  name: string;
  children: TreeNode[];
}

function createNode(path: string[], tree: TreeNode[], _id?: string): void {
  const name = path.shift();
  const idx = tree.findIndex((e: TreeNode) => {
    return e.name == name;
  });

  //   debugger;
  if (idx < 0 && typeof name !== undefined) {
    if (name === undefined) {
      return;
    }
    tree.push({
      ...(_id && !path.length ? { _id } : {}),
      name: name,
      children: [],
    });
    if (path.length !== 0) {
      createNode(path, tree[tree.length - 1].children, _id);
    }
  } else {
    createNode(path, tree[idx].children, _id);
  }
}

export default function parse(
  data: { path: string; _id: string }[]
): TreeNode[] {
  if (!data.length) return [];
  const tree: TreeNode[] = [];
  for (let i = 0; i < data.length; i++) {
    const path: string = data[i].path;
    const _id: string = data[i]._id;
    const split: string[] = path.split("/");
    createNode(split, tree, _id);
  }

  return tree;
}
