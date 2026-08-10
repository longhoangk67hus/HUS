package homework5.training.bulidtree;

public class TestBuildTree {
    public static void main(String[] args) {
        BuildTreeUseLinkedList tree = new BuildTreeUseLinkedList();
        tree.push(36);
        tree.push(30);
        tree.push(25);
        tree.push(15);
        tree.push(12);
        tree.push(10);

        BuildTreeUseLinkedList.TreeNode root = tree.convertLisToBinary();
        System.out.print("In-order traversal of the binary tree: ");
        tree.inorderTraversal(root);
    }
}
