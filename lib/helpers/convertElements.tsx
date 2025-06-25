type TreeNode = {
  path: string;
  name: string;
  children?: TreeNode[];
};

type Element = {
  id: string;
  name: string;
  isSelectable: boolean;
  children?: Element[];
};

function convertToElements(tree: TreeNode): Element {
  const recurse = (node: TreeNode): Element => {
    const id = node.path; // using path as ID for uniqueness
    const element: Element = {
      id,
      name: node.name,
      isSelectable: true,
    };

    if (node.children) {
      element.children = node.children.map(recurse);
    }

    return element;
  };

  return recurse(tree);
}