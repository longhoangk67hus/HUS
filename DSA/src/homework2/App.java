//package homework2.ex1;
//
//import java.util.Random;
//import java.util.Scanner;
//
//public class App {
//    public static void main(String[] args) {
////        int[] array = {12,11,13,5,6,7};
////        System.out.print("Array: ");
////        printArray(array);
////        SortingContext context = new SortingContext(new SelectionSort());
////        context.performSort(array);
//
//
//
//        Scanner sc = new Scanner(System.in);
//
//        System.out.print("Enter the length of the array: ");
//        int size = sc.nextInt();
//        int[] array2 = generateArray(size, 1, (int) Math.pow(10,1));
//        System.out.print("Array: ");
//        printArray(array2);
//
//        //Test Insertion
//        System.out.println("test Insertion");
//        SortingContext insertionSortContext = new SortingContext(new InsertionSort());
//        insertionSortContext.performSort(array2.clone());
//        System.out.println("=======================================");
//
//        //Test Selection
//        System.out.println("Test Selection");
//        SortingContext selectionSortContext = new SortingContext(new SelectionSort());
//        selectionSortContext.performSort(array2.clone());
//        System.out.println("=======================================");
//
//        //Test Bubble
//        System.out.println("Test Bubble");
//        SortingContext bubbleSortContext = new SortingContext(new BubbleSort());
//        bubbleSortContext.performSort(array2);
//        System.out.println("========================================");
//
//        //Test Merge
//        System.out.println("Test Merge");
//        SortingContext mergeSortContext = new SortingContext(new MergeSort());
//        mergeSortContext.performSort(array2);
//        System.out.println("=========================================");
//
//        //Test Quick
//        System.out.println("Test Quick");
//        SortingContext quickSortContext = new SortingContext(new QuickSort());
//        quickSortContext.performSort(array2);
//        System.out.println("==========================================");
//    }
//
//    public static int[] generateArray(int size, int min, int max) {
//        int[] array = new int[size];
//        Random random = new Random();
//        for (int i = 0; i < size; i++) {
//            array[i] = random.nextInt(max - min + 1) + min;
//        }
//        return array;
//    }
//    public static void printArray(int[] array) {
//        for (int i = 0; i < array.length; i++) {
//            System.out.print(array[i] + " ");
//        }
//        System.out.println();
//    }
//
//}
