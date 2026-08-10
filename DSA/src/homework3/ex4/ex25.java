package homework3.ex4;

import java.util.Scanner;

public class ex25 {
    public static void main(String[] args) {
        ex25 linkedList = new ex25();
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            linkedList.addBot(sc.nextInt());
        }
        linkedList.printList();
        System.out.println();
        linkedList.set(2,5);
        linkedList.printList();
    }
    class Node {
        int data;
        Node next;
    }
    private Node top = null;
    private Node bot = null;
    private int n = 0;
    public void addBot(int data) {
        Node newNode = new Node();
        newNode.data = data;

        if (top == null) {
            top = newNode;
            bot = newNode;
        } else {
            bot.next = newNode;
            bot = newNode;
        }
        n++;
    }
    public void set(int oldData, int data) {
        if (isEmpty()) {
            throw new ArrayIndexOutOfBoundsException();
        }
        Node currentNode = top;
        for (int j = 0; j < size(); j++) {
            if (currentNode.data == oldData) {
                currentNode.data = data;
            }
            currentNode = currentNode.next;
        }

    }
    public boolean isEmpty() {
        Node currentNode = top;
        for (int i = 0; i < size(); i++) {
            if (currentNode == null) {
                return true;
            }
        }
        return false;
    }
    public int size() {
        return n;
    }
    public void printList() {
        Node node = top;
        while (node != null) {
            System.out.print(node.data + " ");
            node = node.next;
        }
    }
}

