package homework3.ex14;

public class DoubleLinkedList {
    class Node {
        int data;
        Node next;
        Node pre;

        Node(int data) {
            this.data = data;
            next = pre = null;
        }
    }

    Node newNode(Node head, int data) {
        Node n = new Node(data);
        if (head == null) {
            head = n;
            return head;
        }
        head.next = n;
        n.pre = head;
        head = n;
        return head;
    }

    void printList(Node node) {
        Node temp = node;
        while (temp.next != null) {
            temp = temp.next;
        }
        while (temp.pre != null) {
            temp = temp.pre;
        }
        while (temp != null) {
            System.out.println(temp.data + " ");
            temp = temp.next;
        }
        System.out.println();
    }
    void addNode(Node head_ref, int pos, int data) {
        Node temp = new Node(data);
        if (head_ref == null) {
            return;
        }
        Node current = head_ref;
        for (int i = 0; i < pos; i++) {
            current = current.next;
            if (current == null) {
                return;
            }
        }
        if (current.next == null) {
            temp.pre = current;
            current.next = temp;
            return;
        }
        temp.next = current.next;
        current.next.pre = temp;
        temp.pre = current;
        current.next = temp;
    }
    Node deleteNode(Node head, int x) {
        if (head == null) {
            return head;
        }
        if (x == 1) {
            head.next.pre = null;
            return head.next;
        }
        Node current = head;
        for (int i = 0; i < x - 2; i++) {
            current = current.next;
            if (current == null) {
                return head;
            }
        }
        if (current.next.next == null) {
            current.next = null;
            return head;
        }
        current.next = current.next.next;
        current.next.pre = current;
        return head;
    }
    Node sortedInsert(Node head, int x) {
        Node newNode = new Node(x);
        if (head == null) {
            head = newNode;
            return head;
        }
        if (head.next == null) {
            if (head.data < x) {
                head.next = newNode;
                newNode.pre = head;
            } else {
                newNode.next = head;
                head.pre = newNode;
                head = newNode;
            }
            return head;
        }
        Node p = head, q = null;
        while (p.data < x) {
            if (p.next == null) {
                p.next = newNode;
                newNode.pre = p;
                return head;
            }
            q = p;
            p = p.next;
        }
        if (q != null) {
            q.next = newNode;
            newNode.pre = q;
            newNode.next = p;
            p.pre = newNode;
        }
        else {
            newNode.next = head;
            head.pre = newNode;
            head = newNode;
        }
        return head;
    }

}
