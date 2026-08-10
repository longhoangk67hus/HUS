package homework4.ex2;

public class Main {
    public static void main(String[] args) {
        LinkedListStack<Integer> stack = new LinkedListStack<>();
        stack.push(5);
        stack.push(3);
        stack.push(1);
        stack.push(2);
        stack.printList();
        System.out.println();
        stack.pop();
        stack.printList();
    }
}
