package homework3.ex4;

import java.util.Scanner;

public class ex22 {
    class Node{
        int data;
        Node next;
    }

    private Node top = null;
    private Node bot = null;
    private int n = 0;

    public void addFirst(int data) {
        Node newNode = new Node();
        newNode.data = data;

        if (top == null) {
            top = newNode;
            bot = newNode;
        } else{
            newNode.next = top;
            top = newNode;
        }
        n++;
    }
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

    public void addAt(int data, int i) {
        Node newNode = new Node();
        newNode.data = data;

        if (top == null) {
            top = newNode;
            bot = newNode;
        } else {
            Node preNode = null;
            Node current = top;
            for (int j = 0; j < i; j++) {
                preNode = current;
                current = current.next;
            }
            preNode.next = newNode;
            newNode.next = current;
        }
    }
    public int size() {
        return n;
    }

    public static void main(String[] args) {
        ex22 linkedList = new ex22();
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            linkedList.addFirst(sc.nextInt());

        }
        linkedList.addAt(5, 2);
        linkedList.printList();

    }
    public void printList() {
        Node node = top;
        while (node != null) {
            System.out.print(node.data + " ");
            node = node.next;
        }
    }
}
