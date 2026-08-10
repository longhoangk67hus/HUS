package homework5.training.bulidtree;

import java.util.LinkedList;
import java.util.Queue;

public class BuildTreeUseLinkedList {
    public static class TreeNode {
        public int data;

        public TreeNode right;
        public TreeNode left;

        public TreeNode(int data, TreeNode right, TreeNode left) {
            this.data = data;
            this.right = right;
            this.left = left;
        }

        public int getData() {
            return this.data;
        }
    }
    public static class ListNode {
        public int data;
        public ListNode next;

        public ListNode(int data) {
            this.data = data;
            next = null;
        }
    }
    public ListNode head;
    public TreeNode root;

    public void push(int data) {
        ListNode newNode = new ListNode(data);
        newNode.next = head;
        head = newNode;
    }
    public TreeNode convertLisToBinary() {
        Queue<TreeNode> queue = new LinkedList<>();

        if (head == null) {
            return null;
        }

        TreeNode root = new TreeNode(head.data, null, null);
        queue.add(root);

        head = head.next;
        while (head != null) {
            TreeNode parent = queue.poll();
            if (head != null) {
                TreeNode leftChild = new TreeNode(head.data, null, null);
                parent.left = leftChild;
                queue.add(leftChild);
                head = head.next;
            }
            if (head != null) {
                TreeNode rightChild = new TreeNode(head.data, null, null);
                parent.right = rightChild;
                queue.add(rightChild);
                head = head.next;
            }
        }
        return root;
    }
    public void inorderTraversal(TreeNode node) {
        if (node != null) {
            inorderTraversal(node.left);
            System.out.print(node.data + " ");
            inorderTraversal(node.right);
        }
    }
}
