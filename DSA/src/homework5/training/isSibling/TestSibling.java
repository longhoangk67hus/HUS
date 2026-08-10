package homework5.training.isSibling;

public class TestSibling {
    public static void main(String[] args) {
        isSibling tree = new isSibling();

        tree.root = new isSibling.Node(1);
        tree.root.left = new isSibling.Node(2);
        tree.root.right = new isSibling.Node(3);
        tree.root.left.right = new isSibling.Node(4);
        tree.root.right.left = new isSibling.Node(5);
        tree.root.right.left.right = new isSibling.Node(6);


        tree.sibling(tree.root);
    }
}
