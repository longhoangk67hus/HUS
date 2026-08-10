package homework3.ex9;

import java.util.Scanner;

public class OccurOfInteger {
    public class Node {
        int data;
        Node next;
        Node(int key) {
            data = key;
            next = null;
        }
    }
    private Node top = null;
    private Node bot = null;
    private int n = 0;
    public static int count(Node head, int search_for) {
        if (head == null) {
            return 0;
        }
        int count = 0;
        while (head != null) {
            if (head.data == search_for) {
                count++;
            }
            head = head.next;
        }
        return count;
    }
    public void addBot(int data) {
        Node newNode = new Node(data);

        if (top == null) {
            top = newNode;
            bot = newNode;
        } else {
            bot.next = newNode;
            bot = newNode;
        }
        n++;
    }
    public void printList() {
        Node node = top;
        while (node != null) {
            System.out.print(node.data + " ");
            node = node.next;
        }
    }

//    public static void main(String[] args) {
//
//        OccurOfInteger linkedList = new OccurOfInteger();
//        Scanner sc = new Scanner(System.in);
//
//        int n = sc.nextInt();
//        for (int i = 0; i < n; i++) {
//            linkedList.addBot(sc.nextInt());
//        }
//
//
//    }

}
