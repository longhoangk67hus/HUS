package homework3.ex3;

public class Main {
    public static void main(String[] args) {
        SimpleLinkedList<String> simpleLinkedList = new SimpleLinkedList<>();
        simpleLinkedList.add("123");
        simpleLinkedList.add("456");
        simpleLinkedList.add("789");

        simpleLinkedList.print();
        System.out.println();
        simpleLinkedList.removeTop();
        simpleLinkedList.print();

    }
}
