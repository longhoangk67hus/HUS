package homework7.ex1;

import java.util.Iterator;

public class Test {
    public static void main(String[] args) throws Exception{
        BinarySearchArrayList<Integer> arrayList = new BinarySearchArrayList<>(6);
        SequentialSearchArrayList<Integer> seqArray = new SequentialSearchArrayList<>();

        BinarySearchLinkedList<Integer> linkedList = new BinarySearchLinkedList<>();
        SequentialSearchLinkedList<Integer> seqList = new SequentialSearchLinkedList<>();

        arrayList.add(3);
        arrayList.add(2);
        arrayList.add(5);
        arrayList.add(9);
        arrayList.add(7);
        arrayList.add(1);

        seqArray.add(3);
        seqArray.add(2);
        seqArray.add(5);
        seqArray.add(9);
        seqArray.add(7);
        seqArray.add(1);

        linkedList.add(3);
        linkedList.add(2);
        linkedList.add(5);
        linkedList.add(9);
        linkedList.add(7);
        linkedList.add(1);

        seqList.add(3);
        seqList.add(2);
        seqList.add(5);
        seqList.add(9);
        seqList.add(7);
        seqList.add(1);

        System.out.println("ArrayList: ");
        Iterator iterator1 = arrayList.iterator();
        while (iterator1.hasNext()) {
            String string = iterator1.next().toString();
            System.out.print(string + " ");
        }
        System.out.println();
        System.out.println("9 appears at index " + arrayList.binarySearch(9));
        System.out.println();

        Iterator iterator2 = seqArray.iterator();
        while (iterator2.hasNext()) {
            String string = iterator2.next().toString();
            System.out.print(string + " ");
        }
        System.out.println();
        seqArray.search(1);
        System.out.println(seqArray);
    }
}
