package homework3.ex4;

import java.util.Scanner;

public class ex21 {
    public static void main(String[] args) {
        ex21 linkedList = new ex21();
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            linkedList.addBot(sc.nextInt());
        }
        linkedList.print();
    }
    class Node {
        int data;
        Node next;
    }
    private Node top = null;
    private Node bot = null;
    private int n = 0;

    public void print() {
        Node node = top;
        while (node != null) {
            System.out.print(node.data + " ");
            node = node.next;
        }
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
 }
