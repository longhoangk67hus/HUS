package homework7.training.BT2BST;

import java.util.*;
import java.io.*;

public class BT2BST {
    public class Node {
        int data;
        Node left;
        Node right;

        public Node(int data) {
            this.data = data;
            left = null;
            right = null;
        }
    }

    public Node buildTree(String str) {
        if (str.length() == 0 || str.charAt(0) == 'N') {
            return null;
        }
        String ip[] = str.split(" ");
        Node root = new Node(Integer.parseInt(ip[0]));

        Queue<Node> queue = new LinkedList<>();
        queue.add(root);
        int i = 1;
        while (queue.size() > 0 && i < ip.length) {
            Node currNode = queue.peek();
            queue.remove();
            String currVal = ip[i];
            if (!currVal.equals("N")) {
                currNode.left = new Node(Integer.parseInt(currVal));
                queue.add(currNode.left);
            }
            i++;
            if (i >= ip.length) {
                break;
            }
            currVal = ip[i];
            if (!currVal.equals("N")) {
                currNode.right = new Node(Integer.parseInt(currVal));
                queue.add(currNode.right);
            }
            i++;
        }
        return root;
    }

    public static void printInorder(Node root) {
        if (root == null) {
            return;
        }
        printInorder(root.left);
        System.out.print(root.data + " ");
        printInorder(root.right);
    }

    Queue<Integer> queue = new PriorityQueue<>();

    Node binaryTreeToBST(Node root) {
        inputArr(root);
        inputBST(root);
        return root;
    }

    void inputArr(Node root) {
        if (root == null) {
            return;
        }
        queue.add(root.data);
        inputArr(root.left);
        inputArr(root.right);
    }

    void inputBST(Node bst) {
        if (bst == null) {
            return;
        }
        inputBST(bst.left);
        bst.data = queue.poll();
        inputBST(bst.right);
    }
}
