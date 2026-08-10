package homework5.codelearn.ex64;

public class Main {
    public static void main(String[] args) {
        GetTreeHeight tree = new GetTreeHeight();

        tree.root = tree.insert(tree.root, 10);
        tree.insert(tree.root, 5);
        tree.insert(tree.root, 15);
        tree.insert(tree.root, 3);
        tree.insert(tree.root, 7);
        tree.insert(tree.root, 12);
        tree.insert(tree.root, 18);

        int level = tree.treeLevel(tree.root);
        System.out.println("Level of tree: " + (level + 1));
    }
}
